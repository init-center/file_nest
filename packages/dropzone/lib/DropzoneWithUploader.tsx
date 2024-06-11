import type {
  UploadCompleteCallback,
  UploadSuccessCallback,
  Uppy,
  UppyFile,
} from "@uppy/core";
import { Dropzone, type DropzoneProps } from "./Dropzone";
import { useEffect, useRef } from "preact/hooks";

export function DropzoneWithUploader({
  uploader,
  onFileUploaded,
  onFileChosen,
  immediateUpload = true,
  ...uploadButtonProps
}: {
  uploader: Uppy;
  onFileUploaded: (url: string, file: UppyFile) => {};
  onFileChosen?: (files: File[]) => void;
  immediateUpload?: boolean;
} & DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const successCallback: UploadSuccessCallback<{}> = (file, resp) => {
      onFileUploaded(resp.uploadURL!, file!);
    };
    const completeCallback: UploadCompleteCallback<{}> = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    uploader.on("upload-success", successCallback);
    uploader.on("complete", completeCallback);

    return () => {
      uploader.off("upload-success", successCallback);
      uploader.off("complete", completeCallback);
    };
  }, [onFileUploaded, uploader]);

  function onFiles(files: File[]) {
    uploader.addFiles(
      files.map((file) => ({
        data: file,
      }))
    );

    if (onFileChosen) {
      onFileChosen(files);
    }

    if (immediateUpload) {
      uploader.upload();
    }
  }

  return <Dropzone onFileChosen={onFiles} {...uploadButtonProps}></Dropzone>;
}
