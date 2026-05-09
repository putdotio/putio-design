/// <reference path="../.sst/platform/config.d.ts" />

import { PUTIO_WILDCARD_CERT_ARN, domainForStage, putioDns } from "./shared.js";

export function createDesignSite() {
  const domainName = domainForStage($app.stage);

  return new sst.aws.StaticSite("putio-design", {
    path: "prototypes",
    domain: {
      name: domainName,
      cert: PUTIO_WILDCARD_CERT_ARN,
      dns: putioDns(),
    },
  });
}
