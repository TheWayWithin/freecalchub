/*
 * Calorie & Macro Calculator Specific JavaScript
 * Path: /health/nutrition/calorie-macro-calculator/js/calorie-macro-calculator.js
 */

document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // Input fields
    const genderMale = document.getElementById('gender_male');
    const genderFemale = document.getElementById('gender_female');
    const ageInput = document.getElementById('age');
    const heightFtInput = document.getElementById('height_ft');
    const heightInInput = document.getElementById('height_in');
    const heightCmInput = document.getElementById('height_cm');
    const weightLbsInput = document.getElementById('weight_lbs');
    const weightKgInput = document.getElementById('weight_kg');
    const activityLevelSelect = document.getElementById('activity_level');
    const bmrMifflin = document.getElementById('mifflin_st_jeor');
    const bmrHarris = document.getElementById('harris_benedict');
    const goalMaintenance = document.getElementById('goal_maintenance');
    const goalWeightLoss = document.getElementById('goal_weight_loss');
    const goalMuscleGain = document.getElementById('goal_muscle_gain');
    const unitPreferenceImperial = document.getElementById('imperial_units');
    const unitPreferenceMetric = document.getElementById('metric_units');

    // Output fields
    const resultBMR = document.getElementById('result_bmr');
    const resultTDEE = document.getElementById('result_tdee');
    const resultTargetCalories = document.getElementById('result_target_calories');
    const resultProteinG = document.getElementById('result_protein_g');
    const resultProteinCal = document.getElementById('result_protein_cal');
    const resultCarbsG = document.getElementById('result_carbs_g');
    const resultCarbsCal = document.getElementById('result_carbs_cal');
    const resultFatsG = document.getElementById('result_fats_g');
    const resultFatsCal = document.getElementById('result_fats_cal');

    // Unit preference toggling
    function toggleUnitInputs() {
        const isImperial = unitPreferenceImperial.checked;

        document.getElementById('height_imperial_group').style.display = isImperial ? 'block' : 'none';
        document.getElementById('weight_imperial_group').style.display = isImperial ? 'block' : 'none';
        document.getElementById('height_metric_group').style.display = isImperial ? 'none' : 'block';
        document.getElementById('weight_metric_group').style.display = isImperial ? 'none' : 'block';

        // Clear values of hidden inputs to prevent incorrect data submission/calculation
        if (isImperial) {
            heightCmInput.value = '';
            weightKgInput.value = '';
        } else {
            heightFtInput.value = '';
            heightInInput.value = '';
            weightLbsInput.value = '';
        }
    }

    unitPreferenceImperial.addEventListener('change', toggleUnitInputs);
    unitPreferenceMetric.addEventListener('change', toggleUnitInputs);

    // Initialize unit inputs visibility
    toggleUnitInputs();

    calculateButton.addEventListener('click', calculateCaloriesAndMacros);
    resetButton.addEventListener('click', resetCalculator);

    function displayError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = 'block';
        resultsSection.style.display = 'none'; // Hide results on error
    }

    function hideError() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.style.display = 'none';
    }

    function validateInputs() {
        hideError();
        const errors = [];

        const gender = document.querySelector('input[name="gender"]:checked');
        if (!gender) {
            errors.push("Please select your gender.");
        }

        const age = parseInt(ageInput.value);
        if (isNaN(age) || age < 1 || age > 120) {
            errors.push("Please enter a valid age between 1 and 120.");
        }

        let heightCm, weightKg;
        if (unitPreferenceImperial.checked) {
            const heightFt = parseInt(heightFtInput.value);
            const heightIn = parseInt(heightInInput.value);
            const weightLbs = parseFloat(weightLbsInput.value);

            if (isNaN(heightFt) || heightFt < 3 || heightFt > 7 || isNaN(heightIn) || heightIn < 0 || heightIn > 11) {
                errors.push("Please enter a valid height in feet (3-7) and inches (0-11).");
            } else {
                heightCm = (heightFt * 30.48) + (heightIn * 2.54); // Convert to cm
            }

            if (isNaN(weightLbs) || weightLbs < 50 || weightLbs > 700) {
                errors.push("Please enter a valid weight in pounds (50-700).");
            } else {
                weightKg = weightLbs * 0.453592; // Convert to kg
            }
        } else { // Metric
            heightCm = parseFloat(heightCmInput.value);
            weightKg = parseFloat(weightKgInput.value);

            if (isNaN(heightCm) || heightCm < 90 || heightCm > 250) {
                errors.push("Please enter a valid height in centimeters (90-250).");
            }
            if (isNaN(weightKg) || weightKg < 20 || weightKg > 350) {
                errors.push("Please enter a valid weight in kilograms (20-350).");
            }
        }

        if (!activityLevelSelect.value) {
            errors.push("Please select your activity level.");
        }

        const bmrFormula = document.querySelector('input[name="bmr_formula"]:checked');
        if (!bmrFormula) {
            errors.push("Please select a BMR formula.");
        }

        const goal = document.querySelector('input[name="goal"]:checked');
        if (!goal) {
            errors.push("Please select your goal.");
        }

        if (errors.length > 0) {
            displayError(errors.join('<br>'));
            return null; // Indicate validation failure
        }

        return {
            gender: gender.value,
            age: age,
            heightCm: heightCm,
            weightKg: weightKg,
            activityLevel: activityLevelSelect.value,
            bmrFormula: bmrFormula.value,
            goal: goal.value
        };
    }

    function calculateCaloriesAndMacros() {
        const inputs = validateInputs();
        if (!inputs) {
            return; // Stop if validation fails
        }

        const { gender, age, heightCm, weightKg, activityLevel, bmrFormula, goal } = inputs;

        // 1. BMR Calculation
        let bmr;
        if (bmrFormula === 'mifflin_st_jeor') {
            if (gender === 'male') {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else { // female
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }
        } else { // harris_benedict
            if (gender === 'male') {
                bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
            } else { // female
                bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
            }
        }
        bmr = Math.round(bmr); // Round to nearest whole number

        // 2. Activity Multiplier
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        };
        const activityMultiplier = activityMultipliers[activityLevel];

        // 3. TDEE Calculation
        let tdee = bmr * activityMultiplier;
        tdee = Math.round(tdee); // Round to nearest whole number

        // 4. Target Daily Calories
        let targetCalories;
        if (goal === 'maintenance') {
            targetCalories = tdee;
        } else if (goal === 'weight_loss') {
            targetCalories = tdee - 500;
        } else { // muscle_gain
            targetCalories = tdee + 300;
        }
        targetCalories = Math.round(targetCalories); // Round to nearest whole number

        // 5. Macronutrient Calculation
        const proteinCalsPerGram = 4;
        const carbsCalsPerGram = 4;
        const fatCalsPerGram = 9;

        let proteinPercent, carbsPercent, fatPercent;
        if (goal === 'weight_loss') {
            proteinPercent = 35;
            carbsPercent = 40;
            fatPercent = 25;
        } else if (goal === 'maintenance') {
            proteinPercent = 25;
            carbsPercent = 50;
            fatPercent = 25;
        } else { // muscle_gain
            proteinPercent = 30;
            carbsPercent = 45;
            fatPercent = 25;
        }

        const proteinCalories = targetCalories * (proteinPercent / 100);
        const proteinGrams = proteinCalories / proteinCalsPerGram;

        const carbsCalories = targetCalories * (carbsPercent / 100);
        const carbsGrams = carbsCalories / carbsCalsPerGram;

        const fatCalories = targetCalories * (fatPercent / 100);
        const fatGrams = fatCalories / fatCalsPerGram;

        // Display results
        resultBMR.textContent = `${bmr} kcal`;
        resultTDEE.textContent = `${tdee} kcal`;
        resultTargetCalories.textContent = `${targetCalories} kcal`;

        resultProteinG.textContent = `${proteinGrams.toFixed(1)} g`;
        resultProteinCal.textContent = `${proteinCalories.toFixed(0)} kcal`; // Round to whole number for display
        resultCarbsG.textContent = `${carbsGrams.toFixed(1)} g`;
        resultCarbsCal.textContent = `${carbsCalories.toFixed(0)} kcal`;
        resultFatsG.textContent = `${fatGrams.toFixed(1)} g`;
        resultFatsCal.textContent = `${fatCalories.toFixed(0)} kcal`;

        resultsSection.style.display = 'block';
    }

    function resetCalculator() {
        calculatorForm.reset();
        hideError();
        resultsSection.style.display = 'none';
        toggleUnitInputs(); // Reset unit input visibility
    }
});
