"use client";

import { type ReactNode, useCallback, useState } from "react";
import { Uppy } from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import { trpcPureClient } from "../../../trpc/pure";
import UploadButton from "@/components/feature/UploadButton";
import Dropzone from "@/components/feature/Dropzone";
import usePasteFile from "@/hooks/usePasteFile";
import { Button } from "@/components/ui/Button";
import UploadPreview from "@/components/feature/UploadPreview";
import FileList from "@/components/feature/FileList";
import { FilesOrderByColumn } from "@/server/trpc/router/routes/files";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/trpc/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { UrlMaker } from "@/components/feature/UrlMaker";
import { UpgradeDialog } from "../../components/UpgradeDialog";

export default function AppPage({
  params: { id: appId },
}: {
  params: { id: string };
}) {
  const { data: apps, isPending } = trpc.apps.listApps.useQuery(void 0, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const currentApp = apps?.find((app) => app.id === appId);

  const [makingUrlImageId, setMakingUrlImageId] = useState<string>("");

  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: plan } = trpc.plan.getPlan.useQuery(void 0, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [uppy] = useState(() => {
    const uppy = new Uppy();
    uppy.use(AwsS3, {
      shouldUseMultipart: false,
      // 用于返回 presigned URL
      async getUploadParameters(file) {
        try {
          const result = await trpcPureClient.files.createPresignedUrl.mutate({
            filename: file.data instanceof File ? file.data.name : "test",
            contentType: file.data.type || "",
            size: file.size || 0,
            appId,
          });
          return result;
        } catch (error) {
          if ((error as any).data?.httpStatus === 403) {
            setShowUpgrade(true);
          }
          throw error;
        }
      },
    });
    return uppy;
  });

  const onFilesPaste = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        uppy.addFile({
          data: file,
        });
      });
    },
    [uppy]
  );

  usePasteFile({ onFilesPaste });

  const [orderBy, setOrderBy] = useState<
    Exclude<FilesOrderByColumn, undefined>
  >({
    field: "createdAt",
    order: "desc",
  });

  let children: ReactNode;
  if (isPending) {
    children = (
      <div className="h-full w-full flex items-center justify-center">
        Loading...
      </div>
    );
  } else if (!currentApp) {
    children = (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4">
        <h2 className="font-semibold">App Not Found</h2>
        <p className="font-medium">Please select another one from below</p>
        <ul className="min-w-[284px] text-center border rounded-md">
          {apps?.map((app) => (
            <li key={app.id}>
              <Button asChild variant="link">
                <Link href={`/dashboard/apps/${app.id}`}>{app.name}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    children = (
      <div className="h-full flex flex-col items-center">
        <div className="h-[60px] w-full flex justify-between items-center p-2">
          <Button
            onClick={() => {
              setOrderBy((prev) => ({
                field: "createdAt",
                order: prev.order === "asc" ? "desc" : "asc",
              }));
            }}
          >
            Create At{" "}
            {orderBy.order === "asc" ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <div className="flex gap-2 items-center">
            <UploadButton uppy={uppy} />
            <Button
              asChild
              onClick={(e) => {
                if (!plan?.plan || plan.plan === "free") {
                  e.preventDefault();
                  setShowUpgrade(true);
                }
              }}
            >
              <Link href={`/dashboard/apps/new`} scroll={false}>
                New App
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={`/dashboard/apps/${appId}/settings/storages`}
                scroll={false}
              >
                <Settings />
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full h-[calc(100%-60px)] flex flex-col items-center gap-4">
          <Dropzone uppy={uppy} className="w-full h-full relative">
            {(dragging) => (
              <>
                {dragging && (
                  <div className="absolute inset-0 z-10 bg-secondary/50 flex justify-center items-center text-3xl border-2 border-dashed border-gray-400">
                    Drop File Here to Upload
                  </div>
                )}

                <FileList
                  appId={appId}
                  uppy={uppy}
                  orderBy={orderBy}
                  onMakeUrl={(id) => setMakingUrlImageId(id)}
                />
              </>
            )}
          </Dropzone>
        </div>
        <UploadPreview uppy={uppy} />
        <Dialog
          open={Boolean(makingUrlImageId)}
          onOpenChange={(flag) => {
            if (flag === false) {
              setMakingUrlImageId("");
            }
          }}
        >
          <DialogContent className="max-w-[90%]">
            <DialogTitle>Make Url</DialogTitle>
            <UrlMaker id={makingUrlImageId} />
          </DialogContent>
        </Dialog>

        <UpgradeDialog
          open={showUpgrade}
          onOpenChange={(f) => setShowUpgrade(f)}
        ></UpgradeDialog>
      </div>
    );
  }

  return children;
}
