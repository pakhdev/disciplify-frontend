// ================================
//            USAGE OPTIONS
// ================================
//
// 1. **Auto Assign**
// --------------------------------
// To automatically initialize a calendar in your inputs, follow these steps:
//
// - Add the following JavaScript code at the end of your HTML file.
// new CalendarManager();
//
// - Include the following attributes in your <input> element:
// <input type="text"
//    use-calendar="true"        // Required
//    calendar-position="right"  // Optional: right or behind
// >
//
// 2. **Manual Assign**
// --------------------------------
// If you prefer to manually initialize a specific input element, use the following code:
//
// const yourInput = document.getElementById('your-element-id');
// new Calendar({ element: yourInput, position: 'right' });

class Calendar {

    // Monday is the first day of the week (0) and Sunday is the last day of the week (6)
    dayWeekNumber = [6, 0, 1, 2, 3, 4, 5];
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    selectedMonth = 0;
    selectedYear = 0;

    targetElement = null;
    showFutureYears = 1;

    rightPadding = 10;
    bottomPadding = 5;
    position = 'right'; // right or behind
    calendarClass = 'calendar';
    headerClass = 'calendar__header';
    daysContainerClass = 'calendar__days';
    toolbarClass = 'calendar__toolbar';
    weekRowClass = 'calendar__days-row';
    selectClass = 'calendar__select';
    disabledDayClass = 'calendar__disabled-day';

    calendar = null;
    daysContainer = null;
    monthSelect = null;
    yearSelect = null;

    outsideClickListener = null;

    constructor(args) {
        const { element, position } = args;
        if (!element)
            throw new Error('Calendar: targetElement is required');
        this.targetElement = element;
        if (position) {
            this.position = position;
            console.log(position);
        }
        this.targetElement.parentElement.style.position = 'relative';
        this.selectedMonth = this.currentMonth;
        this.selectedYear = this.currentYear;
        this.bindInputClickHandler();
    }

    openCalendar() {
        this
            .getInputValue()
            .createCalendar()
            .createHeader()
            .createDaysContainer()
            .createToolbar()
            .populateDays(this.currentYear, this.currentMonth)
            .populateMonthSelect(this.currentMonth)
            .populateYearSelect(this.currentYear)
            .setOutsideClickListener();
    }

    closeCalendar() {
        this.calendar.remove();
        this.calendar = null;
        this.removeOutsideClickListener();
    }

    getInputValue() {
        const inputValue = this.targetElement.value;
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (regex.test(inputValue)) {
            const [day, month, year] = inputValue.split('/');
            this.selectedMonth = parseInt(month) - 1;
            this.selectedYear = parseInt(year);
        }
        return this;
    }

    calculateRightPosition(targetElement) {
        const { right, top } = targetElement.getBoundingClientRect();
        const { top: parentTop, left: parentLeft } = targetElement.parentElement.getBoundingClientRect();
        return {
            top: (top - parentTop) + 'px',
            left: (right - parentLeft + this.rightPadding) + 'px',
        };
    }

    calculateBehindPosition(targetElement) {
        const { bottom, left } = targetElement.getBoundingClientRect();
        const { top: parentTop, left: parentLeft } = targetElement.parentElement.getBoundingClientRect();
        return {
            top: (bottom - parentTop + this.bottomPadding) + 'px',
            left: (left - parentLeft) + 'px',
        };
    }

    bindInputClickHandler() {
        this.targetElement.addEventListener('click', () => {
            if (this.calendar)
                this.closeCalendar();
            else
                this.openCalendar();
        });
    }

    bindYearChangeHandler(selectElement) {
        selectElement.addEventListener('change', (e) => {
            this.selectedYear = Number(e.target.value);
            this.populateDays();
            this.populateMonthSelect();
        });
    }

    bindMonthChangeHandler(selectElement) {
        selectElement.addEventListener('change', (e) => {
            this.selectedMonth = Number(e.target.value);
            this.populateDays(e.target.value);
        });
    }

    setOutsideClickListener() {
        this.outsideClickListener = (event) => this.handleClickOutside(event);
        document.addEventListener('mousedown', this.outsideClickListener);
        return this;
    }

    removeOutsideClickListener() {
        document.removeEventListener('mousedown', this.outsideClickListener);
        this.outsideClickListener = null;
    }

    handleClickOutside(event) {
        if (!this.calendar.contains(event.target)) {
            this.closeCalendar();
        }
    }

