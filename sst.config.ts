/// <reference path="./.sst/platform/config.d.ts" />

const COMMON_TAGS = {
  Project: "putio-design",
  ManagedBy: "SST",
  Repo: "putdotio/putio-design",
  costcenter: "frontend",
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
          region: requiredEnv("AWS_REGION"),
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

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set for putio-design infrastructure deploys.`);
  }
  return value;
}
