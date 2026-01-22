import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const FitnessService = {
    /**
     * Log a new fitness activity
     */
    async logActivity(data: Prisma.FitnessActivityCreateInput) {
        try {
            return await db.fitnessActivity.create({
                data,
            });
        } catch (error) {
            console.error('Error logging fitness activity:', error);
            throw error;
        }
    },

    /**
     * Get activities for a user
     */
    async getActivities(userId: string) {
        try {
            return await db.fitnessActivity.findMany({
                where: { userId },
                orderBy: { completedAt: 'desc' },
            });
        } catch (error) {
            console.error('Error fetching fitness activities:', error);
            throw error;
        }
    },

    async deleteActivity(id: string) {
        return await db.fitnessActivity.delete({ where: { id } });
    }
};
