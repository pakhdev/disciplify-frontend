// ================================
//            USAGE OPTIONS
// ================================
//
// 1. **Auto Assign**
// --------------------------------
// To automatically initialize custom select elements, follow these steps:
//
// - Add the following JavaScript code at the end of your HTML file.
// new CustomSelectManager();
//
// - Include the following attributes in your <select> element:
// <select
//   custom-select="true"                                                // Required
//   custom-select-active-class="input-multi-select__add-button--active" // Optional
//   custom-select-placeholder="Select Category"                         // Optional
// >
//
// 2. **Manual Assign (not recommended)**
// --------------------------------
// If you prefer to manually initialize a specific select element, use the following code:
//
// const categoriesSelect = document.getElementById('your-element-id');
// const example = new SelectPopup({
//   element: categoriesSelect,
//   placeholder: 'Select Category',
//   activeClass: 'input-multi-select__add-button--active'
// });
// Attention! After removing the element from the DOM, you must call the removeClickHandler method to avoid memory leaks.
// example.removeClickHandler();

class SelectPopup {

    popupClass = 'select-popup';
    activeClass = null;
    popup = null;
    targetElement = null;
    options = [];
    width = 0;
    hasPlaceholder = false;

    onMousedownHandler = null;

    constructor(args) {
        const {
            element,
            placeholder,
            activeClass,
        } = args;

        this.targetElement = element;
        if (placeholder) this.addPlaceholder(placeholder);
        if (activeClass) this.activeClass = activeClass;

        this.targetElement.style.appearance = 'none';

        this.setWidth();
        this.targetElement.style.width = this.width.toString() + 'px';
        this.bindClickHandler();
    }

    createPopup() {
        const popup = document.createElement('div');
        popup.className = this.popupClass;
        this.populatePopup(popup);

        const { top, left } = this.calculatePosition();
        popup.style.top = top;
        popup.style.left = left;
        return popup;
    }

    populatePopup(popup) {
        this.extractOptions(this.targetElement);
        const startIdx = this.hasPlaceholder ? 1 : 0;
        this.options.slice(startIdx).forEach(({ value, text }) => {
            const optionLink = document.createElement('a');
            optionLink.innerText = text;
            optionLink.addEventListener('click', () => {
                this.targetElement.value = value;
                this.closePopup(this.targetElement);
                this.emitChangeEvent(this.targetElement);
            });
            popup.appendChild(optionLink);
        });
    }

    addPlaceholder(text) {
        if (this.isOptionSelected(this.targetElement)) return;
        this.hasPlaceholder = true;
        const placeHolder = document.createElement('option');
        placeHolder.text = text;
        placeHolder.selected = true;
        this.targetElement.insertBefore(placeHolder, this.targetElement.firstChild);
    }

    openPopup() {
        if (this.activeClass) this.targetElement.classList.add(this.activeClass);
        this.popup = this.createPopup();
        this.popup.style.width = this.width.toString() + 'px';
        this.targetElement.parentNode.insertBefore(this.popup, this.targetElement.nextSibling);
    }

    closePopup() {
        if (this.activeClass) this.targetElement.classList.remove(this.activeClass);
        this.popup.remove();
        this.popup = null;
    }

    setWidth() {
        const tempPopup = this.createPopup();
        tempPopup.style.visibility = 'hidden';
        document.body.appendChild(tempPopup);

        const tempTargetElement = this.targetElement.cloneNode(true);
        tempTargetElement.style.visibility = 'hidden';
        document.body.appendChild(tempTargetElement);

        const popupWidth = tempPopup.getBoundingClientRect().width;
        const selectWidth = tempTargetElement.getBoundingClientRect().width;
        this.width = Math.max(popupWidth, selectWidth);

        tempPopup.remove();
        tempTargetElement.remove();
    }

    calculatePosition() {
        const { bottom, left } = this.targetElement.getBoundingClientRect();
        const { top: parentTop, left: parentLeft } = this.targetElement.parentElement.getBoundingClientRect();
        return {
            top: bottom - parentTop.toString() + 'px',
            left: left - parentLeft.toString() + 'px',
        };
    }

    extractOptions() {
        this.options = Array.from(this.targetElement.querySelectorAll('option')).map(option => ({
            value: option.value,
            text: option.text,
        }));
    }

    bindClickHandler() {
        this.onMousedownHandler = (event) => {
            if (event.target === this.targetElement)
                this.handleClickOnSelect(event);
            else if (this.popup)
                this.handleClickOutside(event);
        };
        document.addEventListener('mousedown', this.onMousedownHandler);
    }

    removeClickHandler() {
        document.removeEventListener('mousedown', this.onMousedownHandler);
    }

    handleClickOutside(event) {
        if (!this.popup.contains(event.target)) {
            this.closePopup();
        }
    }

    handleClickOnSelect(event) {
        event.preventDefault();
        this.popup ? this.closePopup() : this.openPopup();
    }

    emitChangeEvent() {
        const event = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        this.targetElement.dispatchEvent(event);
    }

    isOptionSelected() {
        if (!(this.targetElement instanceof HTMLSelectElement))
            throw new Error('Provided element is not a select element.');
        return Array.from(this.targetElement.options).some(option => option.hasAttribute('selected'));
    }
}

class PopupSelectManager {

    customSelects = new Map();

    constructor() {
        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.handleAddedNodes(mutation.addedNodes);
                    this.handleRemovedNodes(mutation.removedNodes);
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        this.checkAndInitSelects();
    }

    checkAndInitSelects() {
        const selectElements = document.querySelectorAll('select[custom-select="true"]:not(.initialized)');
        selectElements.forEach(select => {
            this.initSelectPopup(select);
        });
    }

    initSelectPopup(element) {
        const placeholder = element.getAttribute('custom-select-placeholder') || undefined;
        const activeClass = element.getAttribute('custom-select-active-class') || undefined;
        element.classList.add('initialized');

        const selectPopupInstance = new SelectPopup({
            element: element,
            placeholder: placeholder,
            activeClass: activeClass,
        });
        this.customSelects.set(element, selectPopupInstance);
    }

    handleAddedNodes(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches('select[custom-select="true"]:not(.initialized)'))
                    this.initSelectPopup(node);

                const selectElements = node.querySelectorAll('select[custom-select="true"]:not(.initialized)');
                selectElements.forEach(select => this.initSelectPopup(select));
            }
        });
    }

    handleRemovedNodes(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches('select[custom-select="true"].initialized'))
                    this.removeSelectPopup(node);

                const removedSelects = node.querySelectorAll('select[custom-select="true"].initialized');
                removedSelects.forEach(select => this.removeSelectPopup(select));
            }
        });
    }

    removeSelectPopup(element) {
        const selectPopupInstance = this.customSelects.get(element);
        if (selectPopupInstance) {
            selectPopupInstance.removeClickHandler();
            this.customSelects.delete(element);
        }
    }

    disconnect() {
        this.observer.disconnect();
    }
}
