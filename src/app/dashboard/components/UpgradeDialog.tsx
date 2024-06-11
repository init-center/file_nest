import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Plan from "./Plan";

export function UpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (f: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade</DialogTitle>
          <DialogDescription>
            <div>
              You are currently a free user and cannot create more apps or
              upload more files.
            </div>
            <div>Please upgrade.</div>
          </DialogDescription>
        </DialogHeader>
        <Plan></Plan>
      </DialogContent>
    </Dialog>
  );
}
