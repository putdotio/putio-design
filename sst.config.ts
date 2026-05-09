/// <reference path="./.sst/platform/config.d.ts" />

const COMMON_TAGS = {
  Project: "putio-design",
  ManagedBy: "SST",
  Repo: "putdotio/putio-design",
} as const;

export default $config({
  app(input) {
    const stage = input?.stage ?? "dev";

    return {
      name: "putio-design",
      removal: stage === "production" ? "retain" : "remove",
      protect: stage === "production",
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-1",
          profile: process.env.AWS_PROFILE ?? "default",
          defaultTags: {
            tags: {
              ...COMMON_TAGS,
              Stage: stage,
            },
          },
        },
      },
    };
  },
  async run() {
    const { createDesignSite } = await import("./infra/site.js");

    createDesignSite();
  },
});
