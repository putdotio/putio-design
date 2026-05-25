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
pnpm dev
```

Open the printed URL and browse the design-system guide.

## Validate

Before opening a pull request:

- Run `pnpm verify`
- Load the affected guide or preview page in a browser at the viewport listed in the [Agent guide](AGENTS.md)
- Confirm fonts load (GT America and Berkeley Mono should render, not system fallbacks)
- Keep screenshots, sample filenames, and docs content public-safe and content-agnostic

## Conventions

Prototype naming, viewports, typography, sacred yellow, icons, and design variants are documented in the [Agent guide](AGENTS.md). Read it before adding new prototypes.

## Deploy

`design.put.io` is deployed with SST to AWS S3, CloudFront, and Route 53.

```bash
pnpm deploy:production
```

Only the `production` SST stage is supported. Do not create preview, spike, or
staging stages for this repo.

GitHub Actions production deploys use AWS OIDC with the `AWS_DEPLOY_ROLE_ARN`
repository variable.

Deploys also read `DESIGN_DOMAIN`, `AWS_REGION`, `AWS_ROUTE53_ZONE_ID`, and
`AWS_WILDCARD_CERT_ARN` from repository variables.

## Pull Requests

- Keep changes focused and explicit.
- Read `DESIGN.md`, `system/README.md`, and `docs/DISTRIBUTION.md` before changing public design-system behavior.
- Use anonymous IDs such as `User 01` and raw filename examples from `AGENTS.md`.
