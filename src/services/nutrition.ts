import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const NutritionService = {
    /**
     * Log a new meal
     */
    async logMeal(data: Prisma.NutritionLogCreateInput) {
        try {
            return await db.nutritionLog.create({
                data,
            });
        } catch (error) {
            console.error('Error logging meal:', error);
            throw error;
        }
    },

    /**
     * Get meals for a user
     */
    async getMeals(userId: string) {
        try {
            return await db.nutritionLog.findMany({
                where: { userId },
                orderBy: { loggedAt: 'desc' },
            });
        } catch (error) {
            console.error('Error fetching meals:', error);
            throw error;
        }
    },

    /**
     * Get specific meal
     */
    async getMealById(id: string) {
        return await db.nutritionLog.findUnique({ where: { id } });
    },

    /**
     * Delete meal
     */
    async deleteMeal(id: string) {
        return await db.nutritionLog.delete({ where: { id } });
    }
};
