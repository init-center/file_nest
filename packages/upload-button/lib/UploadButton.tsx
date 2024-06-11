import { type HTMLAttributes } from "preact/compat";
import { type MutableRef, useRef } from "preact/hooks";

type CommonPreactComponentProps = {
  setChildrenContainer?: (ele: HTMLElement | null) => void;
};

export type UploadButtonProps = HTMLAttributes<HTMLButtonElement> &
  CommonPreactComponentProps & {
    onFileChosen?: (files: File[]) => void;
    inputRef?: MutableRef<HTMLInputElement | null>;
  };

export function UploadButton({
  onClick,
  setChildrenContainer = () => {},
  children,
  onFileChosen = () => {},
  inputRef: inputRefFromProps,
  ...props
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
    if (onClick) {
      onClick(e as any);
    }
  };

  return (
    <>
      <button
        {...props}
        onClick={handleClick}
        ref={(e) => setChildrenContainer(e)}
      >
        {children}
      </button>
      <input
        tabIndex={-1}
        type="file"
        multiple
        ref={(e) => {
          inputRef.current = e;
          if (inputRefFromProps) {
            inputRefFromProps.current = e;
          }
        }}
        onChange={(e) => {
          const filesFromEvent = (e.target as HTMLInputElement).files;

          if (filesFromEvent) {
            onFileChosen(Array.from(filesFromEvent));
          }
        }}
        style={{ display: "none" }}
      ></input>
    </>
  );
}
