# Known Gaps

| ID | Gap | Evidence | Impact | Priority | Owner / Next Action |
| --- | --- | --- | --- | --- | --- |
| G01 | Static documentation site | Documentation currently viewed via GitHub markdown | Suboptimal learner browsing and search UX | Medium | Evaluate MkDocs Material or Starlight generator |
| G02 | Hosted CI execution evidence | CI executed locally; GitHub Actions remote run pending push | Unverified hosted runner network and token policies | Medium | Trigger and record hosted CI run upon push |
| G03 | Automated external security scanners | Scans use bounded offline regex policies | Potential edge-case CVEs or deep history leakage | Medium | Integrate Actionlint and Trivy/Checkov in CI |
| G04 | Live cloud sandbox apply | Cloud provider labs verified via reference contracts | Readers require explicit sandbox credentials for live apply | Low | Execute sandboxed live labs when budget authorized |
