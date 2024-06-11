import { useCallback, useEffect } from "react";

export default function usePasteFile({
  onFilesPaste,
}: {
  onFilesPaste: (files: File[]) => void;
}) {
  const onPaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (!file) continue;
        files.push(file);
      }
    }
    if (files.length > 0) {
      onFilesPaste(files);
      files = [];
    }
  }, [onFilesPaste]);

  useEffect(() => {
    document.body.addEventListener("paste", onPaste);

    return () => {
      document.body.removeEventListener("paste", onPaste);
    };
  }, [onPaste]);
}
