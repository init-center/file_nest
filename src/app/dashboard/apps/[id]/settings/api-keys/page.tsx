"use client";

import { trpc } from "@/app/trpc/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { createApiKeySchema } from "@/server/db/validate-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import copy from "copy-to-clipboard";
import { Copy, Eye, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormType = Omit<z.infer<typeof createApiKeySchema>, "appId">;

export default function ApiKeysPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showKeyMap, setShowKeyMap] = useState<Record<number, boolean>>({});

  const form = useForm<FormType>({
    resolver: zodResolver(
      createApiKeySchema.omit({
        appId: true,
      })
    ),
    defaultValues: {
      name: "",
    },
  });

  const { data: apiKeys } = trpc.apiKeys.listApiKeys.useQuery({
    appId: id,
  });
  const utils = trpc.useUtils();

  const createApiKeyMutation = trpc.apiKeys.createApiKey.useMutation({
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
    onSuccess(data) {
      utils.apiKeys.listApiKeys.setData({ appId: id }, (prev) => {
        if (!prev) return prev;
        return [data, ...prev];
      });
      setPopoverOpen(false);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    createApiKeyMutation.mutate({
      ...data,
      appId: id,
    });
  });

  return (
    <div className="flex flex-col items-center px-4 h-full max-w-4xl relative mx-auto overflow-y-auto">
      <div className="w-full h-16 p-2 flex items-center justify-between sticky left-0 top-0 bg-[hsl(var(--background))]">
        <h1 className="flex items-center text-2xl font-medium">ApiKeys</h1>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button>
              <Plus />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                        This is the name of your new API key.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createApiKeyMutation.isPending}
                  >
                    {createApiKeyMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </PopoverContent>
        </Popover>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {apiKeys?.map((apiKey) => (
          <AccordionItem value={apiKey.name} key={apiKey.id}>
            <AccordionTrigger>
              <div className="max-w-32 truncate" title={apiKey.name}>
                {apiKey.name}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <dl className="w-full">
                  <dt className="font-medium">ClientID</dt>
                  <dd className="text-slate-400 truncate">
                    <div className="flex items-center gap-[4px]">
                      <span>{apiKey.clientId}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-0 h-fit w-fit"
                        onClick={() => {
                          copy(apiKey.clientId);
                          toast("client id copied!");
                        }}
                      >
                        <Copy size={18}></Copy>
                      </Button>
                    </div>
                  </dd>
                </dl>
                <dl className="w-full">
                  <dt className="flex items-center gap-[4px] font-medium">
                    SecretKey
                    {!showKeyMap[apiKey.id] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-0 h-fit w-fit"
                        onClick={() => {
                          setShowKeyMap((oldMap) => ({
                            ...oldMap,
                            [apiKey.id]: true,
                          }));
                        }}
                      >
                        <Eye size={20} />
                      </Button>
                    )}
                  </dt>
                  <dd className="text-slate-400 truncate">
                    {showKeyMap[apiKey.id] && (
                      <KeyString id={apiKey.id}></KeyString>
                    )}
                  </dd>
                </dl>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function KeyString({ id }: { id: number }) {
  const { data: key } = trpc.apiKeys.requestSecretKey.useQuery(id);

  return (
    <div className="flex items-center gap-[4px]">
      <span>{key}</span>
      <Button
        size="sm"
        variant="ghost"
        className="p-0 h-fit w-fit"
        onClick={() => {
          copy(key!);
          toast("secret key copied!");
        }}
      >
        <Copy size={18}></Copy>
      </Button>
    </div>
  );
}