    createCalendar() {
        this.calendar = document.createElement('div');
        const { top, left } = this.position === 'right'
            ? this.calculateRightPosition(this.targetElement)
            : this.calculateBehindPosition(this.targetElement);
        this.calendar.style.top = top;
        this.calendar.style.left = left;
        this.calendar.className = this.calendarClass;
        this.targetElement.parentElement.insertBefore(this.calendar, this.targetElement.nextSibling);
        return this;
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = this.headerClass;
        header.innerText = 'Select a date';
        this.calendar.appendChild(header);
        return this;
    }

    createDaysContainer() {
        const daysContainer = document.createElement('div');
        daysContainer.className = this.daysContainerClass;
        this.calendar.appendChild(daysContainer);
        this.daysContainer = daysContainer;
        return this;
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = this.toolbarClass;

        this.monthSelect = this.createCustomSelect('month');
        toolbar.appendChild(this.monthSelect);

        this.yearSelect = this.createCustomSelect('year');
        toolbar.appendChild(this.yearSelect);

        this.calendar.appendChild(toolbar);
        return this;
    }

    createCustomSelect(type) {
        const customSelect = document.createElement('select');
        customSelect.className = this.selectClass;
        customSelect.style.appearance = 'none';
        customSelect.setAttribute('custom-select', 'true');
        customSelect.setAttribute('custom-select-active-class', 'calendar__select--active');

        if (type === 'month') {
            this.bindMonthChangeHandler(customSelect);
        } else if (type === 'year') {
            this.bindYearChangeHandler(customSelect);
        }

        return customSelect;
    }

    createEmptyCell() {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add(this.disabledDayClass);
        return emptyCell;
    }

    populateDays() {
        this.daysContainer.innerHTML = '';

        if (this.selectedYear === this.currentYear && this.selectedMonth < this.currentMonth) {
            this.selectedMonth = this.currentMonth;
        }

        const firstDay = this.dayWeekNumber[new Date(this.selectedYear, this.selectedMonth, 1).getDay()];
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

        // Today
        const dateToCompare = new Date(this.currentYear, this.currentMonth, new Date().getDate());
        dateToCompare.setHours(0, 0, 0, 0);

        let weekCellCounter = 0;
        let currentRow = document.createElement('div');
        currentRow.className = this.weekRowClass;

        for (let i = 0; i < firstDay; i++) {
            currentRow.appendChild(this.createEmptyCell());
            weekCellCounter++;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            const day = document.createElement('a');

            if (new Date(this.selectedYear, this.selectedMonth, i) < dateToCompare) {
                dayDiv.classList.add(this.disabledDayClass);
            } else {
                day.onclick = () => this.setDateAndClose(i);
            }

            day.textContent = i.toString();
            dayDiv.appendChild(day);
            currentRow.appendChild(dayDiv);
            weekCellCounter++;

            if (weekCellCounter === 7) {
                this.daysContainer.appendChild(currentRow);
                currentRow = document.createElement('div');
                if (this.weekRowClass) currentRow.className = this.weekRowClass;
                weekCellCounter = 0;
            }
        }

        if (weekCellCounter > 0 && weekCellCounter < 7) {
            for (let i = weekCellCounter; i < 7; i++) {
                currentRow.appendChild(this.createEmptyCell());
            }
        }
        this.daysContainer.appendChild(currentRow);

        return this;
    }

    populateMonthSelect() {
        this.monthSelect.innerHTML = '';
        const startFrom = this.selectedYear === this.currentYear ? this.currentMonth : 0;
        for (let i = startFrom; i < this.months.length; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.text = this.months[i];
            if (i === this.selectedMonth) option.selected = true;
            this.monthSelect.appendChild(option);
        }
        return this;
    }

    populateYearSelect() {
        for (let i = this.currentYear; i <= this.currentYear + this.showFutureYears; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.text = i.toString();
            if (i === this.selectedYear) option.selected = true;
            this.yearSelect.appendChild(option);
        }

        return this;
    }

    setDateAndClose(day) {
        this.targetElement.value = `${ day }/${ this.selectedMonth + 1 }/${ this.selectedYear }`;
        this.closeCalendar();
    }
}

class CalendarManager {
    constructor() {
        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.checkAndInitCalendars();
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        this.checkAndInitCalendars();
    }

    checkAndInitCalendars() {
        const calendars = document.querySelectorAll('input[use-calendar="true"]');
        for (const calendar of calendars) {
            if (calendar.classList.contains('initialized'))
                continue;
            const position = calendar.getAttribute('calendar-position') || undefined;
            new Calendar({ element: calendar, position });
            calendar.classList.add('initialized');
        }
    }
}