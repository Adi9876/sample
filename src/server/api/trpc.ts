import { initTRPC, TRPCError } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";
import superjson from "superjson";
import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createTRPCContext = async () => {
  try {
    const headersList = headers();
    const session = await auth0.getSession(
      new NextRequest(process.env.AUTH0_BASE_URL || "http://localhost:3000", {
        headers: headersList,
      })
    );
    return {
      supabase,
      session,
    };
  } catch (error) {
    console.error("Error creating tRPC context:", error);
    return {
      supabase,
      session: null,
    };
  }
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
