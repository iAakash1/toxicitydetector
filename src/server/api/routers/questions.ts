import { z } from "zod"
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc"

export const questionsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  }),

  create: adminProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        weight: z.number().min(-2).max(2),
        order: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.question.create({
        data: input,
      })
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(1).max(500).optional(),
        weight: z.number().min(-2).max(2).optional(),
        order: z.number().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.question.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.question.delete({
        where: { id: input.id },
      })
    }),
})
