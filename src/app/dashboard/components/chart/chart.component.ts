import { Component, computed, inject, Input, signal, WritableSignal } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'dashboard-chart',
    templateUrl: './chart.component.html',
    imports: [CommonModule],
})
export class ChartComponent {
    @Input({ required: true }) public chartTitle: string = '';
    @Input({ required: true }) public period: 'day' | 'week' | 'month' = 'day';

    public mode: WritableSignal<'percentage' | 'points'> = signal('percentage');
    private readonly statisticsService = inject(StatisticsService);

    private monthNames: string[] = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
    ];
    private dateFormat = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' });

    public labels = computed(() => {
        const stats = this.getStats();
        return stats.map(stat => `"${ this.getLabel(stat) }"`).reverse();
    });

    public data = computed(() => {
        const stats = this.getStats();
        return stats.map(stat => stat[this.mode()]).reverse().join(',') || '';
    });

    public changeMode(mode: 'percentage' | 'points') {
        if (this.mode() !== mode)
            this.mode.set(mode);
    }

    private getStats() {
        switch (this.period) {
            case 'month':
                return this.statisticsService.getMonthlyStats(false);
            case 'week':
                return this.statisticsService.getWeeklyStats(false);
            case 'day':
                return this.statisticsService.getDailyStats(false);
            default:
                return [];
        }
    }

    private getLabel(statistic: any): string {
        if (this.period === 'month') {
            return this.monthNames[statistic.month];
        }
        if (this.period === 'day') {
            return this.dateFormat.format(new Date(statistic.date));
        }
        return '';
    }
}
