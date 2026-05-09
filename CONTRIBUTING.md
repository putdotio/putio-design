# Contributing

Thanks for contributing to put.io design.

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

Prototypes are self-contained HTML files that pull fonts from `static.put.io` at runtime — internet access is needed for type to render correctly.

## Run Locally

```bash
npx serve prototypes
```

Open the printed URL and browse the gallery index.

## Validate

Prototypes are visual artefacts; there are no automated checks. Before opening a pull request:

- Load the prototype in a browser at the viewport listed in the [Agent guide](AGENTS.md)
- Confirm fonts load (GT America and Berkeley Mono should render, not system fallbacks)
- Compare against the relevant [Specs](docs/specs) and [Reference screenshots](docs/references/images)

## Conventions

Prototype naming, viewports, typography, sacred yellow, icons, and design variants are documented in the [Agent guide](AGENTS.md). Read it before adding new prototypes.

## Deploy

`design.put.io` is deployed with SST to AWS S3, CloudFront, and Route 53.

Use a spike stage before changing production:

```bash
pnpm deploy:spike
```

Production deploys use:

```bash
pnpm deploy:production
```

GitHub Actions production deploys use AWS OIDC with the `AWS_DEPLOY_ROLE_ARN`
repository variable. If that variable is unset, the deploy job skips.

## Pull Requests

- Keep changes focused and explicit.
- Read the relevant spec before designing a new screen.
- Check `docs/references/images/` screenshots before designing platform screens.
