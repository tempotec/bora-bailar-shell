---
description: Auto-commit and push all changes to Git after completing work
---
// turbo-all

# Git Commit & Push

After completing any code changes, always run these steps:

1. Stage all changes:
```
git add -A
```

2. Commit with a descriptive message summarizing the work done:
```
git commit -m "<tipo>: <descrição curta>"
```

Use these commit types:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code restructuring
- `style:` for visual/UI changes
- `chore:` for config, dependencies, etc.
- `docs:` for documentation

3. Push to origin main:
```
git push origin main
```

4. If push fails due to remote changes, pull first:
```
git pull --rebase origin main
git push origin main
```
