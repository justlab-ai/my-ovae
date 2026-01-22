'use server'

import { db } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"

export async function register(formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        if (!email || !password) {
            return { error: "Email and password are required" }
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "User already exists" }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create User
        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName: name,
            }
        })

        // Auto-login? Or redirect to login?
        // For now, let's just return success
        return { success: "User created!" }

    } catch (error) {
        console.error("Registration Error:", error)
        return { error: "Something went wrong" }
    }
}
