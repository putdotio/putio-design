import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import * as AWS from "@alchemy.run/aws";
import * as Alchemy from "alchemy";
import { Stage } from "alchemy/Stage";
import * as Effect from "effect/Effect";

const domain = "design.put.io";
const hostedZoneId = required("AWS_ROUTE53_ZONE_ID");
const tags = { Project: "putio-design", Repo: "putdotio/putio-design", ManagedBy: "Alchemy" };

export default Alchemy.Stack(
  "putio-design",
  {
    providers: AWS.providers(),
    state: AWS.state({ name: "putio-frontend" }),
  },
  Effect.gen(function* () {
    const stage = yield* Stage;
    if (stage !== "production") {
      return yield* Effect.die(`putio-design only deploys the production stage, not ${stage}.`);
    }

    const site = yield* AWS.Website.StaticSite("Site", {
      path: ".",
      build: {
        command: "cp -R system .site",
        output: ".site",
        env: { DESIGN_SOURCE_SHA: process.env.GITHUB_SHA ?? "local" },
      },
      bucketName: "putio-design-production-068203738331",
      spa: true,
      assets: {
        fileOptions: [
          { files: nonHtmlFiles(), cacheControl: "public,max-age=300,s-maxage=31536000" },
        ],
      },
      invalidation: { paths: "all", wait: true },
      domain: { name: domain, cert: required("AWS_WILDCARD_CERT_ARN"), hostedZoneId },
      tags,
    });

    const { distribution } = site;
    if (!distribution) return yield* Effect.die("design.put.io needs its own distribution.");

    yield* AWS.Route53.Record("AliasRecordAAAA", {
      hostedZoneId,
      name: domain,
      type: "AAAA",
      aliasTarget: {
        hostedZoneId: distribution.hostedZoneId,
        dnsName: distribution.domainName,
      },
    });

    return { url: site.url };
  }),
);

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set for the design deploy.`);
  return value;
}

function nonHtmlFiles() {
  return readdirSync("system", { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.endsWith(".html"))
    .map((entry) => relative("system", join(entry.parentPath, entry.name)));
}
