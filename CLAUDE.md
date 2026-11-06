# echoo – agent instructions

## Human in the loop for git

- Never run `git commit`, `git push`, `git tag` or `gh release create`.
- Make changes in the working tree, show what changed, and stop. The human
  reviews, commits and pushes. Every push to `main` creates a release, so a
  push is a deployment.
- These commands are also denied in `.claude/settings.json`; do not work
  around that.

## Project

- Nuxt 4 app (`app/`) with a Nitro server route (`server/routes/api.ts`) that
  returns a per-process random name plus the pod hostname.
- Package manager and runtime: bun. `bun install`, `bun run dev`,
  `bun run build`.
- Container: multi-stage `Dockerfile`, built for linux/amd64 and linux/arm64 by
  `.github/workflows/release.yml`.
- Releases are numbered `v<N>`; CI derives N from the latest tag. Don't create
  tags by hand.

## Design

Follow https://dekeijzer.xyz/style-guide.md. All colors, sizes and spacing come
from `app/assets/css/design-tokens.css`: no hardcoded values, no borders,
shadows or rounded corners, Inter for UI, JetBrains Mono for data and labels,
purple for actions, pink only for errors, teal only for healthy states.
