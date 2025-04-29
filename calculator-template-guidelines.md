# Calculator Template Usage Guidelines

## Overview

This document provides guidelines for using the CalcHub calculator template system to create new calculator pages. The template system ensures consistency across all calculators while allowing for easy customization of calculator-specific content.

## File Structure

```
/
├── css/
│   ├── styles.css                  # Global site styles
│   ├── calculator.css              # Common calculator styles
│   └── calculator-template-grid.css # Grid layout system for calculators
├── js/
│   └── main.js                     # Global JavaScript (dark mode, mobile menu)
└── [category]/
    └── [calculator-name]/
        ├── index.html              # Calculator page using template
        ├── css/
        │   └── [calculator-name].css # Calculator-specific styles
        └── js/
            └── [calculator-name].js  # Calculator-specific JavaScript
```

## Creating a New Calculator

### 1. Start with the Template

Copy the `calculator-template.html` file and replace the placeholders with your calculator-specific content:

```html
<!-- Replace these placeholders -->
{{CALCULATOR_TITLE}}
{{CALCULATOR_DESCRIPTION}}
{{CATEGORY_URL}}
{{CATEGORY_NAME}}
{{CALCULATOR_NAME}}
{{CALCULATOR_ID}}
{{CALCULATOR_INTRO_TEXT}}
{{CALCULATOR_FORM_INPUTS}}
{{CALCULATOR_INFO_CONTENT}}
```

### 2. Form Inputs Structure

Use the CSS Grid layout system for form inputs. Each input should be wrapped in a `calculator-grid-item` div:

```html
<div class="calculator-grid-item">
    <label for="input_id">Input Label</label>
    <div class="calculator-input-group">
        <span class="input-prefix">$</span> <!-- Optional prefix -->
        <input type="text" id="input_id" name="input_name" class="form-control" value="default">
        <span class="input-suffix">%</span> <!-- Optional suffix -->
    </div>
</div>
```

For inputs that should span the full width:

```html
<div class="calculator-grid-full">
    <!-- Input content -->
</div>
```

### 3. Responsive Behavior

The template automatically handles responsive behavior:
- 3 columns on large screens (min-width: 1024px)
- 2 columns on medium screens (min-width: 768px)
- 1 column on small screens (mobile)

### 4. Results Container

The results container is already set up in the template:

```html
<div id="results-container" class="calculator-results"></div>
```

Your JavaScript should populate this container with calculation results.

### 5. JavaScript Integration

Create a calculator-specific JavaScript file that:
1. Handles form submission
2. Performs calculations
3. Populates the results container
4. Manages any calculator-specific interactions

Example:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculator-id-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get input values
        const input1 = parseFloat(document.getElementById('input1').value);
        const input2 = parseFloat(document.getElementById('input2').value);
        
        // Perform calculations
        const result = input1 + input2;
        
        // Display results
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
            <h3>Results</h3>
            <div class="calculator-results-summary">
                <div class="calculator-result-item">
                    <span class="calculator-result-label">Result:</span>
                    <span class="calculator-result-value">${result}</span>
                </div>
            </div>
        `;
    });
});
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for IDs and classes
2. **Validation**: Include input validation in your JavaScript
3. **Error Handling**: Provide clear error messages for invalid inputs
4. **Accessibility**: Ensure all inputs have proper labels and ARIA attributes
5. **Documentation**: Add comments to your code explaining calculator-specific logic
6. **Testing**: Test your calculator on different screen sizes and browsers

## Example

See `mortgage-calculator-template-example.html` for a complete example of the mortgage calculator implemented using the template system.
