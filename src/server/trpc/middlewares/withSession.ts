import { auth } from "@/server/auth";
import { createTRPCMiddleware } from "../trpc";

export const withSessionMiddleware = createTRPCMiddleware(async ({ next }) => {
  const session = await auth();
  return next({
    ctx: {
      session,
    },
  });
});
