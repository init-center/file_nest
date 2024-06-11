"use client";

import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="w-[40px] h-[40px] rounded-full p-0 mr-auto"
      onClick={() => router.back()}
    >
      <ChevronLeft />
    </Button>
  );
}
