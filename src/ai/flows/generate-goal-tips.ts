'use server';

/**
 * @fileOverview A goal tips AI agent.
 *
 * - generateGoalTips - A function that handles the goal tips process.
 * - GenerateGoalTipsInput - The input type for the generateGoalTips function.
 * - GenerateGoalTipsOutput - The return type for the generateGoalTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalTipsInputSchema = z.object({
  completedHabits: z
    .array(z.string())
    .describe('An array of habits that the user has completed today.'),
  goals: z.array(z.string()).describe('An array of the user goals.'),
});
export type GenerateGoalTipsInput = z.infer<typeof GenerateGoalTipsInputSchema>;

const GenerateGoalTipsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .describe('An array of tips for achieving the daily goals.'),
});
export type GenerateGoalTipsOutput = z.infer<typeof GenerateGoalTipsOutputSchema>;

export async function generateGoalTips(input: GenerateGoalTipsInput): Promise<GenerateGoalTipsOutput> {
  return generateGoalTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalTipsPrompt',
  input: {schema: GenerateGoalTipsInputSchema},
  output: {schema: GenerateGoalTipsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized tips for achieving daily goals.

  Based on the habits the user has completed so far, and their overall goals, provide a few short, actionable tips to help them stay motivated and on track.

  Completed Habits: {{completedHabits}}
  Goals: {{goals}}`,
});

const generateGoalTipsFlow = ai.defineFlow(
  {
    name: 'generateGoalTipsFlow',
    inputSchema: GenerateGoalTipsInputSchema,
    outputSchema: GenerateGoalTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
