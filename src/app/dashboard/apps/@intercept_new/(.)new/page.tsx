"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import CreateAppPage from "../../new/page";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function InterceptNewApp() {
  const router = useRouter();
  const onOpenChange = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <CreateAppPage />
      </DialogContent>
    </Dialog>
  );
}
