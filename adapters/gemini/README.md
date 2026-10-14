# Gemini Adapter

`GEMINI.md` is the repository instruction entry point. `.gemini/commands/` contains thin command adapters that call the provider-neutral workflows in `core/workflows/`.

Gemini CLI evolves quickly. Keep provider-specific syntax here and keep engineering policy in `core/` so upgrades do not fork your operating model. Review `settings.example.json` against the installed CLI before copying settings.
