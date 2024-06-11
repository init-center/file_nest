import type Uppy from "@uppy/core";
import {
  useCallback,
  useState,
  useRef,
  type ReactNode,
  type HTMLAttributes,
  type DragEventHandler,
} from "react";

interface DropzoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  uppy: Uppy;
  children: ReactNode | ((dragging: boolean) => ReactNode);
}

export default function Dropzone({
  uppy,
  children,
  ...divProps
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDragEnter: DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onDragLeave: DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
      setDragging(false);
    }, 50);
  }, []);
  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      Array.from(files).forEach((file) => {
        uppy.addFile({
          data: file,
        });
      });
      setDragging(false);
    },
    [uppy]
  );
  return (
    <div
      {...divProps}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {typeof children === "function" ? children(dragging) : children}
    </div>
  );
}
