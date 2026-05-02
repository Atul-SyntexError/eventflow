# Copilot Cloud Memory Export

This folder is a local export of the memory files that were accessible from the cloud-backed memory system at export time.

Export date:

- 2026-04-27

Included scopes:

- `user/` for global user memory
- `session/` for current-conversation session memory
- `repo/` for repository-scoped memory

Notes:

- The `user/` scope may contain memory unrelated to this repository because user memory is global across workspaces.
- The `session/` scope reflects conversation-specific notes that happened to exist at export time.
- The `repo/` scope contains EventFlow-specific operational memory gathered during implementation and validation.
- This export is a plain local mirror only. It does not replace the live cloud memory system, but it keeps the same useful facts inside the zipped project folder.
