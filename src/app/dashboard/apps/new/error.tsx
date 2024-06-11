"use client";

import { Button } from "@/components/ui/Button";

export default function CreateAppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="h-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center"> Create App Error</h1>
      <p className="text-center text-red-500">{error.message}</p>
      <Button onClick={reset}>Reset</Button>
    </div>
  );
}
