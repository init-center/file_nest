"use client";

import { trpc } from "@/app/trpc/client";
import BreadcrumbNav, {
  type NavList,
} from "@/components/feature/BreadcrumbNav";
import { useEffect, useState } from "react";

export default function DashboardAppStoragesNewNav({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: apps } = trpc.apps.listApps.useQuery();

  const [navList, setNavList] = useState<NavList>([
    {
      name: "Home",
      href: "/",
    },
    {
      name: "loading...",
    },
    {
      name: "Settings",
    },
    {
      name: "Storages",
      href: `/dashboard/apps/${id}/settings/storages`,
    },
    {
      name: "New",
    },
  ]);

  useEffect(() => {
    setNavList([
      {
        name: "Home",
        href: "/",
      },
      {
        name: "Apps",
        showEllipsis: true,
        items: apps?.map((app) => ({
          name: app.name,
          href: `/dashboard/apps/${app.id}`,
          bold: app.id === id,
        })),
      },
      {
        name: "Settings",
      },
      {
        name: "Storages",
        href: `/dashboard/apps/${id}/settings/storages`,
      },
      {
        name: "New",
      },
    ]);
  }, [apps, id]);

  return <BreadcrumbNav navList={navList} />;
}
