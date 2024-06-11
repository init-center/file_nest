import { createAppSchema } from "@/server/db/validate-schema";
import { protectedProcedure } from "../..";
import { router } from "../../trpc";
import db from "@/server/db";
import { apps } from "@/server/db/schemas/apps";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appsRouter = router({
  createApp: protectedProcedure
    .input(createAppSchema)
    .mutation(async ({ ctx, input }) => {
      const isFreePlan = ctx.plan;

      if (isFreePlan) {
        const appCountResult = await db
          .select({ count: count() })
          .from(apps)
          .where(
            and(eq(apps.userId, ctx.session.user.id), isNull(apps.deletedAt))
          );

        const appCount = appCountResult[0].count;

        const FREE_PLAN_MAX_APPS = process.env.NEXT_PUBLIC_FREE_PLAN_MAX_APPS ?? 1;

        if (appCount >= FREE_PLAN_MAX_APPS) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Your plan does not allow more than ${FREE_PLAN_MAX_APPS} apps`,
          });
        }
      }

      const result = await db
        .insert(apps)
        .values({
          ...input,
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        })
        .returning();
      return result[0];
    }),
  listApps: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.apps.findMany({
      where: (apps, { eq, and, isNull }) =>
        and(eq(apps.userId, ctx.session.user.id), isNull(apps.deletedAt)),
      orderBy: [desc(apps.createdAt)],
    });
    return result;
  }),
  changeStorage: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        storageId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const storage = await db.query.storageConfiguration.findFirst({
        where: (storages, { eq, and }) =>
          and(
            eq(storages.id, input.storageId),
            eq(storages.userId, ctx.session.user.id)
          ),
      });

      if (!storage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Storage not found",
        });
      }

      await db
        .update(apps)
        .set({
          storageId: input.storageId,
        })
        .where(
          and(eq(apps.id, input.appId), eq(apps.userId, ctx.session.user.id))
        );
    }),
});
