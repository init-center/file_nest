import { useCallback, useRef, type ChangeEventHandler } from "react";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";
import type Uppy from "@uppy/core";

interface Props {
  uppy: Uppy;
}

export default function UploadButton({ uppy }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (!e.target.files) return;
      Array.from(e.target.files).forEach((file) => {
        uppy.addFile({ data: file });
      });
      e.target.value = "";
    },
    [uppy]
  );

  const onButtonClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        tabIndex={-1}
        type="file"
        className="hidden"
        multiple
        onChange={onInputChange}
      ></input>
      <Button variant="outline" onClick={onButtonClick}>
        <Plus />
      </Button>
    </>
  );
}
