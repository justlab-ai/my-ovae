
'use client'

import { register } from "@/actions/auth"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function AuthTestPage() {
    const [message, setMessage] = useState("")

    async function handleRegister(formData: FormData) {
        const res = await register(formData)
        if (res?.error) setMessage("Error: " + res.error)
        else setMessage("Success: " + res.success)
    }

    return (
        <div className="p-10 max-w-md mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Authentication Test</h1>

            {message && <p className="bg-yellow-100 p-2 rounded">{message}</p>}

            <div className="border p-4 rounded">
                <h2 className="font-bold mb-4">1. Register New User</h2>
                <form action={handleRegister} className="space-y-4">
                    <input name="email" placeholder="Email" className="border p-2 w-full" required />
                    <input name="name" placeholder="Name" className="border p-2 w-full" />
                    <input name="password" type="password" placeholder="Password" className="border p-2 w-full" required />
                    <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">Sign Up</button>
                </form>
            </div>

            <div className="border p-4 rounded">
                <h2 className="font-bold mb-4">2. Login</h2>
                <p className="text-sm text-gray-500 mb-4">Clicking this will redirect to the NextAuth built-in login page.</p>
                <button
                    onClick={() => signIn()}
                    className="bg-green-600 text-white p-2 w-full rounded"
                >
                    Go to Login Page
                </button>
            </div>
        </div>
    )
}
