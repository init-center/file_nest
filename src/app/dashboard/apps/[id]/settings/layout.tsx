"use client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

const menuList = [
  {
    title: "Storages",
  },
  {
    title: "ApiKeys",
    pathName: "api-keys",
  },
];

export default function AppSettingsLayout({
  children,
  params: { id },
}: LayoutProps) {
  const currentPathname = usePathname();
  const menu = useMemo(() => {
    return menuList.map((item) => {
      const href = `/dashboard/apps/${id}/settings/${
        item.pathName ?? item.title.toLowerCase()
      }`;
      const isActive = currentPathname.startsWith(href);

      return {
        title: item.title,
        href,
        isActive,
      };
    });
  }, [currentPathname, id]);
  return (
    <div className="flex justify-start h-full relative">
      <div className="flex flex-col w-[20%] min-w-[80px] max-w-[160px] py-4 gap-2 sticky left-0 top-0">
        {menu.map(({ title, href, isActive }) => (
          <Button
            variant="ghost"
            asChild={!isActive}
            key={title}
            className={cn({
              "bg-[hsl(var(--accent))]": isActive,
              "pointer-events-none": isActive,
            })}
          >
            {isActive ? title : <Link href={href}>{title}</Link>}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
