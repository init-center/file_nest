import { AppRouter } from "@/server/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const trpcPureClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/trpc`,
    }),
  ],
});
