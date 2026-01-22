import { NextRequest, NextResponse } from 'next/server';
import { NutritionService } from '@/services/nutrition';
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const userId = session.user.id;

        const body = await req.json();

        if (!body.mealName) {
            return NextResponse.json(
                { success: false, error: 'mealName is required' },
                { status: 400 }
            );
        }

        const entry = await NutritionService.logMeal({
            user: { connect: { id: userId } },
            mealName: body.mealName,
            foodItems: body.foodItems || "",
            pcosScore: body.pcosScore,
            photoURL: body.photoURL,
            loggedAt: body.loggedAt ? new Date(body.loggedAt) : undefined
        });

        return NextResponse.json({
            success: true,
            message: "Nutrition logged successfully",
            data: entry
        }, { status: 201 });

    } catch (error) {
        console.error('Error in Nutrition POST:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const userId = session.user.id;

        const log = await NutritionService.getMeals(userId);

        return NextResponse.json({
            success: true,
            data: log
        });

    } catch (error) {
        console.error("Error in Nutrition GET:", error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        await NutritionService.deleteMeal(id);

        return NextResponse.json({
            success: true,
            message: "Meal deleted successfully"
        });

    } catch (error) {
        console.error('Error in Nutrition DELETE:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
