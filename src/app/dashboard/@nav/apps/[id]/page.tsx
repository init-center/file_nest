"use client";

import { trpc } from "@/app/trpc/client";
import BreadcrumbNav, {
  type NavList,
} from "@/components/feature/BreadcrumbNav";
import { useEffect, useMemo, useState } from "react";

export default function DashboardAppNav({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: apps } = trpc.apps.listApps.useQuery();

  const currentApp = useMemo(
    () => apps?.find((app) => app.id === id),
    [apps, id]
  );

  const [navList, setNavList] = useState<NavList>([
    {
      name: "Home",
      href: "/",
    },
    {
      name: "loading...",
    },
  ]);

  useEffect(() => {
    setNavList([
      {
        name: "Home",
        href: "/",
      },
      {
        name: currentApp?.name ?? "...",
        showEllipsis: false,
        items: apps?.map((app) => ({
          name: app.name,
          href: `/dashboard/apps/${app.id}`,
          bold: app.id === id,
        })),
      },
    ]);
  }, [apps, currentApp?.name, id]);

  return <BreadcrumbNav navList={navList} />;
}
