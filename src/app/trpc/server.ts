import { appRouter } from "@/server/trpc/router";
import { createCallerFactory } from "@/server/trpc/trpc";
export const trpcServerCaller = createCallerFactory(appRouter);