import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, lstatSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Deliberately bounded offline policy, not an entropy scanner or CVE database.
// Findings never include matched values or source lines.
export function inspectFile(path, text) {
  path = path.replaceAll('\\', '/');
  const findings = [];
  const add = rule => findings.push(`${path}: ${rule}`);
  if (/^(?:\.aws|\.azure|\.config\/gcloud)\//.test(path)) add('local cloud configuration must not be committed');
  if (/(?:^|\/)(?:\.env(?:\..*)?|[^/]*\.tfstate(?:\..*)?|[^/]*\.(?:tfplan|plan|tfvars(?:\.json)?|pem|key)|\.terraformrc|terraform\.rc|credentials\.json|application_default_credentials\.json)$/.test(path) && !/\.(?:example|sample)$/.test(path)) add('private artifact');
  for (const [rule, pattern] of [
    ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
    ['AWS access key identifier', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
    ['Google API key', /\bAIza[A-Za-z0-9_-]{35}\b/],
  ]) if (pattern.test(text)) add(rule);
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(path)) {
    if (!/^permissions:\s*\r?\n  contents: read\s*$/m.test(text)) add('workflow needs explicit read-only contents permission');
    if (/\b(?:pull_request_target|workflow_run)\s*:/.test(text)) add('privileged trigger requires separate security design');
    if (/\b(?:write-all|secrets\.|id-token\s*:\s*write|contents\s*:\s*write)\b/.test(text)) add('credentialed workflow requires separate security design');
    if (/^[ \t]+(?!id-token:|contents:)[\w-]+:[ \t]*write[ \t]*(?:#.*)?$/m.test(text)) add('write permission requires separate security design');
    for (const match of text.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
      if (!/^[\w.-]+\/[\w./-]+@[a-f0-9]{40}$/.test(match[1])) add('action must use a full immutable commit');
    }
    // This bounded policy accepts the repository's block-style YAML only.
    // Validate each job and checkout separately: one safe job cannot hide another.
    const jobs = text.match(/^jobs:[ \t]*\r?\n([\s\S]*?)(?=^\S|$(?![\s\S]))/m)?.[1] ?? '';
    const blocks = [...jobs.matchAll(/^  [\w-]+:\s*\r?\n([\s\S]*?)(?=^  [\w-]+:|^\S|$(?![\s\S]))/gm)];
    if (!blocks.length) add('workflow needs block-style jobs for policy inspection');
    for (const job of blocks) {
      if (!/^    timeout-minutes: [1-9]\d*\s*$/m.test(job[1])) add('each job needs bounded literal timeout');
    }
    for (const step of text.matchAll(/^( *)(?:- )?uses: actions\/checkout@[^\n]+\n([\s\S]*?)(?=^\s*- |^ {0,4}\S|$(?![\s\S]))/gm)) {
      if (!/^\s+persist-credentials: false\s*$/m.test(step[2])) add('each checkout must disable persisted credentials');
    }
  }
  return findings;
}

export function inspectDependencies(root, paths) {
  const findings = [];
  for (const path of paths.filter(p => /(?:^|\/)package\.json$/.test(p))) {
    const folder = dirname(path);
    const lock = join(folder, 'package-lock.json').replaceAll('\\', '/');
    if (!paths.includes(lock) || !existsSync(resolve(root, lock))) {
      findings.push(`${path}: npm manifest requires committed lockfile`);
      continue;
    }
    try {
      const data = JSON.parse(readFileSync(resolve(root, lock), 'utf8'));
      if (data.lockfileVersion < 2 || !data.packages) throw new Error();
      for (const [name, dependency] of Object.entries(data.packages)) {
        if (!name || dependency.link) continue;
        if (!dependency.integrity || !/^https:\/\//.test(dependency.resolved ?? '')) findings.push(`${lock}: registry dependency needs HTTPS origin and integrity`);
      }
    } catch { findings.push(`${lock}: invalid npm lockfile`); }
  }
  return findings;
}

export function checkSecurity(root = process.cwd()) {
  const paths = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))];
  const findings = [];
  for (const path of paths) {
    const full = resolve(root, path);
    if (!existsSync(full)) continue; // A staged deletion has no working-tree content.
    if (lstatSync(full).isSymbolicLink()) { findings.push(`${path}: symlinks require manual artifact review`); continue; }
    const buffer = readFileSync(full);
    findings.push(...inspectFile(path, buffer.includes(0) ? '' : buffer.toString('utf8')));
  }
  findings.push(...inspectDependencies(root, paths));
  return { findings, files: paths.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { findings, files } = checkSecurity();
  if (findings.length) { console.error(findings.join('\n')); process.exitCode = 1; }
  else console.log(`Security policy passed: ${files} working-tree files; bounded credential patterns, artifact paths, workflow pins, npm lock integrity. No history/CVE scan claimed.`);
}
