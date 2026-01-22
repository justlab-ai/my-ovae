import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const CycleService = {
    /**
     * Start a new cycle
     */
    async startCycle(data: Prisma.CycleCreateInput) {
        try {
            // Logic: Close previous cycle if exists?
            // For simplified MVP, just create.
            return await db.cycle.create({
                data,
            });
        } catch (error) {
            console.error('Error starting cycle:', error);
            throw error;
        }
    },

    /**
     * Log daily cycle data (flow, etc)
     */
    async logCycleDay(data: Prisma.CycleLogCreateInput) {
        try {
            return await db.cycleLog.create({ data });
        } catch (error) {
            console.error('Error logging cycle day:', error);
            throw error;
        }
    },

    /**
     * Get cycles for a user
     */
    async getCycles(userId: string) {
        try {
            return await db.cycle.findMany({
                where: { userId },
                orderBy: { startDate: 'desc' },
                include: { logs: true } // Include daily logs
            });
        } catch (error) {
            console.error('Error fetching cycles:', error);
            throw error;
        }
    },

    /**
     * Get specific cycle
     */
    async getCycleById(id: string) {
        return await db.cycle.findUnique({
            where: { id },
            include: { logs: true }
        });
    }
};
