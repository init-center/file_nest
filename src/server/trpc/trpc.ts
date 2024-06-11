import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const { router, procedure, createCallerFactory } = t;

export const createTRPCMiddleware = t.middleware;
