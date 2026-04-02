import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/env.mjs"
import { db } from "@/lib/db"

const donateSchema = z.object({
  amountCents: z.number().int().min(100).max(1000000),
  donorEmail: z.string().email().optional(),
  // The calling page passes its own URL so redirects work for any lang segment
  returnUrl: z.string().url(),
})

export async function POST(req: Request) {
  if (!env.STRIPE_API_KEY) {
    return NextResponse.json(
      { error: "Donations are not currently available. Please check back soon." },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { amountCents, donorEmail, returnUrl } = donateSchema.parse(body)

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(env.STRIPE_API_KEY, {
      apiVersion: "2023-10-16" as any,
    })

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to Vwa",
              description: "Supports free civic information for Haitians worldwide.",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      // Stripe appends ?session_id={CHECKOUT_SESSION_ID} automatically
      success_url: `${returnUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?payment=canceled`,
      customer_email: donorEmail,
      metadata: { source: "vwa_donation" },
    })

    // Persist a PENDING donation record so the webhook can locate and update it.
    // Non-fatal: if the DB write fails, the checkout can still proceed.
    try {
      await db.donation.create({
        data: {
          amountCents,
          donorEmail: donorEmail ?? null,
          stripeCheckoutSessionId: session.id,
          status: "PENDING",
        },
      })
    } catch (dbErr) {
      console.error("Donation DB write failed:", dbErr)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 422 })
    }
    console.error("Stripe error:", error)
    return NextResponse.json({ error: "Payment could not be created." }, { status: 500 })
  }
}
