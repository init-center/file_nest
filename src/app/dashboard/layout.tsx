import { ThemeToggle } from "@/components/feature/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import BackButton from "../../components/feature/BackButton";
import { PlanBadge } from "./components/PlanBadge";

export default async function DashboardLayout({
  children,
  nav,
}: Readonly<{
  children: React.ReactNode;
  nav: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  return (
    <div className="h-screen">
      <nav className="h-[80px] px-2 flex justify-end items-center border-b relative gap-2">
        <BackButton />
        <ThemeToggle />
        <div className="relative w-[60px]">
          <Avatar>
            <AvatarImage src={session.user.image!} />
            <AvatarFallback>
              {session.user.name?.substring(0, 2) ?? "FN"}
            </AvatarFallback>
          </Avatar>
          <PlanBadge />
        </div>
        <div className="absolute h-full top-0 left-1/2 -translate-x-1/2 px-4 flex justify-center items-center">
          {nav}
        </div>
      </nav>
      <main className="h-[calc(100%-80px)] overflow-y-auto">{children}</main>
    </div>
  );
}
