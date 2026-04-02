"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { track } from "@/lib/analytics"
import type { EligibilityAnswers } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StepId = keyof EligibilityAnswers

type Step = {
  id: StepId
  question: string
  note?: string
  options: { label: string; value: string }[]
}

const stepMap: Record<StepId, Step> = {
  bornInHaiti: {
    id: "bornInHaiti",
    question: "Were you born in Haiti?",
    note: "Haitian citizenship can also pass through parentage, even if you were born abroad.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I am not sure", value: "not_sure" },
    ],
  },
  haitianParent: {
    id: "haitianParent",
    question: "Do you have at least one parent who was born in Haiti or holds Haitian citizenship?",
    note: "Under Article 13 of the Haitian Constitution, children of Haitian nationals are entitled to Haitian citizenship.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I am not sure", value: "not_sure" },
    ],
  },
  hasDocuments: {
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
  currentCountry: {
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
  intendToVote: {
    id: "intendToVote",
    question: "What best describes your current situation? Do you intend to participate in Haiti's upcoming election?",
    options: [
      { label: "I am ready to take the next steps", value: "yes" },
      { label: "I am still learning and exploring", value: "exploring" },
      { label: "I am not planning to participate at this time", value: "no" },
    ],
  },
}

function getNextStepId(id: StepId, answers: EligibilityAnswers): StepId | null {
  if (id === "bornInHaiti") return "haitianParent"
  if (id === "haitianParent") {
    const positive = answers.bornInHaiti === "yes" || answers.haitianParent === "yes"
    const clearNeg = answers.bornInHaiti === "no" && answers.haitianParent === "no"
    const uncertain = answers.bornInHaiti === "not_sure" || answers.haitianParent === "not_sure"
    return !positive && (clearNeg || uncertain) ? "intendToVote" : "hasDocuments"
  }
  if (id === "hasDocuments") return "currentCountry"
  if (id === "currentCountry") return "intendToVote"
  return null
}

function computePathLength(answers: EligibilityAnswers): number {
  let id: StepId | null = "bornInHaiti"
  let count = 0
  while (id !== null) {
    count++
    id = getNextStepId(id, answers)
  }
  return count
}

export function EligibilityChecker() {
  const router = useRouter()
  const [stepHistory, setStepHistory] = React.useState<StepId[]>(["bornInHaiti"])
  const [answers, setAnswers] = React.useState<EligibilityAnswers>({})
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const currentStepId = stepHistory[stepHistory.length - 1]
  const step = stepMap[currentStepId]
  const isFirst = stepHistory.length === 1
  const pathLength = computePathLength(answers)

  React.useEffect(() => {
    if (stepHistory.length === 1) {
      track("eligibility_checker_started")
    }
  }, [stepHistory.length])

  function handleNext() {
    if (selectedIndex === null) return

    const selectedValue = step.options[selectedIndex].value
    const newAnswers = { ...answers, [currentStepId]: selectedValue }
    setAnswers(newAnswers)
    setSelectedIndex(null)

    const nextId = getNextStepId(currentStepId, newAnswers)

    if (nextId === null) {
      track("eligibility_checker_completed")
      const params = new URLSearchParams()
      Object.entries(newAnswers).forEach(([k, v]) => params.set(k, String(v)))
      router.push(`/eligibility/result?${params.toString()}`)
      return
    }

    setStepHistory((h) => [...h, nextId])
  }

  function handleBack() {
    if (isFirst) return
    setStepHistory((h) => h.slice(0, -1))
    setSelectedIndex(null)
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Question {stepHistory.length} of {pathLength}</span>
          <span>{Math.round((stepHistory.length / pathLength) * 100)}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(stepHistory.length / pathLength) * 100}%` }}
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
            onClick={() => setSelectedIndex(index)}
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
        <Button variant="ghost" onClick={handleBack} disabled={isFirst}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={selectedIndex === null}>
          {getNextStepId(currentStepId, answers) === null ? "See My Result" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
