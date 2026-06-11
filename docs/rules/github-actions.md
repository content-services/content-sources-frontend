# GitHub Actions, secrets, and forked pull requests

## Secrets made available as environment variables

Secrets used in GitHub Actions workflows are stored in a shared secret store and not visible to agents. They are made available in CI as environment variables. Contact someone in the content-sources team for guidance.


## Secrets and variables on fork PRs

These repositories are **public**, but GitHub still **does not** pass GitHub repository **secrets** or **variables** to workflows that run for a pull request **opened from a fork**. That is a platform security rule, not something this repo can override.

When CI runs for a fork PR:

- `${{ secrets.* }}` is empty
- `${{ vars.* }}` is empty
- Any step that needs those values (for example optional uploads or integrations) will fail or no-op

### Workaround when you need to test secrets in CI

Push your branch to the **upstream** remote (original organization repo) and open the PR **from a branch on that repo**, not from your fork:

```bash
git remote add upstream https://github.com/content-services/content-sources-frontend.git
# if upstream already exists, fetch and push your branch
git push upstream your-branch-name
```

Then open the pull request from your branch into the default branch.

### Examples of secret-dependent behavior

Anything wired to `${{ secrets.* }}` or `${{ vars.* }}` in `.github/workflows/` is affected. For example, coverage or reporting keys if those are stored as secrets.
