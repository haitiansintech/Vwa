import { NextResponse } from "next/server"
import { env } from "@/env.mjs"
import { db } from "@/lib/db"

// Must use Node.js runtime to read raw request body for Stripe signature verification
export const runtime = "nodejs"

export async function POST(req: Request) {
  if (!env.STRIPE_API_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 })
  }

  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 })
  }

  let event
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(env.STRIPE_API_KEY, {
      apiVersion: "2023-10-16" as any,
    })
    // Raw body is required for Stripe signature verification
    const rawBody = Buffer.from(await req.arrayBuffer())
    event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string
          payment_intent: string | null
          payment_status: string
          amount_total: number | null
          customer_email: string | null
        }

        if (session.payment_status === "paid") {
          await db.donation.upsert({
            where: { stripeCheckoutSessionId: session.id },
            update: {
              status: "COMPLETED",
              stripePaymentIntentId: session.payment_intent ?? undefined,
            },
            create: {
              // Fallback: if the initial DB write failed, create the record now
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: session.payment_intent ?? undefined,
              amountCents: session.amount_total ?? 0,
              donorEmail: session.customer_email,
              status: "COMPLETED",
            },
          })
        }
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as { id: string }
        await db.donation
          .update({
            where: { stripeCheckoutSessionId: session.id },
            data: { status: "CANCELED" },
          })
          .catch(() => {
            // Session may not have a DB record if it was never submitted — ignore
          })
        break
      }

      case "charge.refunded": {
        // Map the payment intent ID back to our donation record
        const charge = event.data.object as { payment_intent: string | null }
        if (charge.payment_intent) {
          await db.donation
            .update({
              where: { stripePaymentIntentId: charge.payment_intent },
              data: { status: "REFUNDED" },
            })
            .catch(() => {
              // No matching record — ignore
            })
        }
        break
      }

      default:
        // Acknowledge unhandled event types without error
        break
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
