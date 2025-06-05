import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { generateTextResponse, generateImageResponse } from "@/lib/gemini";

export const appRouter = createTRPCRouter({
  chat: {
    getConversations: publicProcedure.query(async ({ ctx }) => {
      const { supabase, session } = ctx;
      if (!session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.sub)
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return conversations;
    }),

    getMessages: publicProcedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { supabase, session } = ctx;
        if (!session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const { data: messages, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", input.conversationId)
          .order("created_at", { ascending: true });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return messages;
      }),

    createConversation: publicProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { supabase, session } = ctx;
        if (!session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const { data: conversation, error } = await supabase
          .from("conversations")
          .insert({
            user_id: session.user.sub,
            title: input.title || "New Conversation",
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return conversation;
      }),

    sendMessage: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          content: z.string(),
          messageType: z.enum(["text", "image"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { supabase, session } = ctx;
        if (!session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        // First, create the user message
        const { error: userMessageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: input.conversationId,
            content: input.content,
            role: "user",
            message_type: input.messageType,
          })
          .select()
          .single();

        if (userMessageError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: userMessageError.message,
          });
        }

        // Call AI API based on messageType
        let aiResponse: string;
        try {
          if (input.messageType === "image") {
            aiResponse = await generateImageResponse(input.content);
          } else {
            aiResponse = await generateTextResponse(input.content);
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Failed to generate AI response",
          });
        }

        const { data: aiMessage, error: aiMessageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: input.conversationId,
            content: aiResponse,
            role: "assistant",
            message_type: input.messageType,
          })
          .select()
          .single();

        if (aiMessageError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: aiMessageError.message,
          });
        }

        return aiMessage;
      }),

    deleteConversation: publicProcedure
      .input(z.object({ conversationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { supabase, session } = ctx;
        if (!session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const { error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", input.conversationId)
          .eq("user_id", session.user.sub);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return { success: true };
      }),
  },
});

export type AppRouter = typeof appRouter;
