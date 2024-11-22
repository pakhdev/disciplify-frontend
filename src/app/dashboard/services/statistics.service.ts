import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DayStatistics } from '../interfaces/day-statistics.interface';
import { WeekStatistics } from '../interfaces/week-statistics.interface';
import { MonthStatistics } from '../interfaces/month-statistics.interface';
import { StatisticsState } from '../interfaces/statistics-state.interface';
import { finalize } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StatisticsService {

    private readonly http = inject(HttpClient);
    private statisticsState: WritableSignal<StatisticsState | null> = signal(null);
    public isLoading: WritableSignal<boolean> = signal(false);

    constructor() {
        this.fetchStatistics();
    }

    getDailyStats(optional: boolean): DayStatistics[] {
        return this.statisticsState()?.dayStatistics
            .filter(statistic => statistic.isOptional === optional) ?? [];
    }

    getWeeklyStats(optional: boolean): WeekStatistics[] {
        return this.statisticsState()?.weekStatistics
            .filter(statistic => statistic.isOptional === optional) ?? [];
    }

    getMonthlyStats(optional: boolean): MonthStatistics[] {
        return this.statisticsState()?.monthStatistics
            .filter(statistic => statistic.isOptional === optional) ?? [];
    }

    private fetchStatistics() {
        this.isLoading.set(true);
        this.http.get<StatisticsState>('/statistic')
            .pipe(
                finalize(() => this.isLoading.set(false)),
            ).subscribe(statistics => {
            this.statisticsState.set(statistics);
        });
    }
}