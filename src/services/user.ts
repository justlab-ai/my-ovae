import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const UserService = {
    /**
     * Create a new user
     */
    async createUser(data: Prisma.UserCreateInput) {
        try {
            return await db.user.create({
                data,
            });
        } catch (error) {
            console.error('Error creating user service:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     */
    async getUserById(id: string) {
        try {
            return await db.user.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    },

    /**
     * Get user by Email
     */
    async getUserByEmail(email: string) {
        try {
            return await db.user.findUnique({
                where: { email },
            });
        } catch (error) {
            console.error('Error fetching user by Email:', error);
            throw error;
        }
    },

    /**
     * Update user data
     */
    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        try {
            return await db.user.update({
                where: { id },
                data,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    /**
     * Delete user
     */
    async deleteUser(id: string) {
        try {
            return await db.user.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};
