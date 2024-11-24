import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Category } from '../interfaces/category.interface';
import { finalize } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {

    private readonly http = inject(HttpClient);
    public categories: WritableSignal<Category[]> = signal([]);
    public isLoading: WritableSignal<boolean> = signal(false);

    constructor() {
        this.fetchCategories();
    }

    public createCategory(name: string) {
        this.isLoading.set(true);
        this.http.post<Category>('/category', { name }).pipe(
            finalize(() => this.isLoading.set(false)),
        ).subscribe((newCategory: Category) => {
            this.categories.set([...this.categories(), newCategory]);
            console.log(this.categories());
        });
    }

    private fetchCategories() {
        this.isLoading.set(true);
        this.http.get<Category[]>('/category')
            .pipe(
                finalize(() => this.isLoading.set(false)),
            ).subscribe((categories: Category[]) => {
            this.categories.set(categories);
        });
    }
}
