declare const sst: {
  readonly aws: {
    readonly StaticSite: new (
      name: string,
      args: {
        readonly path: string;
        readonly domain: {
          readonly name: string;
          readonly cert: string;
          readonly dns: unknown;
        };
      },
    ) => unknown;
    readonly dns: (args: { readonly zone: string }) => unknown;
  };
};

declare const $config: (config: {
  readonly app: (input: { readonly stage?: string }) => unknown;
  readonly run: () => Promise<void> | void;
}) => unknown;
