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

    if (stage !== "production") {
      throw new Error("putio-design only supports the production SST stage.");
    }

    return {
      name: "putio-design",
      removal: "retain",
      protect: true,
      home: "aws",
      providers: {
        aws: {
          region: process.env.AWS_REGION ?? "eu-west-1",
          ...(awsProfile ? { profile: awsProfile } : {}),
          defaultTags: {
            tags: {
              ...COMMON_TAGS,
              Stage: "production",
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
