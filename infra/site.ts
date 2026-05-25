/// <reference path="../types/sst.d.ts" />

import { DESIGN_DOMAIN, AWS_WILDCARD_CERT_ARN, putioDns } from "./shared.js";

export function createDesignSite() {
  return new sst.aws.StaticSite("putio-design", {
    path: "system",
    domain: {
      name: DESIGN_DOMAIN,
      cert: AWS_WILDCARD_CERT_ARN,
      dns: putioDns(),
    },
  });
}
