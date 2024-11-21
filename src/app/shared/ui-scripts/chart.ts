// ================================
//            USAGE OPTIONS
// ================================
//
// 1. **Auto Assign**
// --------------------------------
// To automatically initialize a chart in your Div, follow these steps:
//
// - Add the following JavaScript code at the end of your HTML file.
// new ChartManager();
//
// - Include the following attributes in your <div> element:
// <div
//     append-chart="true"
//     chart-width="400"
//     chart-height="130"
//     chart-labels='"Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"'
//     chart-data-numbers='10, 30, 28, 17, 10, 30, 18, 17, 10, 30, 48, 17'
// >
//
// 2. **Manual Assign**
// --------------------------------
// If you prefer to manually initialize a specific div element, use the following code:
//
// const monthlyChart = document.getElementById('your-element-id');
// new Chart({
//     width: 400,
//     height: 130,
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
//     dataNumbers: [10, 30, 28, 17, 10, 30, 18, 17, 10, 30, 48, 17],
//     container: monthlyChart
// })

interface ChartOptions {
    width: number;
    height: number;
    labels: string[];
    dataNumbers: number[];
    container: HTMLElement;
}

class Chart {
    private lineColor: string = 'rgba(168,229,242, 1)';
    private pointColor: string = 'rgba(168,229,242, 1)';
    private gridColor: string = '#F5F8FA';
    private padding: number = 20;
    private pointRadius: number = 5;
    private readonly width: number;
    private readonly height: number;
    private observer: MutationObserver;

    constructor({ width, height, labels, dataNumbers, container }: ChartOptions) {
        this.width = width;
        this.height = height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.ariaHidden = 'true';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context is not supported');

        this.drawChart(ctx, dataNumbers, labels);
        this.observer = this.observeAttributes(container, canvas);
    }

    private drawChart(ctx: CanvasRenderingContext2D, dataNumbers: number[], labels: string[]): void {
        const maxDataValue = Math.max(...dataNumbers);

        ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid(ctx);
        this.drawGraph(ctx, dataNumbers, maxDataValue);
        this.onPointHover(ctx.canvas, dataNumbers, labels, maxDataValue);
    }

    private drawGrid(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        const steps = 5;
        const stepHeight = (this.height - this.padding * 2) / steps;

        for (let i = 0; i <= steps; i++) {
            const y = this.padding + stepHeight * i;
            ctx.beginPath();
            ctx.moveTo(this.padding, y);
            ctx.lineTo(this.width - this.padding, y);
            ctx.stroke();
        }
    }

    private drawGraph(ctx: CanvasRenderingContext2D, dataNumbers: number[], maxDataValue: number): void {
        const width = this.width - this.padding * 2;
        const height = this.height - this.padding * 2;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.lineColor;

        for (let i = 0; i < dataNumbers.length; i++) {
            const x = this.padding + (width / (dataNumbers.length - 1)) * i;
            const y = this.height - this.padding - (dataNumbers[i] / maxDataValue) * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        for (let i = 0; i < dataNumbers.length; i++) {
            const x = this.padding + (width / (dataNumbers.length - 1)) * i;
            const y = this.height - this.padding - (dataNumbers[i] / maxDataValue) * height;

            ctx.beginPath();
            ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.pointColor;
            ctx.fill();
        }
    }

    private observeAttributes(container: HTMLElement, canvas: HTMLCanvasElement): MutationObserver {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    const labelsString = container.getAttribute('chart-labels') || '';
                    const dataNumbersString = container.getAttribute('chart-data-numbers') || '';

                    const labelsArray = labelsString.split(',').map(label => label.trim().replace(/['"]/g, ''));
                    const dataNumbersArray = dataNumbersString.split(',').map(number => Number(number.trim()));

                    labelsArray.unshift('Start');
                    dataNumbersArray.unshift(0);

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        this.drawChart(ctx, dataNumbersArray, labelsArray);
                    }
                }
            }
        });

        observer.observe(container, {
            attributes: true,
            attributeFilter: ['chart-labels', 'chart-data-numbers'],
        });
        return observer;
    }

    private onPointHover(canvas: HTMLCanvasElement, dataNumbers: number[], labels: string[], maxDataValue: number): void {
        let tooltip = canvas.parentNode?.querySelector('.chart__tooltip') as HTMLDivElement;

        if (tooltip)
            tooltip.remove();

        tooltip = document.createElement('div');
        tooltip.className = 'chart__tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'none';
        canvas.parentNode?.appendChild(tooltip);

        const width = this.width - this.padding * 2;
        const height = this.height - this.padding * 2;

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            let showTooltip = false;

            for (let i = 0; i < dataNumbers.length; i++) {
                const x = this.padding + (width / (dataNumbers.length - 1)) * i;
                const y = this.height - this.padding - (dataNumbers[i] / maxDataValue) * height;

                if (Math.abs(mouseX - x) < this.pointRadius && Math.abs(mouseY - y) < this.pointRadius) {
                    tooltip.style.left = `${ event.pageX + 10 }px`;
                    tooltip.style.top = `${ event.pageY + 10 }px`;
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `${ labels[i] ? `Date: ${ labels[i] }<br>` : '' }Result: ${ dataNumbers[i] }`;
                    showTooltip = true;
                    break;
                }
            }

            if (!showTooltip)
                tooltip.style.display = 'none';

        });
    }

}

export class ChartManager {
    private observer: MutationObserver;

    constructor() {
        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.checkAndInitCharts();
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        this.checkAndInitCharts();
    }

    private checkAndInitCharts(): void {
        const divElements = document.querySelectorAll<HTMLElement>('div[append-chart="true"][chart-width][chart-height][chart-labels][chart-data-numbers]:not(.initialized)');
        divElements.forEach(container => {
            this.initChart(container);
            container.classList.add('initialized');
        });
    }

    private initChart(container: HTMLElement): void {
        const width = Number(container.getAttribute('chart-width'));
        const height = Number(container.getAttribute('chart-height'));
        const labelsString = container.getAttribute('chart-labels') || '';
        const dataNumbersString = container.getAttribute('chart-data-numbers') || '';

        const labelsArray: string[] = labelsString.split(',').map(label => label.trim().replace(/['"]/g, ''));
        const dataNumbersArray: number[] = dataNumbersString.split(',').map(number => Number(number.trim()));

        new Chart({
            width,
            height,
            labels: labelsArray,
            dataNumbers: dataNumbersArray,
            container,
        });
    }

    disconnect(): void {
        this.observer.disconnect();
    }
}
