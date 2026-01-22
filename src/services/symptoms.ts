import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const SymptomService = {
    /**
     * Log a new symptom
     */
    async logSymptom(data: Prisma.SymptomLogCreateInput) {
        try {
            return await db.symptomLog.create({
                data,
            });
        } catch (error) {
            console.error('Error logging symptom:', error);
            throw error;
        }
    },

    /**
     * Get symptoms for a user, optionally filtered by date range or type
     */
    async getSymptoms(userId: string, filters?: {
        startDate?: Date,
        endDate?: Date,
        symptomType?: string
    }) {
        try {
            const where: Prisma.SymptomLogWhereInput = { userId };

            if (filters?.startDate || filters?.endDate) {
                where.timestamp = {};
                if (filters.startDate) where.timestamp.gte = filters.startDate;
                if (filters.endDate) where.timestamp.lte = filters.endDate;
            }

            if (filters?.symptomType) {
                where.symptomType = filters.symptomType;
            }

            return await db.symptomLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
            });
        } catch (error) {
            console.error('Error fetching symptoms:', error);
            throw error;
        }
    },

    /**
     * Delete a symptom log
     */
    async deleteSymptom(id: string) {
        try {
            return await db.symptomLog.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error deleting symptom:', error);
            throw error;
        }
    }
};
