import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbNavItem {
  name: string;
  href?: string;
  bold?: boolean;
}

export interface BreadcrumbNavGroup {
  name: string;
  items: BreadcrumbNavItem[];
  showEllipsis?: boolean;
}

export type NavList = (BreadcrumbNavItem | BreadcrumbNavGroup)[];

export interface BreadcrumbNavProps {
  navList: NavList;
}

function isBreadcrumbNavGroup(
  navItem: BreadcrumbNavItem | BreadcrumbNavGroup
): navItem is BreadcrumbNavGroup {
  return (navItem as BreadcrumbNavGroup).items !== undefined;
}

export default function BreadcrumbNav({ navList }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {navList.map((navItem, index) => {
          if (isBreadcrumbNavGroup(navItem)) {
            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      {navItem.showEllipsis ? (
                        <>
                          <BreadcrumbEllipsis className="h-4 w-4" />
                          <span className="sr-only">{navItem.name}</span>
                        </>
                      ) : (
                        <>
                          {navItem.name}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {navItem.items.map((item, itemIndex) => (
                        <DropdownMenuItem
                          key={itemIndex}
                          className={cn({
                            "font-bold": item.bold,
                          })}
                        >
                          {item.href ? (
                            <Link href={item.href}>{item.name}</Link>
                          ) : (
                            item.name
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                {index < navList.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          }

          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {navItem.href ? (
                  <BreadcrumbLink href={navItem.href}>
                    {navItem.name}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{navItem.name}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < navList.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
