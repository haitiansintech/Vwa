import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/env.mjs"

const donateSchema = z.object({
  amountCents: z.number().int().min(100).max(1000000),
  donorEmail: z.string().email().optional(),
})

export async function POST(req: Request) {
  if (!env.STRIPE_API_KEY) {
    return NextResponse.json(
      { error: "Donations are not configured." },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { amountCents, donorEmail } = donateSchema.parse(body)

    // Dynamically import Stripe to avoid issues when STRIPE_API_KEY is absent
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(env.STRIPE_API_KEY, {
      apiVersion: "2023-10-16" as any,
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      receipt_email: donorEmail,
      metadata: {
        source: "vwa_donation",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 422 })
    }
    console.error("Stripe error:", error)
    return NextResponse.json({ error: "Payment could not be created." }, { status: 500 })
  }
}
