import { Component, inject } from '@angular/core';
import { StatisticsService } from '../services/statistics.service';

@Component({
    standalone: true,
    selector: 'app-dashboard-layout',
    templateUrl: './dashboard-layout.component.html',
    styles: [':host { display: contents; }'],
    imports: [],
})
export class DashboardLayoutComponent {
    private readonly statisticsService = inject(StatisticsService);
}
