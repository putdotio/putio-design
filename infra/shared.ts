/// <reference path="../.sst/platform/config.d.ts" />

export const PUTIO_ROUTE53_ZONE_ID = "Z189USQZYRL4QI";

export const PUTIO_WILDCARD_CERT_ARN =
  "arn:aws:acm:us-east-1:068203738331:certificate/96ea5e11-d402-48f8-9676-f1a4d1848e1c";

export function putioDns() {
  return sst.aws.dns({ zone: PUTIO_ROUTE53_ZONE_ID });
}

export function domainForStage(stage: string): string {
  if (stage === "production") return "design.put.io";
  return `design-${stage}.put.io`;
}
