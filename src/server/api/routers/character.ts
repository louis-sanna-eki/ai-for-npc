import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const characterRouter = createTRPCRouter({
  // create a new character
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const newCharacter = await ctx.prisma.character.create({
          data: {
            name: input.name,
            data: input.data,
            userId: ctx.session.user.id,
          },
        });
        return newCharacter;
      } catch (error) {
        console.log("error", error);
        throw error;
      }
    }),

  // get all characters for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.character.findMany({
        // only get characters for the current user
      });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }),

  // get a single character by id
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.character.findUnique({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        console.log("error", error);
        throw error;
      }
    }),
});
