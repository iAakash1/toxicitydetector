import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session } from 'next-auth'
import { auth } from '../auth'
import { ZodError } from 'zod'
import superjson from 'superjson'

import { db } from '../db'

type CreateContextOptions = {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  }
}

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts
  const session = await auth()

  return createInnerTRPCContext({
    session,
  })
}

// For App Router
export const createAppTRPCContext = async () => {
  const session = await auth()

  return createInnerTRPCContext({
    session,
  })
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  // You'll need to check user role from database
  // This is a simplified check - implement proper role checking
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(enforceUserIsAdmin)
