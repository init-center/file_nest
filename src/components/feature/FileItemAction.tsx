import { type MouseEvent, useCallback } from "react";
import { Button } from "../ui/Button";
import { Trash2, Copy } from "lucide-react";
import { trpc } from "@/app/trpc/client";
import copy from "copy-to-clipboard";
import { toast } from "sonner";

interface DeleteFileProps {
  fileId: string;
  handleDeleteSuccess: (fileId: string) => void;
}

export function DeleteFile({ fileId, handleDeleteSuccess }: DeleteFileProps) {
  const { mutate: deleteFile, isPending } = trpc.files.deleteFile.useMutation({
    onSuccess() {
      handleDeleteSuccess(fileId);
    },
  });
  const handleRemoveFile = useCallback(() => {
    deleteFile(fileId);
  }, [deleteFile, fileId]);

  return (
    <Button
      variant="ghost"
      disabled={isPending}
      className="text-white p-2 hover:bg-transparent hover:text-red-500"
      onClick={handleRemoveFile}
    >
      <Trash2 size={18} />
    </Button>
  );
}

interface CopyUrlProps {
  url?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function CopyUrl({ url, onClick }: CopyUrlProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }
      if (url) {
        copy(url);
        toast("URL copied to clipboard!");
        return;
      }
      throw new Error("URL is required");
    },
    [url, onClick]
  );
  return (
    <Button
      variant="ghost"
      className="text-white p-2 hover:bg-transparent hover:text-blue-500"
      onClick={handleClick}
    >
      <Copy size={18} />
    </Button>
  );
}
