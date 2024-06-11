"use client";

import { Button } from "@/components/ui/Button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createStorageSchema } from "@/server/db/validate-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/app/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FormType = z.infer<typeof createStorageSchema>;

export default function CreateStoragePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const form = useForm<FormType>({
    resolver: zodResolver(createStorageSchema),
    defaultValues: {
      name: "",
      bucket: "",
      region: "",
      accessKeyId: "",
      secretAccessKey: "",
    },
  });

  const createStorageMutation = trpc.storages.createStorage.useMutation({
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
    onSuccess() {
      router.push(`/dashboard/apps/${id}/settings/storages`);
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await createStorageMutation.mutateAsync(data);
    return result;
  });
  return (
    <div className="max-w-xl mx-auto pt-6">
      <Form {...form}>
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Create Storage
        </h1>
        <form className="space-y-6 p-2" onSubmit={handleSubmit}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name of your storage.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="bucket"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bucket</FormLabel>
                <FormControl>
                  <Input placeholder="Bucket" {...field} />
                </FormControl>
                <FormDescription>
                  This is your cloud storage bucket name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="region"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input placeholder="Region" {...field} />
                </FormControl>
                <FormDescription>
                  This is your cloud storage region.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="accessKeyId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>AccessKeyID</FormLabel>
                <FormControl>
                  <Input placeholder="AccessKeyID" {...field} />
                </FormControl>
                <FormDescription>
                  This is your cloud storage access key.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="secretAccessKey"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SecretAccessKey</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="SecretAccessKey"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your cloud storage secret key.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="endpoint"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ApiEndpoint</FormLabel>
                <FormControl>
                  <Input placeholder="Endpoint" {...field} />
                </FormControl>
                <FormDescription>
                  This is your cloud storage api endpoint, default is AWS S3.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center items-center">
            <Button
              type="submit"
              className="w-40"
              disabled={createStorageMutation.isPending}
            >
              {createStorageMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
