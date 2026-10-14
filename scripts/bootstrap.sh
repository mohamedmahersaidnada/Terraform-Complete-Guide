#!/usr/bin/env bash
set -euo pipefail
if [[ $# -lt 1 ]]; then echo "Usage: $0 /path/to/project"; exit 2; fi
SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$1" && pwd)"
for item in core adapters .claude .gemini project-memory docs CLAUDE.md GEMINI.md; do
  if [[ -e "$TARGET/$item" ]]; then echo "SKIP existing: $TARGET/$item"; continue; fi
  cp -a "$SOURCE/$item" "$TARGET/$item"
  echo "INSTALLED: $TARGET/$item"
done
echo "Done. Review CLAUDE.md, GEMINI.md, core/OPERATING_SYSTEM.md and project-memory before implementation."
