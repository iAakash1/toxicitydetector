import { z } from 'zod'

export const AnswerSchema = z.record(z.string(), z.number().min(1).max(5))

export type Answer = z.infer<typeof AnswerSchema>

export interface Question {
  id: string
  text: string
  weight: number
  order: number
}

export interface ScoreResult {
  rawScore: number
  percent: number
  tier: 'Healthy' | 'Manageable' | 'Concerning' | 'Toxic'
  advice: string
}

export const SCORE_TIERS = {
  HEALTHY: { min: 0, max: 24, label: 'Healthy' as const },
  MANAGEABLE: { min: 25, max: 49, label: 'Manageable' as const },
  CONCERNING: { min: 50, max: 74, label: 'Concerning' as const },
  TOXIC: { min: 75, max: 100, label: 'Toxic' as const },
}

export const ADVICE_MESSAGES = {
  Healthy: "Healthy dynamics! Keep communicating openly and supporting each other.",
  Manageable: "Some manageable issues detected. Consider discussing your concerns openly.",
  Concerning: "Concerning patterns detected. Setting clear boundaries may help improve your relationship.",
  Toxic: "High toxicity detected! Consider seeking professional guidance or support resources.",
} as const

/**
 * Computes toxicity score from user answers
 * @param answers Record of questionId -> likert response (1-5)
 * @param questions Array of question objects with weights
 * @returns ScoreResult with percentage, tier, and advice
 */
export function computeScore(answers: Answer, questions: Question[]): ScoreResult {
  let rawScore = 0
  let minRaw = 0
  let maxRaw = 0

  for (const question of questions) {
    const likertResponse = answers[question.id]
    if (likertResponse === undefined) {
      throw new Error(`Missing answer for question ${question.id}`)
    }

    // Convert 1-5 likert scale to -2...+2 range
    const mapped = likertResponse - 3
    rawScore += mapped * question.weight

    // Calculate theoretical min/max scores
    minRaw += -2 * Math.abs(question.weight)
    maxRaw += 2 * Math.abs(question.weight)
  }

  // Normalize to 0-100 percentage
  const percent = Math.round(((rawScore - minRaw) / (maxRaw - minRaw)) * 100)

  // Determine tier based on percentage
  let tier: ScoreResult['tier'] = 'Healthy'
  if (percent >= SCORE_TIERS.TOXIC.min) {
    tier = 'Toxic'
  } else if (percent >= SCORE_TIERS.CONCERNING.min) {
    tier = 'Concerning'
  } else if (percent >= SCORE_TIERS.MANAGEABLE.min) {
    tier = 'Manageable'
  }

  return {
    rawScore,
    percent,
    tier,
    advice: ADVICE_MESSAGES[tier],
  }
}
