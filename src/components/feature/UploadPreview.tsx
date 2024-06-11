import type Uppy from "@uppy/core";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/Dialog";
import { useUppyState } from "@/app/dashboard/useUppyState";
import { type MouseEventHandler, useState, useCallback } from "react";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface UploadPreviewProps {
  uppy: Uppy;
}

export default function UploadPreview({ uppy }: UploadPreviewProps) {
  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const open = files.length > 0;

  const [index, setIndex] = useState(0);
  const file = files[index];
  const isImage = file?.data.type.startsWith("image/");
  const imageUrl = isImage
    ? URL.createObjectURL(file?.data)
    : "/unknown-file-types.png";

  const onPrevClick: MouseEventHandler = useCallback(() => {
    if (!files.length) return;
    if (index <= 0) {
      setIndex(files.length - 1);
      return;
    }
    setIndex(index - 1);
  }, [files.length, index]);

  const onNextClick: MouseEventHandler = useCallback(() => {
    if (!files.length) return;
    if (index >= files.length - 1) {
      setIndex(0);
      return;
    }
    setIndex(index + 1);
  }, [files.length, index]);

  const onDeleteThis: MouseEventHandler = useCallback(() => {
    if (!file) return;
    uppy.removeFile(file.id);
    if (index === files.length - 1) {
      setIndex(index - 2 > 0 ? index - 2 : 0);
    }
  }, [file, files.length, index, uppy]);

  const clearFiles = useCallback(() => {
    files.forEach((file) => uppy.removeFile(file.id));
    setIndex(0);
  }, [files, uppy]);

  const onUploadAll: MouseEventHandler = useCallback(() => {
    uppy.upload().then(clearFiles);
  }, [clearFiles, uppy]);

  const onOpenChange = useCallback(
    (flag: boolean) => {
      if (flag === false) {
        clearFiles();
      }
    },
    [clearFiles]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle>Upload Preview</DialogTitle>
        {!!file && (
          <>
            <div className="flex items-center justify-evenly">
              {files.length > 1 && (
                <Button variant="ghost">
                  <ChevronLeft onClick={onPrevClick} />
                </Button>
              )}
              <div className="w-56 h-56 flex justify-center items-center relative">
                <Image
                  src={imageUrl}
                  fill
                  alt={file.name}
                  priority
                  sizes="100%"
                />
              </div>
              {files.length > 1 && (
                <Button variant="ghost">
                  <ChevronRight onClick={onNextClick} />
                </Button>
              )}
            </div>
            <DialogFooter className="flex-row justify-end gap-2">
              <Button variant="destructive" onClick={onDeleteThis}>
                Delete This
              </Button>
              <Button onClick={onUploadAll}>Upload All</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
