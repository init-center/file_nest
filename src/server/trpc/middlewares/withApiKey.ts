import { headers as getHeaders } from "next/headers";
import { createTRPCMiddleware } from "../trpc";
import db from "@/server/db";
import { TRPCError } from "@trpc/server";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const withApiKeyMiddleware = createTRPCMiddleware(async ({ next }) => {
  const headers = getHeaders();
  const apiKey = headers.get("API-Key");
  const signedToken = headers.get("Signed-Token");

  if (!apiKey && !signedToken) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  if (apiKey) {
    const result = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNull }) =>
        and(eq(apiKeys.key, apiKey), isNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: {
              with: {
                plan: true,
              },
            },
            storage: true,
          },
        },
      },
    });

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return next({
      ctx: {
        app: result.app,
        user: result.app.user,
      },
    });
  }

  if (!signedToken) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  // signedToken case
  const payload = jwt.decode(signedToken);
  const clientId = (payload as JwtPayload).clientId;
  if (!payload || !clientId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "clientId is required",
    });
  }
  const result = await db.query.apiKeys.findFirst({
    where: (apiKeys, { eq, and, isNull }) =>
      and(eq(apiKeys.clientId, clientId), isNull(apiKeys.deletedAt)),
    with: {
      app: {
        with: {
          user: {
            with: {
              plan: true,
            },
          },
          storage: true,
        },
      },
    },
  });
  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }

  try {
    jwt.verify(signedToken, result.key);
  } catch (e) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  return next({
    ctx: {
      app: result.app,
      user: result.app.user,
    },
  });
});
