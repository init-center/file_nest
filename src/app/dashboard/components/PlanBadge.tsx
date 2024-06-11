"use client";

import { trpc } from "@/app/trpc/client";
import { Badge } from "@/components/ui/Badge";

export function PlanBadge() {
  const { data: plan } = trpc.plan.getPlan.useQuery(void 0, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return (
    <Badge
      variant={plan?.plan === "premium" ? "default" : "secondary"}
      className="absolute -right-[2px] top-0 px-[4px] py-[1px]"
    >
      {plan?.plan === "premium" ? "prem" : "free"}
    </Badge>
  );
}
