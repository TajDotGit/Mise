# Security Policy

Mise is a private household tool developed in a public repository. Everything in
this repo is world-readable, so it must never contain secrets.

## Reporting a vulnerability

Please report vulnerabilities **privately** using GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability):
open the repository's **Security** tab and choose **Report a vulnerability**.

Do not open a public issue, pull request, or discussion for a security problem.
Include steps to reproduce and the impact you expect. You should get an
acknowledgement within a week.

## No secrets in the repo

- No API keys, tokens, passwords, connection strings, project URLs, or real email
  addresses may be committed — not in code, comments, docs, tests, mock data, or
  commit messages.
- Configuration is read only through `import.meta.env` and validated at startup.
  Real values live in git-ignored `.env.local` files or in the hosting provider's
  settings. `.env.example` lists variable names with empty values only.
- A pre-commit hook and CI both run [gitleaks](https://github.com/gitleaks/gitleaks).
  If a secret is ever committed, treat it as compromised: revoke and rotate it
  first, then remove it from history.

See [docs/security-plan.md](docs/security-plan.md) for the plan for later phases.
