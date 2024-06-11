import { z } from "zod";
import { router } from "../../trpc";
import { openApiProcedure } from "../..";
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import db from "@/server/db";
import { files } from "@/server/db/schemas/files";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { filesCanOrderByColumns } from "@/server/db/validate-schema";
import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import redisClient from "@/server/redis";

const filesOrderByColumnSchema = z
  .object({
    field: filesCanOrderByColumns.keyof(),
    order: z.enum(["asc", "desc"]),
  })
  .optional();

export type FilesOrderByColumn = z.infer<typeof filesOrderByColumnSchema>;

export const openFilesRouter = router({
  createPresignedUrl: openApiProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appInfo = ctx.app;

      if (!appInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found",
        });
      }

      if (!appInfo.storage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Your app does not have storage configuration, please configure it first",
        });
      }

      if (appInfo.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Forbidden",
        });
      }

      const plan = ctx.user.plan?.plan ?? "free";
      const isFreePlan = plan === "free";

      if (isFreePlan) {
        const alreadyUploadedFilesCountResult = await db
          .select({ count: count() })
          .from(files)
          .where(and(eq(files.appId, appInfo.id), isNull(files.deletedAt)));

        const countNum = alreadyUploadedFilesCountResult[0].count;

        const FREE_PLAN_MAX_FILES =
          process.env.NEXT_PUBLIC_FREE_PLAN_MAX_FILES ?? 1;

        if (countNum >= FREE_PLAN_MAX_FILES) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Your plan does not allow more than ${FREE_PLAN_MAX_FILES} files`,
          });
        }
      }

      const storage = appInfo.storage;

      const uid = ctx.user.id;
      const dateString = new Date().toISOString().split("T")[0];
      const fileNameSplit = input.filename.split(".");
      let fileName = "";
      let fileSuffix = "";
      if (fileNameSplit.length > 1) {
        fileSuffix = fileNameSplit.pop()!;
        fileName = fileNameSplit.join(".");
      } else {
        fileName = fileNameSplit[0];
      }
      const keyString = `${uid}/${
        appInfo.id
      }/${dateString}/${fileName.replaceAll(" ", "_")}`;
      const fileNameHash = crypto
        .createHash("sha256")
        .update(keyString)
        .digest("hex");
      const key = fileSuffix
        ? `${dateString}/${fileNameHash}.${fileSuffix}`
        : `${dateString}/${fileNameHash}`;
      const params: PutObjectCommandInput = {
        Bucket: storage.configuration.bucket,
        Key: key,
        ContentType: input.contentType,
        ContentLength: input.size,
      };

      const s3Client = new S3Client({
        endpoint: storage.configuration.endpoint,
        region: storage.configuration.region,
        credentials: {
          accessKeyId: storage.configuration.accessKeyId,
          secretAccessKey: storage.configuration.secretAccessKey,
        },
      });

      const command = new PutObjectCommand(params);
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 30,
      });

      // Save the presigned URL to Redis
      const url = new URL(signedUrl);
      const baseUrl = `${url.origin}${url.pathname}`;
      const redisKey = `presigned-url:${baseUrl}`;
      const redisValue = JSON.stringify({
        appId: appInfo.id,
        userId: uid,
      });
      await redisClient.set(redisKey, redisValue, "EX", 30);

      return {
        url: signedUrl,
        method: "PUT" as const,
      };
    }),
  saveFile: openApiProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const url = new URL(input.path);

      // Check if the presigned URL is valid
      const redisKey = `presigned-url:${input.path}`;
      const redisValue = await redisClient.get(redisKey);
      if (!redisValue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid presigned URL",
        });
      }

      const redisValueParsed = JSON.parse(redisValue);
      if (
        redisValueParsed.appId !== input.appId ||
        redisValueParsed.userId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid presigned URL",
        });
      }

      // Delete the presigned URL from Redis
      await redisClient.del(redisKey);

      const fs = await db
        .insert(files)
        .values({
          ...input,
          path: url.pathname,
          url: url.toString(),
          userId: ctx.user.id,
          contentType: input.type,
        })
        .returning();

      return fs[0];
    }),
  listFiles: openApiProcedure
    .input(
      z.object({
        appId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await db.query.files.findMany({
        orderBy: [desc(files.createdAt)],
        where: (files, { eq }) =>
          and(eq(files.userId, ctx.user.id), eq(files.appId, input.appId)),
      });
      return result;
    }),
  infiniteQueryFiles: openApiProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.string(),
          })
          .optional(),
        limit: z.number().default(10),
        orderBy: filesOrderByColumnSchema,
        appId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor,
        limit,
        orderBy = {
          field: "createdAt",
          order: "desc",
        },
      } = input;

      const deletedFilter = isNull(files.deletedAt);
      const userFilter = eq(files.userId, ctx.user.id);
      const appFilter = eq(files.appId, input.appId);

      const filters = [appFilter, userFilter, deletedFilter];
      if (cursor) {
        filters.push(
          orderBy.field === "createdAt" && orderBy.order === "asc"
            ? sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") > (${new Date(
                cursor.createdAt
              ).toISOString()}, ${cursor.id})`
            : sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") < (${new Date(
                cursor.createdAt
              ).toISOString()}, ${cursor.id})`
        );
      }

      const result = await db
        .select()
        .from(files)
        .limit(limit)
        .where(and(...filters))
        .orderBy(
          orderBy.order === "desc"
            ? desc(files[orderBy.field])
            : asc(files[orderBy.field])
        );
      return {
        items: result,
        nextCursor:
          result.length > 0
            ? {
                id: result[result.length - 1].id,
                createdAt: result[result.length - 1].createdAt!,
              }
            : null,
      };
    }),
  deleteFile: openApiProcedure.input(z.string()).mutation(async ({ input }) => {
    return db
      .update(files)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(files.id, input));
  }),
});
