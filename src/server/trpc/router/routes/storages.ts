import { storageConfiguration } from "@/server/db/schemas";
import { protectedProcedure } from "../..";
import { router } from "../../trpc";
import db from "@/server/db";
import { desc } from "drizzle-orm";
import { createStorageSchema } from "@/server/db/validate-schema";
import { TRPCError } from "@trpc/server";

export const storagesRouter = router({
  listStorages: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.storageConfiguration.findMany({
      where: (storages, { eq, and, isNull }) =>
        and(
          eq(storages.userId, ctx.session.user.id),
          isNull(storages.deletedAt)
        ),
      orderBy: [desc(storageConfiguration.createdAt)],
    });
    return result;
  }),
  createStorage: protectedProcedure
    .input(createStorageSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, ...configuration } = input;

      const existName = await db.query.storageConfiguration.findFirst({
        where: (storages, { eq, and }) =>
          and(
            eq(storages.name, name),
            eq(storages.userId, ctx.session.user.id)
          ),
      });

      if (existName) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Storage with this name already exists",
        });
      }

      const result = await db
        .insert(storageConfiguration)
        .values({
          name: input.name,
          configuration,
          userId: ctx.session.user.id,
        })
        .returning();
      return result[0];
    }),
});
