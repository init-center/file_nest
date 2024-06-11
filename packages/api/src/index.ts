import {
  httpBatchLink,
  createTRPCClient,
  type HTTPHeaders,
} from "@trpc/client";
import type { OpenApiRouter } from "./open-api-router.dts";

const endpoint = "https://file-nest.init.center/api/open";

export const apiClient = createTRPCClient<OpenApiRouter>({
  links: [
    httpBatchLink({
      url: endpoint,
    }),
  ],
});

export interface ApiClientOptions {
  apiKey?: string;
  signedToken?: string;
}

export const createApiClient = ({ apiKey, signedToken }: ApiClientOptions) => {
  const headers: HTTPHeaders = {};
  if (apiKey) {
    headers["API-Key"] = apiKey;
  }
  if (signedToken) {
    headers["Signed-Token"] = signedToken;
  }

  return createTRPCClient<OpenApiRouter>({
    links: [
      httpBatchLink({
        url: endpoint,
        headers,
      }),
    ],
  });
};
