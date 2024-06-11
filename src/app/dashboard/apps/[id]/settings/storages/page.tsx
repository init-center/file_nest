"use client";

import { trpc } from "@/app/trpc/client";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";

export default function StoragesPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: storages } = trpc.storages.listStorages.useQuery();
  const { data: apps } = trpc.apps.listApps.useQuery();
  const utils = trpc.useUtils();
  const changeStorageMutation = trpc.apps.changeStorage.useMutation({
    onSuccess: (data, { appId, storageId }) => {
      utils.apps.listApps.setData(void 0, (prev) => {
        if (!prev) return prev;
        return prev.map((p) =>
          p.id === appId
            ? {
                ...p,
                storageId,
              }
            : p
        );
      });
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const currentApp = useMemo(
    () => apps?.find((app) => app.id === id),
    [apps, id]
  );

  return (
    <div className="flex flex-col items-center px-4 h-full max-w-4xl relative mx-auto overflow-y-auto">
      <div className="w-full h-16 p-2 flex items-center justify-between sticky left-0 top-0 bg-[hsl(var(--background))]">
        <h1 className="flex items-center text-2xl font-medium">Storage List</h1>
        <Button asChild>
          <Link href={`/dashboard/apps/${id}/settings/storages/new`}>
            <Plus />
          </Link>
        </Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {storages?.map((storage) => (
          <AccordionItem value={storage.name} key={storage.id}>
            <AccordionTrigger>
              <div className="flex gap-2">
                <div className="max-w-32 truncate" title={storage.name}>
                  {storage.name}
                </div>
                {storage.id === currentApp?.storageId && (
                  <Badge variant="secondary" className="text-xs">
                    Used
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <dl className="w-full">
                  <dt className="font-medium">Region</dt>
                  <dd className="text-slate-400 truncate">
                    {storage.configuration.region}
                  </dd>
                </dl>
                <dl className="w-full">
                  <dt className="font-medium">Bucket</dt>
                  <dd className="text-slate-400 truncate">
                    {storage.configuration.bucket}
                  </dd>
                </dl>
                <dl className="w-full">
                  <dt className="font-medium">Endpoint</dt>
                  <dd className="text-slate-400 truncate">
                    {storage.configuration.endpoint || "Not provided"}
                  </dd>
                </dl>
                <Button
                  className="w-16"
                  disabled={currentApp?.storageId === storage.id}
                  onClick={() => {
                    changeStorageMutation.mutate({
                      appId: id,
                      storageId: storage.id,
                    });
                  }}
                >
                  {currentApp?.storageId === storage.id ? "Used" : "Use"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
