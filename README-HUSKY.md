# Husky Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to run automated checks on git operations.

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

This automatically runs the `prepare` script which initializes Husky.

### 2. Verify Installation

Check that the `.husky` folder contains the hook files:
- `commit-msg` - validates commit message format
- `pre-commit` - runs lint-staged on staged files
- `pre-push` - runs linting before push

---

## Git Hooks Overview

| Hook | Trigger | Action |
|------|---------|--------|
| `pre-commit` | Before each commit | Runs `lint-staged` on staged files |
| `commit-msg` | After writing commit message | Validates commit message format |
| `pre-push` | Before pushing to remote | Runs `pnpm run lint` |

---

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages must follow this format:

```
type(scope): description
```

### Valid Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature or bug fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `ci` | CI/CD configuration changes |
| `chore` | Other changes (maintenance, tooling) |
| `revert` | Reverting a previous commit |

### Examples

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix with scope
git commit -m "fix(api): resolve null pointer exception"

# Documentation
git commit -m "docs: update installation instructions"

# Breaking change
git commit -m "feat!: redesign API endpoints"
```

---

## Bypassing Hooks

Sometimes you need to skip hooks (e.g., WIP commits, emergency fixes). Use these flags:

### Skip All Hooks

```bash
# Skip pre-commit and commit-msg hooks
git commit -m "message" --no-verify

# Short form
git commit -m "message" -n
```

### Skip Pre-Push Hook

```bash
git push --no-verify
```

### Skip Specific Scenarios

```bash
# Amend without running hooks
git commit --amend --no-verify

# Rebase without running hooks
git rebase --continue --no-verify
```

> **Warning**: Use `--no-verify` sparingly. Hooks exist to maintain code quality.

---

## Troubleshooting

### Hooks Not Running

1. Ensure Husky is installed:
   ```bash
   pnpm install
   ```

2. Manually initialize Husky:
   ```bash
   pnpm exec husky
   ```

3. Check if `.git` directory exists:
   ```bash
   git status
   ```

### Permission Denied (macOS/Linux)

Make hook files executable:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Commit Message Rejected

Ensure your message follows the conventional format:
```bash
# Wrong
git commit -m "fixed bug"

# Correct
git commit -m "fix: resolve login validation error"
```

---

## Disabling Husky Temporarily

Set the `HUSKY` environment variable to `0`:

```bash
# Single command
HUSKY=0 git commit -m "message"

# For entire session (bash/zsh)
export HUSKY=0

# Windows PowerShell
$env:HUSKY=0
```
