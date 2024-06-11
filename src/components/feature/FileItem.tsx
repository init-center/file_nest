import Image from "next/image";
import { useMemo } from "react";

interface FileItemProps {
  url: string;
  name: string;
  isImage: boolean;
}

export function FileItem({ url, name, isImage }: FileItemProps) {
  const fileUrl = isImage ? url : "/unknown-file-types.png";
  return isImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={fileUrl} alt={name} />
  ) : (
    <Image src={fileUrl} alt={name} width={160} height={160} priority />
  );
}

export function LocalFileItem({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  const fileUrl = useMemo(() => {
    return isImage ? URL.createObjectURL(file) : "/unknown-file-types.png";
  }, [file, isImage]);

  return <FileItem url={fileUrl} name={file.name} isImage={isImage} />;
}

export function RemoteFileItem({
  id,
  name,
  contentType,
  width,
  height,
  rotate,
  quality,
  fit,
}: {
  id: string;
  name: string;
  contentType: string;
  width?: number;
  height?: number;
  rotate?: number;
  quality?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}) {
  const isImage = contentType.startsWith("image/");
  let url = `/files/${id}`;

  const params = new URLSearchParams();
  if (width) {
    params.set("width", width.toString());
  }
  if (height) {
    params.set("height", height.toString());
  }
  if (rotate) {
    params.set("rotate", rotate.toString());
  }
  if (quality) {
    params.set("quality", quality.toString());
  }

  if (fit) {
    params.set("fit", fit);
  }

  const count = Array.from(params.keys()).length;

  if (count > 0) {
    url += `?${params.toString()}`;
  }

  return <FileItem url={url} name={name} isImage={isImage} />;
}
