"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { track } from "@/lib/analytics"
import type { EligibilityAnswers } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Step = {
  id: keyof EligibilityAnswers
  question: string
  note?: string
  options: { label: string; value: string }[]
}

const steps: Step[] = [
  {
    id: "bornInHaiti",
    question: "Were you born in Haiti?",
    note: "Haitian citizenship can also pass through parentage, even if you were born abroad.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I am not sure", value: "not_sure" },
    ],
  },
  {
    id: "haitianParent",
    question: "Do you have at least one parent who was born in Haiti or holds Haitian citizenship?",
    note: "Under Article 13 of the Haitian Constitution, children of Haitian nationals are entitled to Haitian citizenship.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I am not sure", value: "not_sure" },
    ],
  },
  {
    id: "hasDocuments",
    question: "Do you have documents to support your Haitian citizenship?",
    note: "This includes a Haitian ID or passport, or documents like a parent's birth certificate that can be used to obtain one.",
    options: [
      { label: "Yes, I have a Haitian ID or passport", value: "yes" },
      { label: "I have some documents (birth certificate, parent's ID, etc.)", value: "some" },
      { label: "No, I do not have any documents", value: "no" },
      { label: "I am not sure what counts", value: "not_sure" },
    ],
  },
  {
    id: "currentCountry",
    question: "Which country do you currently live in?",
    options: [
      { label: "United States", value: "us" },
      { label: "Canada", value: "ca" },
      { label: "France", value: "fr" },
      { label: "Dominican Republic", value: "do" },
      { label: "Haiti", value: "ht" },
      { label: "Other", value: "other" },
    ],
  },
  {
    id: "intendToVote",
    question: "What best describes your current situation? Do you intend to participate in Haiti's upcoming election?",
    options: [
      { label: "I am ready to take the next steps", value: "yes" },
      { label: "I am still learning and exploring", value: "exploring" },
      { label: "I am not planning to participate at this time", value: "no" },
    ],
  },
]

export function EligibilityChecker() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<EligibilityAnswers>({})
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  React.useEffect(() => {
    if (currentStep === 0) {
      track("eligibility_checker_started")
    }
  }, [currentStep])

  function handleSelect(index: number) {
    setSelectedIndex(index)
  }

  function handleNext() {
    if (selectedIndex === null) return

    const selectedValue = step.options[selectedIndex].value
    const newAnswers = { ...answers, [step.id]: selectedValue }
    setAnswers(newAnswers)
    setSelectedIndex(null)

    if (isLast) {
      track("eligibility_checker_completed")
      const params = new URLSearchParams()
      Object.entries(newAnswers).forEach(([k, v]) =>
        params.set(k, String(v))
      )
      router.push(`/eligibility/result?${params.toString()}`)
      return
    }

    setCurrentStep((s) => s + 1)
  }

  function handleBack() {
    if (currentStep === 0) return
    setCurrentStep((s) => s - 1)
    setSelectedIndex(null)
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Question {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-semibold">{step.question}</h2>
        {step.note && (
          <p className="text-sm text-muted-foreground">{step.note}</p>
        )}
      </div>

      {/* Options */}
      <div className="mb-8 flex flex-col gap-3">
        {step.options.map((option, index) => (
          <button
            key={option.label}
            onClick={() => handleSelect(index)}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
              selectedIndex === index
                ? "border-primary bg-primary/5 text-primary"
                : "hover:border-foreground/30 hover:bg-muted/50"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={selectedIndex === null}>
          {isLast ? "See My Result" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
