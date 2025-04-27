/**
 * Chart.js - Simplified version for mortgage calculator
 * This is a minimal implementation of Chart.js functionality needed for the mortgage calculator
 */

class Chart {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.render();
    }

    render() {
        // In a real implementation, this would render the chart
        // For this demo, we'll just add a placeholder
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.config.type === 'doughnut') {
            this.renderDoughnut(ctx);
        } else if (this.config.type === 'line') {
            this.renderLine(ctx);
        }
        
        // Add legend
        this.renderLegend();
    }
    
    renderDoughnut(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        const data = this.config.data.datasets[0].data;
        const colors = this.config.data.datasets[0].backgroundColor;
        const total = data.reduce((sum, value) => sum + value, 0);
        
        let startAngle = 0;
        
        // Draw segments
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const sliceAngle = 2 * Math.PI * (value / total);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[i];
            ctx.fill();
            
            startAngle += sliceAngle;
        }
        
        // Draw inner circle for doughnut
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    
    renderLine(ctx) {
        const datasets = this.config.data.datasets;
        const labels = this.config.data.labels;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        
        // Find max value for scaling
        let maxValue = 0;
        for (const dataset of datasets) {
            const dataMax = Math.max(...dataset.data.filter(v => v !== null));
            maxValue = Math.max(maxValue, dataMax);
        }
        
        // Draw each dataset
        for (const dataset of datasets) {
            const data = dataset.data.filter(v => v !== null);
            
            // Skip empty datasets
            if (data.length === 0) continue;
            
            ctx.beginPath();
            
            // Plot points
            for (let i = 0; i < data.length; i++) {
                const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
                const y = height - padding - (data[i] / maxValue) * (height - 2 * padding);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            // Style and stroke the line
            ctx.strokeStyle = dataset.borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Fill area under the line if fill is true
            if (dataset.fill) {
                const lastPoint = data.length - 1;
                const lastX = padding + (lastPoint / (data.length - 1)) * (width - 2 * padding);
                
                ctx.lineTo(lastX, height - padding);
                ctx.lineTo(padding, height - padding);
                ctx.closePath();
                
                ctx.fillStyle = dataset.backgroundColor;
                ctx.fill();
            }
        }
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    renderLegend() {
        // Create legend container if it doesn't exist
        let legendContainer = this.canvas.nextElementSibling;
        if (!legendContainer || !legendContainer.classList.contains('chart-legend')) {
            legendContainer = document.createElement('div');
            legendContainer.classList.add('chart-legend');
            this.canvas.parentNode.insertBefore(legendContainer, this.canvas.nextSibling);
        }
        
        // Clear existing legend
        legendContainer.innerHTML = '';
        
        // Add legend items
        const datasets = this.config.data.datasets;
        const labels = this.config.data.labels || [];
        
        if (this.config.type === 'doughnut') {
            const colors = datasets[0].backgroundColor;
            
            for (let i = 0; i < labels.length; i++) {
                const item = document.createElement('div');
                item.classList.add('legend-item');
                
                const colorBox = document.createElement('span');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = colors[i];
                
                const label = document.createElement('span');
                label.textContent = labels[i];
                
                item.appendChild(colorBox);
                item.appendChild(label);
                legendContainer.appendChild(item);
            }
        } else {
            for (const dataset of datasets) {
                const item = document.createElement('div');
                item.classList.add('legend-item');
                
                const colorBox = document.createElement('span');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = dataset.borderColor;
                
                const label = document.createElement('span');
                label.textContent = dataset.label;
                
                item.appendChild(colorBox);
                item.appendChild(label);
                legendContainer.appendChild(item);
            }
        }
    }
    
    destroy() {
        // Remove legend
        const legendContainer = this.canvas.nextElementSibling;
        if (legendContainer && legendContainer.classList.contains('chart-legend')) {
            legendContainer.remove();
        }
        
        // Clear canvas
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Add legend styles
const style = document.createElement('style');
style.textContent = `
.chart-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
}

.legend-item {
    display: flex;
    align-items: center;
    margin: 5px 10px;
}

.color-box {
    width: 12px;
    height: 12px;
    margin-right: 5px;
    border-radius: 2px;
}
`;
document.head.appendChild(style);
