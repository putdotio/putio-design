/// <reference path="../.sst/platform/config.d.ts" />

import { DESIGN_DOMAIN, PUTIO_WILDCARD_CERT_ARN, putioDns } from "./shared.js";

export function createDesignSite() {
  return new sst.aws.StaticSite("putio-design", {
    path: "prototypes",
    domain: {
      name: DESIGN_DOMAIN,
      cert: PUTIO_WILDCARD_CERT_ARN,
      dns: putioDns(),
    },
  });
}
