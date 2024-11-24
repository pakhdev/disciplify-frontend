import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CategoriesService } from '../../services/categories.service';
import { NgClass } from '@angular/common';

@Component({
    standalone: true,
    selector: 'dashboard-create-category',
    templateUrl: './create-category.component.html',
    styles: [':host { display: contents; }'],
    imports: [FormsModule, NgClass],
})
export class CreateCategoryComponent {

    private categoriesService: CategoriesService = inject(CategoriesService);

    createCategory(form: NgForm): void {
        if (form.invalid) return;
        const name = form.controls['name'].value;
        if (!name) return;
        this.categoriesService.createCategory(name);
        form.reset();
    }
}
