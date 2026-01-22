
'use client';

import { useMemo, useState, useEffect } from 'react';
import { differenceInDays, subDays } from 'date-fns';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A centralized hook to fetch all common user health data points from our new API.
 * 
 * @param {number} daysToFetch - The number of days of data to fetch for time-sensitive collections.
 * @returns An object containing all the user's health data and their loading states.
 */
export function useUserHealthData(daysToFetch = 7, disableLogs = false) {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const userId = session?.user?.id;

    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    // 1. Fetch Cycles
    const { data: cyclesData, isLoading: areCyclesLoading } = useSWR(
        isAuthenticated ? '/api/cycles' : null,
        fetcher
    );
    const cycles = cyclesData ? (Array.isArray(cyclesData) ? cyclesData : [cyclesData]) : [];
    const latestCycle = useMemo(() => cycles.find((c: any) => !c.endDate) || cycles[0], [cycles]);

    // 2. Fetch Symptoms
    const { data: symptomsData, isLoading: areSymptomsLoading } = useSWR(
        isAuthenticated ? `/api/symptoms?limit=${daysToFetch * 5}` : null, // Fetch enough to cover range
        fetcher
    );
    const recentSymptoms = Array.isArray(symptomsData) ? symptomsData : [];

    // 3. Fetch Nutrition
    const { data: mealsData, isLoading: areMealsLoading } = useSWR(
        isAuthenticated ? `/api/nutrition` : null,
        fetcher
    );
    const recentMeals = Array.isArray(mealsData) ? mealsData : [];

    // 4. Fetch Fitness
    const { data: fitnessData, isLoading: areFitnessActivitiesLoading } = useSWR(
        isAuthenticated ? `/api/fitness` : null,
        fetcher
    );
    const recentFitnessActivities = Array.isArray(fitnessData) ? fitnessData : [];

    // 5. Daily Check-ins (Derived or Future API)
    // For now we might not have a dedicated API for this, or it's part of symptoms? 
    // Let's mock it purely to avoid breaking the UI until we build that specific API.
    const dailyCheckIns: any[] = [];
    const areCheckInsLoading = false;

    // --- Calculation Logic (Same as before) ---

    const { cycleDay, cyclePhase } = useMemo(() => {
        if (!isClient || !latestCycle?.startDate) {
            return { cycleDay: null, cyclePhase: 'Unknown' };
        }

        const start = new Date(latestCycle.startDate);
        const day = differenceInDays(new Date(), start) + 1;
        if (day <= 0) return { cycleDay: 1, cyclePhase: 'Menstrual' };

        const avgCycleLength = (latestCycle.length && latestCycle.length > 0) ? latestCycle.length : 28;
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
        areCyclesLoading,
        latestCycle,
        cycleDay,
        cyclePhase,
        recentSymptoms,
        areSymptomsLoading,
        recentMeals,
        areMealsLoading,
        recentFitnessActivities,
        areFitnessActivitiesLoading,
        dailyCheckIns,
        areCheckInsLoading,
        recentLabResults: [],
        areLabResultsLoading: false,
        historicalPeriodLogs: null,
        areLogsLoading: false,
    };
}
