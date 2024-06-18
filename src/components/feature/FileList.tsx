import { trpc } from "@/app/trpc/client";
import { trpcPureClient } from "@/app/trpc/pure";
import { useUppyState } from "@/app/dashboard/useUppyState";
import type Uppy from "@uppy/core";
import type {
  UploadCallback,
  UploadCompleteCallback,
  UploadErrorCallback,
  UploadSuccessCallback,
} from "@uppy/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";
import { ScrollArea } from "../ui/ScrollArea";
import type { FilesOrderByColumn } from "@/server/trpc/router/routes/files";
import { CopyUrl, DeleteFile } from "./FileItemAction";
import { toast } from "sonner";
import copy from "copy-to-clipboard";

interface FileListProps {
  uppy: Uppy;
  orderBy: FilesOrderByColumn;
  appId: string;
  onMakeUrl: (fileId: string) => void;
}

type FileResult = inferRouterOutputs<AppRouter>["files"]["listFiles"];

export default function FileList({
  uppy,
  appId,
  orderBy,
  onMakeUrl,
}: FileListProps) {
  const queryKey = useMemo(
    () => ({
      limit: 3,
      orderBy,
      appId,
    }),
    [orderBy, appId]
  );

  const {
    data: infiniteQueryData,
    isPending,
    fetchNextPage,
  } = trpc.files.infiniteQueryFiles.useInfiniteQuery(
    { ...queryKey },
    {
      getNextPageParam: (resp) => resp.nextCursor,
    }
  );

  const fileList = useMemo(() => {
    return infiniteQueryData
      ? infiniteQueryData.pages.reduce(
          (result, page) => [...result, ...page.items],
          [] as FileResult
        )
      : [];
  }, [infiniteQueryData]);

  const utils = trpc.useUtils();

  const [uploadingFileIds, setUploadingFileIds] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  useEffect(() => {
    const onUploadSuccess: UploadSuccessCallback<{}> = (file, resp) => {
      if (!file) return;
      trpcPureClient.files.saveFile
        .mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type,
          appId,
        })
        .then((resp) => {
          utils.files.infiniteQueryFiles.setInfiniteData(
            { ...queryKey },
            (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                pages: prev.pages.map((page, index) => {
                  if (index === 0) {
                    return {
                      ...page,
                      items: [resp, ...page.items],
                    };
                  }
                  return page;
                }),
              };
            }
          );
        });
    };

    const onUpload: UploadCallback = (data) => {
      setUploadingFileIds((prev) => [...prev, ...data.fileIDs]);
    };

    const onUploadComplete: UploadCompleteCallback<{}> = () => {
      setUploadingFileIds([]);
    };

    const onUploadError: UploadErrorCallback<{}> = (file, error) => {
      toast.error(error.message);
      if (file) {
        uppy.removeFile(file.id);
        setUploadingFileIds((prev) => prev.filter((id) => id !== file.id));
      }
    };

    uppy.on("upload", onUpload);
    uppy.on("complete", onUploadComplete);
    uppy.on("upload-success", onUploadSuccess);
    uppy.on("upload-error", onUploadError);

    return () => {
      uppy.off("upload", onUpload);
      uppy.off("complete", onUploadComplete);
      uppy.off("upload-success", onUploadSuccess);
      uppy.off("upload-error", onUploadError);
    };
  }, [appId, orderBy, queryKey, uppy, utils.files.infiniteQueryFiles]);

  // infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect: IntersectionObserverCallback = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchNextPage();
      }
    },
    [fetchNextPage]
  );

  const handleDeleteSuccess = useCallback(
    (fileId: string) => {
      utils.files.infiniteQueryFiles.setInfiniteData(
        { ...queryKey },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page, index) => {
              return {
                ...page,
                items: page.items.filter((item) => item.id !== fileId),
              };
            }),
          };
        }
      );
    },
    [queryKey, utils.files.infiniteQueryFiles]
  );

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersect, {
        threshold: 1,
      });
    }
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    const currentObserver = observerRef.current;
    const currentSentinel = sentinelRef.current;

    return () => {
      if (currentObserver && currentSentinel) {
        currentObserver.unobserve(currentSentinel);
      }
    };
  }, [handleIntersect, fileList]);

  return (
    <ScrollArea className="h-full @container">
      {isPending && <div className="w-screen text-center">Loading</div>}
      {!isPending && fileList.length === 0 && !uploadingFileIds.length && (
        <div className="flex items-center justify-center w-screen h-48 text-2xl">
          No files
        </div>
      )}
      <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4 gap-4 relative container transition-all">
        {uploadingFileIds.length > 0 &&
          uploadingFileIds.map((fileId) => {
            const file = uppyFiles[fileId];
            return (
              <div
                key={file.id}
                className="h-56 flex justify-center items-center border border-red-500 relative"
              >
                <LocalFileItem file={file.data as File} />
              </div>
            );
          })}

        {fileList?.map((file, idx) => {
          return (
            <div
              key={file.id}
              ref={idx === fileList.length - 1 ? sentinelRef : void 0}
              className="h-56 flex justify-center items-center border relative overflow-hidden group"
            >
              <RemoteFileItem
                id={file.id}
                name={file.name}
                contentType={file.type}
                width={250}
                height={250}
                quality={50}
              />
              <div className="absolute w-full h-16 bg-black bg-opacity-50 -bottom-16 group-hover:bottom-0 transition-[bottom] ">
                <h3
                  className="text-white text-sm truncate px-2"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <div className="flex justify-end">
                  <CopyUrl
                    onClick={() => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        copy(
                          `${process.env.NEXT_PUBLIC_SITE_URL}/files/${file.id}`
                        );
                        return;
                      }
                      onMakeUrl(file.id);
                    }}
                  />
                  <DeleteFile
                    fileId={file.id}
                    handleDeleteSuccess={handleDeleteSuccess}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
