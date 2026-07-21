declare module '@codejamboree/web-request-queue' {
  export const webRequest: {
    toFile(path: string, url: string): Promise<void>;
  };
}
