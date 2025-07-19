'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import confetti from "canvas-confetti"

import { api } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { LIKERT_OPTIONS, TIER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const formSchema = z.record(z.string(), z.number().min(1).max(5))

type FormData = z.infer<typeof formSchema>

export function ToxicityAssessment() {
  const router = useRouter()
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    percent: number
    tier: string
    advice: string
    shareId: string
  } | null>(null)

  const { data: questions, isLoading } = api.questions.getAll.useQuery()
  const submitAnswers = api.answers.submit.useMutation({
    onSuccess: (data) => {
      setResults(data)
      setShowResults(true)
      
      // Trigger animations based on score
      if (data.percent < 25) {
        launchConfetti()
      } else if (data.percent >= 75) {
        // Add shake animation to card
        const card = document.querySelector('.result-card')
        if (card) {
          card.classList.add('animate-shake')
          setTimeout(() => card.classList.remove('animate-shake'), 1000)
        }
      }
    },
    onError: (error) => {
      console.error('Submission error:', error)
      alert('Failed to submit assessment. Please try again.')
    }
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const launchConfetti = () => {
    const duration = 3 * 1000
    const end = Date.now() + duration
    const colors = ["#21e6c1", "#2781ff", "#ff38f5"]
    
    ;(function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  const onSubmit = (data: FormData) => {
    submitAnswers.mutate({ answers: data })
  }

  const allQuestionsAnswered = questions?.every(q => 
    form.watch(q.id) !== undefined
  ) ?? false

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", showResults && "result-card")}>
      <CardHeader className="text-center">
        <CardTitle>Relationship Toxicity Assessment</CardTitle>
        <CardDescription>
          Answer each question honestly to receive your personalized assessment
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!showResults ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {questions?.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <p className="font-medium text-gray-200">
                  {index + 1}. {question.text}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {LIKERT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "cursor-pointer text-center px-3 py-2 rounded-lg border border-gray-600",
                        "transition-all duration-200 text-xs sm:text-sm",
                        "hover:border-gray-500 focus-within:ring-2 focus-within:ring-teal-500",
                        form.watch(question.id) === option.value &&
                        "bg-gradient-to-r from-teal-500 to-pink-500 text-white border-transparent"
                      )}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={option.value}
                        {...form.register(question.id, { valueAsNumber: true })}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={!allQuestionsAnswered || submitAnswers.isPending}
            >
              {submitAnswers.isPending ? "Calculating..." : "Calculate Toxicity"}
            </Button>
          </form>
        ) : (
          results && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <ProgressBar value={results.percent} />
                <p className={cn("text-3xl font-bold neon", TIER_COLORS[results.tier as keyof typeof TIER_COLORS])}>
                  {results.percent}% Toxic
                </p>
                <p className="text-lg font-medium text-gray-200">
                  {results.tier} Relationship
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {results.advice}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push(`/share/${results.shareId}`)}
                  variant="outline"
                >
                  Share Results
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="secondary"
                >
                  View History
                </Button>
                <Button
                  onClick={() => {
                    setShowResults(false)
                    setResults(null)
                    form.reset()
                  }}
                  variant="ghost"
                >
                  Take Again
                </Button>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
