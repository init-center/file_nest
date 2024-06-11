import { redirect } from "next/navigation";
import { X, Check } from "lucide-react";
import { ReactNode } from "react";
import { auth } from "@/server/auth";
import db from "@/server/db";
import { AutoRedirect } from "@/components/feature/AutoRedirect";

export default async function PaySuccess() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const userPlan = await db.query.plan.findFirst({
    where: (plan, { eq }) => eq(plan.userId, session.user.id),
  });

  let content: ReactNode;

  if (!userPlan || userPlan.plan === "free") {
    content = (
      <>
        <div className=" w-32 h-32 rounded-full bg-red-700 text-3xl text-white flex justify-center items-center mt-20">
          <X></X>
        </div>
        <div className=" text-2xl">You have some errors when pay</div>
      </>
    );
  } else {
    content = (
      <>
        <div className=" w-32 h-32 rounded-full bg-green-700 text-3xl text-white flex justify-center items-center mt-20">
          <Check></Check>
        </div>
        <div className=" text-2xl">Success</div>
        <div className="text-lg">Redirecting to the homepage in 3 seconds.</div>
        <AutoRedirect delay={3000} path="/dashboard"></AutoRedirect>
      </>
    );
  }

  return (
    <div className=" h-screen flex flex-col gap-10 items-center">{content}</div>
  );
}
