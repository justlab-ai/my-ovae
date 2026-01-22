import { NextRequest, NextResponse } from 'next/server';
import { FitnessService } from '@/services/fitness';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.userId || !body.activityType || !body.duration) {
            return NextResponse.json(
                { success: false, error: 'userId, activityType, and duration are required' },
                { status: 400 }
            );
        }

        const activity = await FitnessService.logActivity({
            user: { connect: { id: body.userId } },
            activityType: body.activityType,
            duration: body.duration,
            caloriesBurned: body.caloriesBurned,
            intensity: body.intensity,
            cyclePhase: body.cyclePhase,
            notes: body.notes,
            completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
            // Helper to handle JSON fields safely if passed
            energyLevel: body.energyLevel,
            effectiveness: body.effectiveness
        });

        return NextResponse.json({
            success: true,
            message: "Fitness activity logged successfully",
            data: activity
        }, { status: 201 });

    } catch (error) {
        console.error('Error in Fitness POST:', error);
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

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            );
        }

        const activities = await FitnessService.getActivities(userId);

        return NextResponse.json({
            success: true,
            data: activities
        });

    } catch (error) {
        console.error('Error in Fitness GET:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
