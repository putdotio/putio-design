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
- Compare against the relevant workspace specs and [reference screenshots](https://github.com/putdotio/putio-frontend-workspace/tree/main/docs/references/images)

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
- Read the relevant workspace spec before designing a new screen.
- Check [workspace reference images](https://github.com/putdotio/putio-frontend-workspace/tree/main/docs/references/images) before designing platform screens.
