import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { openApiRouter } from "@/server/trpc/router";

const handler = async (req: NextRequest) => {
  const res = await fetchRequestHandler({
    endpoint: "/api/open",
    req,
    router: openApiRouter,
  });

  res.headers.append("Access-Control-Allow-Origin", "*");
  res.headers.append("Access-Control-Allow-Methods", "*");
  res.headers.append("Access-Control-Allow-Headers", "*");
  return res;
};

export function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export { handler as GET, handler as POST };
