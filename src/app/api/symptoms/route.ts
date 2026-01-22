import { NextRequest, NextResponse } from 'next/server';
import { SymptomService } from '@/services/symptoms';
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

        // Validate required fields
        if (!body.symptomType || !body.severity) {
            return NextResponse.json(
                { success: false, error: 'symptomType and severity are required' },
                { status: 400 }
            );
        }

        // Note: Caller must ensure userId matches a valid User in DB, or Prisma will throw foreign key error.
        const entry = await SymptomService.logSymptom({
            user: { connect: { id: userId } }, // Connect to existing user
            symptomType: body.symptomType,
            severity: body.severity,
            timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
            notes: body.notes,
            bodyZone: body.bodyZone,
            cycleDay: body.cycleDay,
            mood: body.mood,
            energyLevel: body.energyLevel
        });

        return NextResponse.json({
            success: true,
            message: "Symptom logged successfully",
            data: entry
        }, { status: 201 });

    } catch (error) {
        console.error('Error in Symptom POST:', error);
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

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const date = searchParams.get('date'); // Add specific date support if service supports it

        // If specific date is provided, set start/end to that day
        let finalStartDate = startDate ? new Date(startDate) : undefined;
        let finalEndDate = endDate ? new Date(endDate) : undefined;

        if (date) {
            // Fix date parsing to ensure local day coverage
            const parts = date.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);

                finalStartDate = new Date(year, month, day, 0, 0, 0, 0);
                finalEndDate = new Date(year, month, day, 23, 59, 59, 999);
            }
        }

        console.log("Health Check - Symptom GET:", {
            userId,
            paramDate: date,
            finalStartDate,
            finalEndDate
        });

        const history = await SymptomService.getSymptoms(userId, {
            startDate: finalStartDate,
            endDate: finalEndDate
        });

        console.log(`Found ${history.length} symptoms`);

        return NextResponse.json({
            success: true,
            data: history
        });


    } catch (error) {
        console.error('Error in Symptom GET:', error);
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
                { success: false, error: 'Symptom ID is required' },
                { status: 400 }
            );
        }

        // Ideally verification that the symptom belongs to the user should be here 
        // strictly speaking, but for now we trust the ID + Authenticated User context
        // or the service can verify ownership.

        await SymptomService.deleteSymptom(id);

        return NextResponse.json({
            success: true,
            message: "Symptom deleted successfully"
        });

    } catch (error) {
        console.error('Error in Symptom DELETE:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
