
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user';
import { SymptomService } from '@/services/symptoms';
import { NutritionService } from '@/services/nutrition';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const steps = [];
    try {
        // 1. Create a Test User
        const email = `test.user.${Date.now()}@example.com`;
        steps.push(`Creating User: ${email}`);

        const user = await UserService.createUser({
            email,
            displayName: 'Test User',
            onboardingCompleted: false
        });
        steps.push(`User Created: ${user.id}`);

        // 2. Log a Symptom
        steps.push('Logging Symptom (Headache)...');
        const symptom = await SymptomService.logSymptom({
            user: { connect: { id: user.id } },
            symptomType: 'Headache',
            severity: 4,
            notes: 'Testing backend'
        });
        steps.push(`Symptom Logged: ${symptom.id}`);

        // 3. Verify Symptom Retrieval
        steps.push('Verifying Symptom Retrieval...');
        const history = await SymptomService.getSymptoms(user.id);
        if (history.length > 0 && history[0].symptomType === 'Headache') {
            steps.push('Verification Successful: Found symptom in history.');
        } else {
            throw new Error('Verification Failed: Symptom not found.');
        }

        // 4. Log a Meal
        steps.push('Logging Meal (Salad)...');
        const meal = await NutritionService.logMeal({
            user: { connect: { id: user.id } },
            mealName: 'Lunch Salad',
            foodItems: 'Lettuce, Tomato, Chicken',
            pcosScore: 95
        });
        steps.push(`Meal Logged: ${meal.id}`);

        // 5. Cleanup
        steps.push('Cleaning up test data...');
        await UserService.deleteUser(user.id);
        steps.push('Test User deleted successfully.');

        return NextResponse.json({
            success: true,
            message: "End-to-End Database Verification Passed!",
            steps
        });

    } catch (error: any) {
        console.error('Verification Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            steps
        }, { status: 500 });
    }
}
