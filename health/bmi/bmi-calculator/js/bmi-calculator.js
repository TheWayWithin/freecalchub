document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bmi-calculator-form");
    const unitToggles = document.querySelectorAll(".unit-toggle");
    const metricInputs = document.querySelectorAll(".metric-input");
    const imperialInputs = document.querySelectorAll(".imperial-input");
    const resultsArea = document.getElementById("bmi-results");
    const heightCmInput = document.getElementById("height_cm");
    const heightFtInput = document.getElementById("height_ft");
    const heightInInput = document.getElementById("height_in");
    const weightKgInput = document.getElementById("weight_kg");
    const weightLbsInput = document.getElementById("weight_lbs");
    const ageInput = document.getElementById("age");

    let currentUnit = "metric"; // Default unit

    // --- Unit Switching Logic ---
    unitToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            currentUnit = toggle.dataset.unit;
            
            // Update button styles
            unitToggles.forEach(btn => btn.classList.remove("active"));
            toggle.classList.add("active");

            // Show/hide relevant inputs
            if (currentUnit === "metric") {
                metricInputs.forEach(input => input.style.display = "block");
                imperialInputs.forEach(input => input.style.display = "none");
                // Clear imperial inputs and remove required if necessary (or handle in validation)
                heightFtInput.value = "";
                heightInInput.value = "";
                weightLbsInput.value = "";
            } else {
                metricInputs.forEach(input => input.style.display = "none");
                imperialInputs.forEach(input => input.style.display = "block");
                // Clear metric inputs
                heightCmInput.value = "";
                weightKgInput.value = "";
            }
            clearResults(); // Clear results when units change
        });
    });

    // --- Helper Functions ---
    function displayError(message) {
        resultsArea.innerHTML = `<p class="error">Error: ${message}</p>`;
    }

    function clearResults() {
        resultsArea.innerHTML = `<p>Please enter your details above and click "Calculate BMI".</p>`;
    }

    function getBMICategory(bmi) {
        if (bmi < 18.5) return "Underweight";
        if (bmi >= 18.5 && bmi < 25) return "Normal weight";
        if (bmi >= 25 && bmi < 30) return "Overweight";
        if (bmi >= 30 && bmi < 35) return "Obesity Class I";
        if (bmi >= 35 && bmi < 40) return "Obesity Class II";
        if (bmi >= 40) return "Obesity Class III";
        return "N/A"; // Should not happen with valid BMI
    }
    
    function calculateHealthyWeightRange(heightMeters) {
        const lowerBMI = 18.5;
        const upperBMI = 24.9;
        const lowerWeightKg = lowerBMI * (heightMeters * heightMeters);
        const upperWeightKg = upperBMI * (heightMeters * heightMeters);
        
        if (currentUnit === "metric") {
            return `${lowerWeightKg.toFixed(1)} kg - ${upperWeightKg.toFixed(1)} kg`;
        } else {
            const kgToLbs = 2.20462;
            const lowerWeightLbs = lowerWeightKg * kgToLbs;
            const upperWeightLbs = upperWeightKg * kgToLbs;
            return `${lowerWeightLbs.toFixed(1)} lbs - ${upperWeightLbs.toFixed(1)} lbs`;
        }
    }

    // --- Form Submission Logic ---
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let height, weight, heightMeters;
        const age = parseInt(ageInput.value);
        let isChildOrTeen = age >= 2 && age <= 19;

        // --- Input Gathering & Validation ---
        try {
            if (currentUnit === "metric") {
                height = parseFloat(heightCmInput.value);
                weight = parseFloat(weightKgInput.value);
                if (isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
                    throw new Error("Please enter valid positive numbers for height and weight.");
                }
                heightMeters = height / 100;
            } else { // Imperial
                const heightFt = parseFloat(heightFtInput.value);
                const heightIn = parseFloat(heightInInput.value) || 0; // Default inches to 0 if empty
                weight = parseFloat(weightLbsInput.value);
                
                if (isNaN(heightFt) || heightFt < 0 || isNaN(heightIn) || heightIn < 0 || isNaN(weight) || weight <= 0) {
                    throw new Error("Please enter valid positive numbers for height (feet and inches) and weight.");
                }
                if (heightFt === 0 && heightIn === 0) {
                     throw new Error("Height cannot be zero.");
                }
                const totalInches = (heightFt * 12) + heightIn;
                heightMeters = totalInches * 0.0254;
                if (heightMeters <= 0) throw new Error("Height must be positive.");
            }
            
            if (isChildOrTeen && isNaN(age)) {
                 throw new Error("Age is required for BMI calculation for individuals aged 2-19.");
            }

        } catch (error) {
            displayError(error.message);
            return;
        }

        // --- BMI Calculation ---
        let bmi;
        if (currentUnit === "metric") {
            bmi = weight / (heightMeters * heightMeters);
        } else { // Imperial
            const totalInches = heightMeters / 0.0254;
            bmi = 703 * (weight / (totalInches * totalInches));
        }

        if (isNaN(bmi) || !isFinite(bmi)) {
            displayError("Could not calculate BMI. Please check your inputs.");
            return;
        }
        
        const bmiRounded = bmi.toFixed(1);

        // --- Result Display ---
        let resultHTML = `<h3>Your Results</h3>`;
        resultHTML += `<p>Your BMI is: <strong class="bmi-value">${bmiRounded}</strong></p>`;

        if (isChildOrTeen) {
            resultHTML += `<p>For age ${age}, BMI interpretation requires comparison to age and sex specific percentile charts. Consult a healthcare provider for accurate assessment.</p>`;
            // NOTE: Actual percentile calculation is complex and requires extensive data tables or an API.
            // We are only displaying the calculated BMI value for now.
        } else {
            const category = getBMICategory(bmi);
            const healthyRange = calculateHealthyWeightRange(heightMeters);
            resultHTML += `<p>This places you in the <strong class="bmi-category">${category}</strong> category.</p>`;
            resultHTML += `<p>For your height, a healthy weight range is approximately: <strong>${healthyRange}</strong>.</p>`;
            // Add placeholder for personalized recommendations based on category/activity/sex later
            resultHTML += `<p><small>Note: BMI is a screening tool. Consult a healthcare professional for personalized health advice.</small></p>`;
        }

        resultsArea.innerHTML = resultHTML;
    });

    // --- Reset Logic ---
    form.addEventListener("reset", () => {
        clearResults();
        // Optionally reset unit toggle to default
        // currentUnit = "metric";
        // unitToggles.forEach(btn => btn.classList.remove("active"));
        // document.querySelector('.unit-toggle[data-unit="metric"]').classList.add("active");
        // metricInputs.forEach(input => input.style.display = "block");
        // imperialInputs.forEach(input => input.style.display = "none");
    });

});

