# Multi-Provider Operating Pattern

## Recommended pattern
Use one provider as the active writer and another as the independent reviewer for material changes.

### Example A
Claude Code: discovery + plan + implementation
Gemini CLI: read-only cross-provider review
Claude Code: accepted fixes + retest
Human: release approval where required

### Example B
Gemini CLI: implementation
Claude Code: independent review/security challenge
Gemini CLI: fixes
Human: release approval

## Disagreement protocol
Do not average answers. Ask each provider for evidence. Classify disagreement as factual, requirement interpretation, design trade-off, or risk tolerance. Resolve factual questions with repository/tool evidence; escalate material design/risk choices to the human owner and record the decision.
