// ================================
//            USAGE OPTIONS
// ================================
//
// Multiple Selects are supported.
//
// CSS Classes Configuration:
// CSS classes can be passed through the attributes of the select element or in the args object when using manual initialization.
// If these classes are not provided, the default classes (hardcoded in SelectTabs) will be used. You can change
// these defaults if desired.
//
// Ways to initialize:
// 1. **Auto Assign**
// --------------------------------
// To automatically initialize custom select elements, follow these steps:
//
// - Add the following JavaScript code at the end of your HTML file.
// new SelectTabsManager();
//
// - Include the following attributes in your <select> element:
// <select
//     select-tabs="true"                                          // Required
//     select-tabs-active-class="input-option-selector__selected"  // Optional
//     select-tabs-option-class="input-option-selector__option"    // Optional
//     select-tabs-container-class="input-option-selector"         // Optional
// >
//
// 2. **Manual Assign**
// --------------------------------
// If you prefer to manually initialize a specific select element, use the following code:
//
// const yourVariable = document.getElementById('your-element-id');
// new SelectTabs({
//     element: yourVariable,                                // Required
//     containerClass: 'input-option-selector',              // Optional
//     activeOptionClass: 'input-option-selector__selected', // Optional
//     optionClass: 'input-option-selector__option'          // Optional
// });

class SelectTabs {

    targetElement = null;
    container = null;
    options = [];

    isMultiple = false;

    containerClass = 'input-option-selector';
    activeOptionClass = 'input-option-selector__selected';
    optionClass = 'input-option-selector__option';

    constructor(args) {
        const {
            element,
            containerClass,
            activeOptionClass,
            optionClass,
        } = args;

        this.targetElement = element;
        if (containerClass)
            this.containerClass = containerClass;
        if (activeOptionClass)
            this.activeOptionClass = activeOptionClass;
        if (optionClass)
            this.optionClass = optionClass;
        this.targetElement.style.display = 'none';

        if (this.targetElement.multiple)
            this.isMultiple = true;

        this
            .createContainer()
            .populateTabs();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = this.containerClass;
        this.targetElement.parentElement.insertBefore(this.container, this.targetElement.nextSibling);
        return this;
    }

    populateTabs() {
        this.extractOptions(this.targetElement);
        this.options.forEach(({ value, text, active }) => {
            const tab = document.createElement('div');
            const a = document.createElement('a');
            a.innerText = text;
            tab.appendChild(a);
            if (active) {
                tab.classList.add(this.activeOptionClass);
            } else {
                tab.className = this.optionClass;
            }
            tab.addEventListener('click', () => this.manageTabState(tab, value));
            this.container.appendChild(tab);
        });
    }

    extractOptions(element) {
        this.options = Array.from(element.options).map(option => ({
            value: option.value,
            text: option.text,
            active: option.selected,
        }));
    }

    manageTabState(tab, value) {
        if (this.isMultiple) {
            if (tab.className === this.activeOptionClass) {
                this.deactivateTab(tab, value);
            } else {
                this.activateTab(tab, value);
            }
        } else this.activateTab(tab, value);
    }

    activateTab(tab, value) {
        if (this.isMultiple) {
            this.selectOption(value);
        } else {
            this.container.querySelector(`.${ this.activeOptionClass }`).className = this.optionClass;
            this.assignSelectValue(value);
        }
        tab.className = this.activeOptionClass;
    }

    deactivateTab(tab, value) {
        tab.className = this.optionClass;
        this.unselectOption(value);
    }

    selectOption(value) {
        Array.from(this.targetElement.options).find(option => option.value === value).setAttribute('selected', 'selected');
        this.emitChangeEvent();
    }

    unselectOption(value) {
        Array.from(this.targetElement.options).find(option => option.value === value).removeAttribute('selected');
        this.emitChangeEvent();
    }

    assignSelectValue(value) {
        this.targetElement.value = value;
        this.options.forEach(option => option.active = option.value === value);
        this.emitChangeEvent();
    }

    emitChangeEvent() {
        const event = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        this.targetElement.dispatchEvent(event);
    }
}

class SelectTabsManager {
    constructor() {
        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.checkAndInitSelectTabs();
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        this.checkAndInitSelectTabs();
    }

    checkAndInitSelectTabs() {
        const selectElements = document.querySelectorAll('select[select-tabs="true"]:not(.initialized)');
        selectElements.forEach(select => {
            const containerClass = select.getAttribute('select-tabs-container-class');
            const activeOptionClass = select.getAttribute('select-tabs-active-class');
            const optionClass = select.getAttribute('select-tabs-option-class');
            new SelectTabs({
                element: select,
                containerClass,
                activeOptionClass,
                optionClass,
            });
            select.classList.add('initialized');
        });
    }
}
