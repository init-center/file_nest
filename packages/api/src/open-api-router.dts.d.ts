import * as postgres from 'postgres';
import * as _trpc_server from '@trpc/server';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';

declare const openApiRouter: _trpc_server_unstable_core_do_not_import.BuiltRouter<{
    ctx: object;
    meta: object;
    errorShape: _trpc_server_unstable_core_do_not_import.DefaultErrorShape;
    transformer: false;
}, _trpc_server_unstable_core_do_not_import.DecorateCreateRouterOptions<{
    files: _trpc_server_unstable_core_do_not_import.BuiltRouter<{
        ctx: object;
        meta: object;
        errorShape: _trpc_server_unstable_core_do_not_import.DefaultErrorShape;
        transformer: false;
    }, {
        createPresignedUrl: _trpc_server.TRPCMutationProcedure<{
            input: {
                contentType: string;
                filename: string;
                size: number;
            };
            output: {
                url: string;
                method: "PUT";
            };
        }>;
        saveFile: _trpc_server.TRPCMutationProcedure<{
            input: {
                name: string;
                appId: string;
                type: string;
                path: string;
            };
            output: {
                id: string;
                name: string;
                userId: string;
                createdAt: Date | null;
                deletedAt: Date | null;
                appId: string;
                type: string;
                path: string;
                url: string;
                contentType: string;
            };
        }>;
        listFiles: _trpc_server.TRPCQueryProcedure<{
            input: {
                appId: string;
            };
            output: {
                id: string;
                name: string;
                userId: string;
                createdAt: Date | null;
                deletedAt: Date | null;
                appId: string;
                type: string;
                path: string;
                url: string;
                contentType: string;
            }[];
        }>;
        infiniteQueryFiles: _trpc_server.TRPCQueryProcedure<{
            input: {
                appId: string;
                orderBy?: {
                    field: "createdAt";
                    order: "asc" | "desc";
                } | undefined;
                limit?: number | undefined;
                cursor?: {
                    id: string;
                    createdAt: string;
                } | undefined;
            };
            output: {
                items: {
                    id: string;
                    name: string;
                    userId: string;
                    createdAt: Date | null;
                    deletedAt: Date | null;
                    appId: string;
                    type: string;
                    path: string;
                    url: string;
                    contentType: string;
                }[];
                nextCursor: {
                    id: string;
                    createdAt: Date;
                } | null;
            };
        }>;
        deleteFile: _trpc_server.TRPCMutationProcedure<{
            input: string;
            output: postgres.RowList<never[]>;
        }>;
    }>;
}>>;
type OpenApiRouter = typeof openApiRouter;

export type { OpenApiRouter };
