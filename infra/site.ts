/// <reference path="../types/sst.d.ts" />

import { DESIGN_DOMAIN, AWS_WILDCARD_CERT_ARN, putioDns } from "./shared.js";

export function createDesignSite() {
  return new sst.aws.StaticSite("putio-design", {
    path: "system",
    // File names carry no content hash, so browsers must revalidate. CloudFront keeps its copy until the
    // invalidation that runs on every deploy.
    assets: {
      fileOptions: [
        { files: "**", cacheControl: "public,max-age=300,s-maxage=31536000" },
        { files: "**/*.html", cacheControl: "max-age=0,no-cache,no-store,must-revalidate" },
      ],
    },
    domain: {
      name: DESIGN_DOMAIN,
      cert: AWS_WILDCARD_CERT_ARN,
      dns: putioDns(),
    },
  });
}
