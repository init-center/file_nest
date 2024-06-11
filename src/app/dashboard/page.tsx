"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { trpc } from "../trpc/client";
import { UpgradeDialog } from "./components/UpgradeDialog";
import { useState } from "react";

export default function DashboardAppList() {
  const getAppsResult = trpc.apps.listApps.useQuery(void 0, {
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { data: apps, isLoading } = getAppsResult;

  const { data: plan } = trpc.plan.getPlan.useQuery(void 0, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const router = useRouter();

  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="max-w-2xl mx-auto pt-10">
      {isLoading ? (
        <div className="mx-auto w-fit">Loading...</div>
      ) : (
        <div className=" flex w-[90%] mx-auto flex-col gap-2 rounded-md border p-2">
          {!apps?.length && (
            <div className="text-center">You don&apos;t have any apps yet.</div>
          )}
          {apps?.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between gap-6"
            >
              <div>
                <h2 className=" text-xl">{app.name}</h2>
                <p className="truncate">
                  {app.description ? app.description : "(no description)"}
                </p>
              </div>
              <div>
                <Button asChild>
                  <Link href={`/dashboard/apps/${app.id}`}>Go</Link>
                </Button>
              </div>
            </div>
          ))}
          <Button asChild>
            <Link
              href="/dashboard/apps/new"
              onClick={(e) => {
                e.preventDefault();
                if (
                  (!plan || plan.plan === "free") &&
                  (apps?.length ?? 0) >=
                    process.env.NEXT_PUBLIC_FREE_PLAN_MAX_APPS
                ) {
                  setShowUpgrade(true);
                } else {
                  router.push("/dashboard/apps/new");
                }
              }}
            >
              Create App
            </Link>
          </Button>
        </div>
      )}
      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={(f) => setShowUpgrade(f)}
      ></UpgradeDialog>
    </div>
  );
}
