import { createTRPCRouter } from "@/server/api/trpc"
import { questionsRouter } from "./routers/questions"
import { answersRouter } from "./routers/answers"

export const appRouter = createTRPCRouter({
  questions: questionsRouter,
  answers: answersRouter,
})

export type AppRouter = typeof appRouter
