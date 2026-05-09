/// <reference path="./.sst/platform/config.d.ts" />

const COMMON_TAGS = {
  Project: "putio-design",
  ManagedBy: "SST",
  Repo: "putdotio/putio-design",
} as const;

export default $config({
  app(input) {
    const stage = input?.stage ?? "dev";
    const awsProfile =
      process.env.AWS_ACCESS_KEY_ID || process.env.AWS_WEB_IDENTITY_TOKEN_FILE
        ? undefined
        : process.env.AWS_PROFILE;

    return {
      name: "putio-design",
      removal: stage === "production" ? "retain" : "remove",
      protect: stage === "production",
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-1",
          ...(awsProfile ? { profile: awsProfile } : {}),
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
