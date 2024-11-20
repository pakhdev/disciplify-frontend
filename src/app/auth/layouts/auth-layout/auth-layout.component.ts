import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    imports: [
        CommonModule,
        RouterOutlet,
    ],
    styles: [`
        .main-container {
            background: #EDEFF1;
        }
    `],
    encapsulation: ViewEncapsulation.None,
})
export class AuthLayoutComponent {

}
