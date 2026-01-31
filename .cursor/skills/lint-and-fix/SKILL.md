---
name: lint-and-fix
description: Run linters for both backend (ruff) and frontend (eslint), inspect output, and automatically fix any fixable issues. Use when the user asks to run linters, check code quality, fix linting issues, or before committing code changes.
---

# Lint and Fix

Run linters for both backend and frontend, inspect issues, and fix any auto-fixable problems.

## Workflow

1. **Run backend linter** (ruff)
2. **Run frontend linter** (eslint)
3. **Inspect output** for errors and warnings
4. **Fix auto-fixable issues** automatically
5. **Report remaining issues** that require manual fixes

## Backend Linting

The backend uses `ruff` for linting and formatting.

**Commands:**
```bash
cd backend
ruff check --fix src
ruff format src
```

**What it does:**
- `ruff check --fix`: Checks for linting issues and automatically fixes what it can
- `ruff format`: Formats code according to project standards

**Expected output:**
- If issues are fixed: Shows what was fixed
- If issues remain: Lists remaining issues that need manual attention
- If clean: No output or "All checks passed"

## Frontend Linting

The frontend uses `eslint` for linting.

**Commands:**
```bash
cd frontend
npm run lint -- --fix
```

**What it does:**
- Runs eslint with auto-fix enabled
- Fixes formatting and simple rule violations automatically

**Expected output:**
- If issues are fixed: Shows what was fixed
- If issues remain: Lists remaining issues with file paths and line numbers
- If clean: "✔ No ESLint warnings or errors"

## Execution Steps

1. **Run backend linter:**
   ```bash
   cd backend && ruff check --fix src && ruff format src
   ```

2. **Run frontend linter:**
   ```bash
   cd frontend && npm run lint -- --fix
   ```

3. **Inspect results:**
   - Review any remaining errors or warnings
   - Note which files have issues
   - Identify patterns in remaining issues

4. **Fix remaining issues:**
   - For backend: Manually address any ruff errors that couldn't be auto-fixed
   - For frontend: Manually address any eslint errors that couldn't be auto-fixed
   - Use `read_lints` tool to get detailed diagnostics if needed

5. **Verify fixes:**
   - Re-run linters to confirm all issues are resolved
   - Check that no new issues were introduced

## Handling Remaining Issues

If linters report issues that can't be auto-fixed:

1. **Read detailed diagnostics:**
   ```bash
   read_lints paths/to/problematic/files
   ```

2. **Fix systematically:**
   - Address one file at a time
   - Fix errors before warnings
   - Re-run linter after each fix to verify

3. **Common fixes:**
   - **Backend (ruff)**: Import sorting, unused imports, line length, type hints
   - **Frontend (eslint)**: Unused variables, missing dependencies in hooks, TypeScript errors

## Notes

- Always run from the project root or navigate to the appropriate directory
- Both linters support auto-fix, so most issues should be resolved automatically
- If a linter reports many issues, fix them incrementally and re-run
- Some issues may require code changes beyond formatting (e.g., logic fixes for TypeScript errors)
