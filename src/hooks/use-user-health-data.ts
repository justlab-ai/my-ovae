
'use client';

import { useMemo, useState, useEffect } from 'react';
import { differenceInDays, subDays } from 'date-fns';

/**
 * A centralized hook to fetch all common user health data points.
 * This avoids duplicating query logic across multiple components.
 * 
 * @param {number} daysToFetch - The number of days of data to fetch for time-sensitive collections.
 * @returns An object containing all the user's health data and their loading states.
 */
export function useUserHealthData(daysToFetch = 7, disableLogs = false) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const dateLimit = useMemo(() => subDays(new Date(), daysToFetch), [daysToFetch]);

    // --- Mock Data ---
    const cycles = [{ id: '1', startDate: new Date(), endDate: null, length: 28 }];
    const recentSymptoms = [];
    const recentMeals = [];
    const recentFitnessActivities = [];
    const dailyCheckIns = [];
    const recentLabResults = [];
    const historicalPeriodLogs = null;

    const latestCycle = useMemo(() => cycles?.[0], [cycles]);

    const { cycleDay, cyclePhase } = useMemo(() => {
        if (!isClient || !latestCycle?.startDate || latestCycle.endDate) {
            return { cycleDay: null, cyclePhase: 'Unknown' };
        }

        const start = latestCycle.startDate;
        const day = differenceInDays(new Date(), start) + 1;
        if (day <= 0) return { cycleDay: 1, cyclePhase: 'Menstrual' };

        const avgCycleLength = (latestCycle.length && typeof latestCycle.length === 'number' && latestCycle.length > 0) ? latestCycle.length : 28;
        const ovulationDay = Math.round(avgCycleLength - 14);
        const follicularEnd = ovulationDay > 5 ? ovulationDay - 3 : 5;
        const ovulationEnd = ovulationDay + 2;

        let phase = 'Luteal';
        if (day <= 5) phase = 'Menstrual';
        else if (day <= follicularEnd) phase = 'Follicular';
        else if (day <= ovulationEnd) phase = 'Ovulation';
        
        return { cycleDay: day, cyclePhase: phase };
    }, [latestCycle, isClient]);

    return {
        cycles,
        areCyclesLoading: false,
        latestCycle,
        cycleDay,
        cyclePhase,
        recentSymptoms,
        areSymptomsLoading: false,
        recentMeals,
        areMealsLoading: false,
        recentFitnessActivities,
        areFitnessActivitiesLoading: false,
        dailyCheckIns,
        areCheckInsLoading: false,
        recentLabResults,
        areLabResultsLoading: false,
        historicalPeriodLogs,
        areLogsLoading: false,
    };
}
