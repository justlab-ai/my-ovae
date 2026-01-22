import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(body.email);
        if (existingUser) {
            return NextResponse.json({
                success: true,
                message: "User already exists",
                data: existingUser
            }, { status: 200 });
        }

        const newUser = await UserService.createUser(body);

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            data: newUser
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating user API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        let user;
        if (userId) {
            user = await UserService.getUserById(userId);
        } else if (email) {
            user = await UserService.getUserByEmail(email);
        } else {
            return NextResponse.json(
                { success: false, error: 'User ID or Email query parameter required' },
                { status: 400 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
