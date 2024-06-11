import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../..";
import { router } from "../../trpc";
import db from "@/server/db";
import Stripe from "stripe";
import { orders } from "@/server/db/schemas/orders";

export const planRouter = router({
  getPlan: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.plan.findFirst({
      where: (plan, { eq }) => eq(plan.userId, ctx.session.user.id),
    });
    return {
      userId: ctx.session.user.id,
      plan: result?.plan ?? "free",
    };
  }),
  upgrade: protectedProcedure.mutation(async ({ ctx }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: "price_1PPo4fRrf6Pcw7AEt8DYJkSR",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/callback/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/callback/cancel`,
    });

    if (!session.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    await db.insert(orders).values({
      sessionId: session.id,
      userId: ctx.session.user.id,
      status: "created",
    });

    return {
      url: session.url,
    };
  }),
});
