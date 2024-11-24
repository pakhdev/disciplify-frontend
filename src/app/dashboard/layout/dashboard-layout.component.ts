import { Component, inject } from '@angular/core';
import { StatisticsService } from '../services/statistics.service';
import { ChartComponent } from '../components/chart/chart.component';
import { ChartManager } from '../../shared/ui-scripts/chart';
import { CreateCategoryComponent } from '../components/create-category/create-category.component';

@Component({
    standalone: true,
    selector: 'app-dashboard-layout',
    templateUrl: './dashboard-layout.component.html',
    styles: [':host { display: contents; }'],
    imports: [
        ChartComponent,
        CreateCategoryComponent,
    ],
})
export class DashboardLayoutComponent {
    private readonly statisticsService = inject(StatisticsService);

    constructor() {
        new ChartManager();
    }
}
