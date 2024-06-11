"use client";

import { trpc } from "@/app/trpc/client";
import { Button } from "@/components/ui/Button";

export default function Plan() {
  const { mutate, isPending } = trpc.plan.upgrade.useMutation({
    onSuccess: (resp) => {
      window.location.href = resp.url;
    },
  });

  const { data: plan } = trpc.plan.getPlan.useQuery(void 0, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return (
    <section className="">
      <div className="container px-4">
        <div className="flex flex-col items-center space-y-4 md:space-y-8">
          <div className="grid max-w-sm gap-4 md:grid-cols-1 md:max-w-none md:gap-8">
            <div className="flex flex-col rounded-lg border-2 border-indigo-600">
              <div className="flex-1 grid items-center justify-center p-6 text-center">
                <h2 className="text-lg font-semibold">Premium</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  For growing usage with additional needs
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="grid items-center justify-center p-6">
                  <span className="text-2xl font-semibold text-center">$5</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    per month
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                <li className="flex justify-center p-4 text-sm gap-2">
                  <span className="font-medium">Unlimited</span>
                  Uploads
                </li>
                <li className="flex justify-center  p-4 text-sm gap-2">
                  <span className="font-medium">Unlimited</span>
                  Apps
                </li>
                <li className="flex justify-center p-4 text-sm gap-2">
                  <span className="font-medium">Unlimited</span>
                  Storage Configurations
                </li>
              </ul>
              <div className="flex justify-center items-center p-4">
                <Button
                  disabled={isPending || plan?.plan === "premium"}
                  onClick={() => {
                    mutate();
                  }}
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
