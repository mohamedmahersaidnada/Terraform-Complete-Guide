# Content standard

Every lesson includes objectives, prerequisites, explanation, linked runnable example where applicable, shell-labeled commands, expected results, an exercise with solution rationale, troubleshooting, cleanup where applicable, references, tested versions and review date. Reference-only lessons state why no lab applies.

Use one descriptive H1, ordered heading levels, descriptive local links and fenced code with language labels. Use relative links so GitHub and the site share canonical content. Give PowerShell and POSIX variants when syntax differs.

Every lab declares cloud authentication and cost requirements, exact root directory, provider/CLI constraints, expected plan, cleanup and residual checks. Never label static validation as a deployment test. Do not publish private state or plans. Keep examples as canonical runnable files, linking from lessons rather than duplicating large configurations.

Inventory status is draft, reviewed or blocked. Reviewed means an editor checked the lesson contract; its validation field must still distinguish unexecuted cloud operations. Add new lessons to the inventory. Record owner, review date and limitations.

Inventory schema version 1 requires title, owner, status, path and validation. Validation is `unverified`, `reference`, `local`, `mocked` or `live`. Reviewed pages require a real ISO review date and a repository-local evidence file. Reference guidance may share a lab while explicitly listing unexecuted examples in its evidence. Drafts remain unverified until reviewed.

The dependency-free documentation checker enforces basic structure, local paths, generated heading fragments, and explicit/collapsed reference links. It deliberately does not implement every CommonMark/HTML link form (including shortcut references and raw HTML). Prefer inline links; external availability is advisory and never conflated with local correctness. A production site build must also validate the rendered links.
