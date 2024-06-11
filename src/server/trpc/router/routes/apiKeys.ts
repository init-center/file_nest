import { protectedProcedure } from "../..";
import { router } from "../../trpc";
import db from "@/server/db";
import { desc } from "drizzle-orm";
import { createApiKeySchema } from "@/server/db/validate-schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { apiKeys } from "@/server/db/schemas/apiKeys";

export const apiKeysRouter = router({
  listApiKeys: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await db.query.apiKeys.findMany({
        where: (apiKeys, { eq, and, isNull }) =>
          and(eq(apiKeys.appId, input.appId), isNull(apiKeys.deletedAt)),
        orderBy: [desc(apiKeys.createdAt)],
        columns: {
          key: false,
        },
      });
      return result;
    }),
  createApiKey: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      const existName = await db.query.apiKeys.findFirst({
        where: (apiKeys, { eq, and }) =>
          and(eq(apiKeys.name, input.name), eq(apiKeys.appId, input.appId)),
      });

      if (existName) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Api key with this name already exists",
        });
      }

      const result = await db
        .insert(apiKeys)
        .values({
          name: input.name,
          appId: input.appId,
          key: crypto.randomUUID(),
          clientId: crypto.randomUUID(),
        })
        .returning();
      return result[0];
    }),
  requestSecretKey: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const apiKey = await db.query.apiKeys.findFirst({
        where: (apiKeys, { eq, isNull, and }) =>
          and(eq(apiKeys.id, input), isNull(apiKeys.deletedAt)),
        with: {
          app: {
            with: {
              user: true,
            },
          },
        },
      });

      if (apiKey?.app.user.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this api key",
        });
      }

      return apiKey.key;
    }),
});
