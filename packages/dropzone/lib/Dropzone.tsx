import type { JSX } from "preact";
import { useCallback, useState, useRef } from "preact/hooks";
import type { ReactNode, HTMLAttributes } from "preact/compat";
import { useEffect } from "react";

type CommonPreactComponentProps = {
  setChildrenContainer?: (ele: HTMLElement | null) => void;
};

export type DropzoneProps = {
  onFileChosen?: (files: File[]) => void;
  onDraggingChange?: (dragging: boolean) => void;
  children: ReactNode | ((dragging: boolean) => ReactNode);
} & Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  CommonPreactComponentProps;

export function Dropzone({
  children,
  onFileChosen,
  onDraggingChange,
  setChildrenContainer = () => {},
  ...divProps
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDragEnter: JSX.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragOver: JSX.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onDragLeave: JSX.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
      setDragging(false);
    }, 50);
  }, []);

  const onDrop: JSX.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer?.files || [];
      onFileChosen && onFileChosen(Array.from(files));
      setDragging(false);
    },
    [onFileChosen]
  );

  useEffect(() => {
    onDraggingChange && onDraggingChange(dragging);
  }, [dragging, onDraggingChange]);

  return (
    <div
      ref={(el) => {
        setChildrenContainer(el);
      }}
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
