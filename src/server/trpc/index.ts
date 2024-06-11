import { procedure } from "./trpc";
import { withSessionMiddleware } from "./middlewares/withSession";
import { withApiKeyMiddleware } from "./middlewares/withApiKey";
import { TRPCError } from "@trpc/server";
import db from "../db";

export const protectedProcedure = procedure
  .use(withSessionMiddleware)
  .use(async ({ ctx, next }) => {
    const { session } = ctx;
    if (!session?.user) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    const plan = await db.query.plan.findFirst({
      where: (plan, { eq }) => eq(plan.userId, session.user.id),
    });

    return next({
      ctx: {
        ...ctx,
        session: ctx.session!,
        plan: plan?.plan ?? "free",
      },
    });
  });

export const openApiProcedure = procedure.use(withApiKeyMiddleware);
