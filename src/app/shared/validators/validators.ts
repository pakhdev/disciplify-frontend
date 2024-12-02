import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';

export const isFieldOneEqualFieldTwo = (field1: string, field2: string): ValidatorFn => {
    return (formGroup: AbstractControl): ValidationErrors | null => {

        const fieldValue1 = formGroup.get(field1)?.value;
        const fieldValue2 = formGroup.get(field2)?.value;

        if (fieldValue1 !== fieldValue2) {
            formGroup.get(field2)?.setErrors({ notEqual: true });
            return { notEqual: true };
        }

        formGroup.get(field2)?.setErrors(null);
        return null;
    };
};

export const isDateAllowed = (allowedDaysField: string, initAtField: string): ValidatorFn => {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const allowedDays = formGroup.get(allowedDaysField)?.value;
        const initAt = formGroup.get(initAtField)?.value;
        const dayOfWeek = getWeekdayFromDateString(initAt);
        const daysMap: { [key: number]: string } = {
            0: 'Sun',
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thy',
            5: 'Fri',
            6: 'Sat',
        };
        if (!dayOfWeek || !allowedDays.includes(daysMap[dayOfWeek])) {
            formGroup.get('initAt')?.setErrors({ disallowedDaySelected: true });
            return { disallowedDaySelected: true };
        }

        formGroup.get('initAt')?.setErrors(null);
        return null;
    };
};

function getWeekdayFromDateString(dateString: string): number | null {
    const [day, month, year] = dateString.split('/').map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date.getDay();
}

