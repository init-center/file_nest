import { Button } from "@/components/ui/Button";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const formStatus = useFormStatus();

  return (
    <Button type="submit" disabled={formStatus.pending}>
      {formStatus.pending ? "Creating..." : "Create"}
    </Button>
  );
}
