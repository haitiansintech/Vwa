import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, source } = subscribeSchema.parse(body)

    const existing = await db.subscriber.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Already subscribed." },
        { status: 200 }
      )
    }

    await db.subscriber.create({
      data: {
        email,
        source: source ?? "unknown",
      },
    })

    return NextResponse.json({ message: "Subscribed." }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
