import { z } from "zod"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc"
import { computeScore } from "@/lib/compute-score"
import { generateShareId } from "@/lib/utils"

const AnswersSchema = z.record(z.string(), z.number().min(1).max(5))

export const answersRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        answers: AnswersSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get all active questions
      const questions = await ctx.db.question.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      // Compute score
      const result = computeScore(input.answers, questions)
      
      // Generate share ID
      const shareId = generateShareId()

      // Save to database
      const answerSet = await ctx.db.answerSet.create({
        data: {
          userId: ctx.session.user.id,
          answers: input.answers,
          rawScore: result.rawScore,
          percent: result.percent,
          tier: result.tier,
          shareId,
        },
      })

      return {
        id: answerSet.id,
        percent: result.percent,
        tier: result.tier,
        advice: result.advice,
        shareId,
      }
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.answerSet.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        percent: true,
        tier: true,
        createdAt: true,
        shareId: true,
      },
    })
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.answerSet.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    }),

  getByShareId: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.answerSet.findUnique({
        where: { shareId: input.shareId },
        select: {
          id: true,
          percent: true,
          tier: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Ensure user owns this answer set
      const answerSet = await ctx.db.answerSet.findUnique({
        where: { id: input.id },
        select: { userId: true },
      })

      if (!answerSet || answerSet.userId !== ctx.session.user.id) {
        throw new Error("Answer set not found or unauthorized")
      }

      return ctx.db.answerSet.delete({
        where: { id: input.id },
      })
    }),
})
