
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { differenceInDays, subDays } from 'date-fns';
import { CycleService } from '@/services/cycles';
import { SymptomService } from '@/services/symptoms';
import { NutritionService } from '@/services/nutrition';
import { FitnessService } from '@/services/fitness';

export const getHealthSummaryForUser = ai.defineTool(
  {
    name: 'getHealthSummaryForUser',
    description: "Get a user's recent health data from the last 7 days, including cycle phase, symptoms, nutrition, and workouts. Use this to provide contextually aware recommendations.",
    inputSchema: z.object({ userId: z.string().describe("The user's unique ID.") }),
    outputSchema: z.any(),
  },
  async ({ userId }) => {
    console.log('[getHealthSummaryForUser] Called with userId:', userId);
    if (!userId) {
      console.error('[getHealthSummaryForUser] Missing userId');
      return { error: 'User ID is required.' };
    }

    try {
      // Fetch all data in parallel
      const [
        cycles,
        symptoms,
        nutritionLogs,
        fitnessActivities,
      ] = await Promise.all([
        CycleService.getCycles(userId),
        SymptomService.getSymptoms(userId), // This gets all, we might want to filter by date in service but for now filter in memory if needed or rely on small data
        NutritionService.getMeals(userId),
        FitnessService.getActivities(userId),
      ]);

      // Filter for last 7 days in memory for now as services return all (optimization for later: add date filtering to services)
      const recentSymptoms = symptoms.filter(s => new Date(s.timestamp) >= subDays(new Date(), 7));
      const recentNutrition = nutritionLogs.filter(n => new Date(n.loggedAt) >= subDays(new Date(), 2));
      const recentFitness = fitnessActivities.filter(f => new Date(f.completedAt) >= subDays(new Date(), 7));

      // Process cycle data
      let cycleDay = null;
      let cyclePhase = 'Unknown';
      const latestCycle = cycles[0];

      if (latestCycle && latestCycle.startDate && !latestCycle.endDate) {
        const start = new Date(latestCycle.startDate);
        const day = differenceInDays(new Date(), start) + 1;
        cycleDay = day > 0 ? day : 1;

        const avgCycleLength = 28; // Default or calculate from history
        const ovulationDay = Math.round(avgCycleLength - 14);
        const follicularEnd = ovulationDay - 3;
        const ovulationEnd = ovulationDay + 2;

        if (day <= 5) cyclePhase = 'Menstrual';
        else if (day <= follicularEnd) cyclePhase = 'Follicular';
        else if (day <= ovulationEnd) cyclePhase = 'Ovulation';
        else cyclePhase = 'Luteal';
      }

      return {
        cycle: {
          day: cycleDay,
          phase: cyclePhase,
        },
        symptoms: recentSymptoms.map((s) => s.symptomType),
        nutrition: recentNutrition.map((n) => ({
          mealName: n.mealName,
          pcosScore: n.pcosScore,
          foodItems: n.foodItems
        })),
        fitness: recentFitness.map((f) => ({
          activityType: f.activityType,
          duration: f.duration
        })),
      };
    } catch (error: any) {
      return { error: `Failed to fetch health summary: ${error.message}` };
    }
  }
);
