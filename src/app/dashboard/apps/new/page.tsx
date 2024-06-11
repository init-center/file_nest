"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createApp } from "./actions";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppSchema } from "@/server/db/validate-schema";
import { z } from "zod";
import { useFormState } from "react-dom";
import SubmitButton from "./SubmitButton";
import { useEffect, useState } from "react";
import { trpc } from "@/app/trpc/client";
import { UpgradeDialog } from "../../components/UpgradeDialog";

type FormValues = z.infer<typeof createAppSchema>;

export default function NewApp() {
  const getAppsResult = trpc.apps.listApps.useQuery(void 0, {
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { data: apps, isLoading } = getAppsResult;

  const { data: plan } = trpc.plan.getPlan.useQuery(void 0, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [showUpgrade, setShowUpgrade] = useState(false);

  const [actionState, formAction] = useFormState(createApp, {
    message: "",
  });

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: "",
      ...(actionState?.fields ?? {}),
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!actionState) {
      return;
    }

    if (actionState.issues) {
      actionState.issues?.forEach((error) => {
        setError(error.path as FieldPath<FormValues>, {
          message: error.message,
        });
      });
    }
  }, [actionState, setError]);

  useEffect(() => {
    if (
      (!plan || plan.plan === "free") &&
      !isLoading &&
      (apps?.length ?? 0) >= process.env.NEXT_PUBLIC_FREE_PLAN_MAX_APPS
    ) {
      setShowUpgrade(true);
    }
  }, [apps?.length, isLoading, plan]);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4" action={formAction}>
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        {actionState.message !== "" && !actionState.issues && (
          <p className="text-center text-destructive">{actionState.message}</p>
        )}
        <Input placeholder="App Name" {...register("name")} />
        <p className="text-[0.8rem] font-medium text-destructive">
          {errors.name?.message}
        </p>
        <Textarea name="description" placeholder="Description" />
        <SubmitButton />
      </form>
      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={(f) => setShowUpgrade(f)}
      ></UpgradeDialog>
    </div>
  );
}
