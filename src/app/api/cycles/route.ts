import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/services/cycles';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Distinguish between starting a cycle and logging a day?
        // Let's assume this endpoint handles 'Start Cycle' primarily for now, 
        // or checks a 'type' field. 
        // Given the previous mock, it was just "logging cycle data".

        // Let's support creating a Cycle.
        if (body.type === 'START_CYCLE') {
            if (!body.userId || !body.startDate) {
                return NextResponse.json({ error: 'userId and startDate required' }, { status: 400 });
            }
            const cycle = await CycleService.startCycle({
                user: { connect: { id: body.userId } },
                startDate: new Date(body.startDate),
                notes: body.notes
            });
            return NextResponse.json({ success: true, data: cycle }, { status: 201 });
        }

        // Support logging a day (CycleLog)
        if (body.type === 'LOG_DAY') {
            if (!body.userId || !body.cycleId || !body.date || !body.flow) {
                return NextResponse.json({ error: 'userId, cycleId, date, and flow required' }, { status: 400 });
            }
            const log = await CycleService.logCycleDay({
                user: { connect: { id: body.userId } },
                cycle: { connect: { id: body.cycleId } },
                date: new Date(body.date),
                flow: body.flow
            });
            return NextResponse.json({ success: true, data: log }, { status: 201 });
        }

        // Default fallthrough if type is missing (Backward compatibility with simple mock)
        // Assume creating a cycle
        if (body.startDate && body.userId) {
            const cycle = await CycleService.startCycle({
                user: { connect: { id: body.userId } },
                startDate: new Date(body.startDate),
                length: body.length,
                notes: body.notes
            });
            return NextResponse.json({ success: true, data: cycle }, { status: 201 });
        }

        return NextResponse.json({ success: false, error: 'Invalid operation. Specify type: START_CYCLE or LOG_DAY' }, { status: 400 });

    } catch (error) {
        console.error('Error in Cycle POST:', error);
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

        const cycles = await CycleService.getCycles(userId);

        return NextResponse.json({
            success: true,
            data: cycles
        });

    } catch (error) {
        console.error('Error in Cycle GET:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
