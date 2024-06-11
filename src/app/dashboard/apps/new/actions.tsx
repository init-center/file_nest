"use server";

import { auth } from "@/server/auth";
import { createAppSchema } from "@/server/db/validate-schema";
import { redirect } from "next/navigation";
import { trpcServerCaller } from "@/app/trpc/server";

interface CreateAppActionState {
  message: string;
  fields?: Record<string, string | null>;
  issues?: {
    message: string;
    path: string;
  }[];
}

export const createApp = async (
  _prevState: CreateAppActionState,
  formData: FormData
): Promise<CreateAppActionState> => {
  const data = Object.fromEntries(formData);

  const input = createAppSchema.safeParse(data);

  if (!input.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(data)) {
      fields[key] = data[key].toString();
    }

    return {
      message: "Invalid input",
      fields,
      issues: input.error.issues.map((issue) => ({
        message: "Server:" + issue.message,
        path: issue.path.join("."),
      })),
    };
  }

  if (input.data.name.includes("admin")) {
    return {
      message: "Invalid input",
      fields: input.data,
      issues: [
        {
          message: "App name cannot contain 'admin'",
          path: "name",
        },
      ],
    };
  }

  if (input.data.name.includes("test error")) {
    return {
      message: "This is a test error message",
      fields: input.data,
    };
  }

  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const newApp = await trpcServerCaller({ session }).apps.createApp(input.data);
  redirect(`/dashboard/apps/${newApp.id}`);
};
