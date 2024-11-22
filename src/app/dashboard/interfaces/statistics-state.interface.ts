import { DayStatistics } from './day-statistics.interface';
import { WeekStatistics } from './week-statistics.interface';
import { MonthStatistics } from './month-statistics.interface';

export interface StatisticsState {
    dayStatistics: DayStatistics[];
    weekStatistics: WeekStatistics[];
    monthStatistics: MonthStatistics[];
}
