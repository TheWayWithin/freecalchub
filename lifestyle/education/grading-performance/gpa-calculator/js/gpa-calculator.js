/*
 * FreecalcHub.com - GPA Calculator
 * Version: 1.0
 * Date Created: May 26, 2025
 * Description: Handles calculations and dynamic rows for the GPA Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const courseRowsContainer = document.getElementById('courseRowsContainer');
    const addCourseButton = document.getElementById('addCourseButton');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const currentGpaInput = document.getElementById('currentGpa');
    const currentCreditsInput = document.getElementById('currentCredits');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');
    const semesterGpaResult = document.getElementById('semesterGpaResult');
    const semesterCreditsResult = document.getElementById('semesterCreditsResult');
    const cumulativeGpaResult = document.getElementById('cumulativeGpaResult');
    const totalCreditsResult = document.getElementById('totalCreditsResult');
    const cumulativeGpaSection = document.getElementById('cumulativeGpaSection');
    const totalCreditsSection = document.getElementById('totalCreditsSection');
    const calculatorForm = document.getElementById('calculatorForm');

    // --- Grade Point Mapping ---
    const gradeMap = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "D-": 0.7,
        "F": 0.0
    };

    // --- Functions ---

    /**
     * Creates a new course row HTML structure.
     */
    function createCourseRow() {
        const row = document.createElement('div');
        row.className = 'form-row course-row';
        row.innerHTML = `
            <div class="form-group course-name">
                <label for="courseName_${Date.now()}">Course (Optional)</label>
                <input type="text" id="courseName_${Date.now()}" placeholder="e.g., MATH 101">
            </div>
            <div class="form-group course-grade">
                <label for="grade_${Date.now()}">Grade</label>
                <select id="grade_${Date.now()}" required>
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="D-">D-</option>
                    <option value="F">F</option>
                </select>
            </div>
            <div class="form-group course-credits">
                <label for="credits_${Date.now()}">Credits</label>
                <input type="number" id="credits_${Date.now()}" step="0.5" min="0" placeholder="3" required>
            </div>
            <button type="button" class="btn-remove-course">X</button>
        `;
        // Add event listener to the new remove button
        row.querySelector('.btn-remove-course').addEventListener('click', () => {
            row.remove();
            updateRemoveButtonsVisibility();
        });
        return row;
    }

    /**
     * Adds a new course row to the container.
     */
    function addCourse() {
        courseRowsContainer.appendChild(createCourseRow());
        updateRemoveButtonsVisibility();
    }

    /**
     * Ensures only one row doesn't show the remove button.
     */
     function updateRemoveButtonsVisibility() {
        const rows = courseRowsContainer.querySelectorAll('.course-row');
        rows.forEach((row, index) => {
            const button = row.querySelector('.btn-remove-course');
            if (button) {
                 button.style.display = (rows.length > 1) ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * Gathers data from all course rows.
     */
    function getCourseData() {
        const rows = courseRowsContainer.querySelectorAll('.course-row');
        const courses = [];
        let isValid = true;

        rows.forEach(row => {
            const gradeSelect = row.querySelector('select');
            const creditsInput = row.querySelector('input[type="number"]');
            
            gradeSelect.classList.remove('input-error');
            creditsInput.classList.remove('input-error');

            const grade = gradeSelect.value;
            const credits = parseFloat(creditsInput.value);

            let rowError = false;
            if (!grade) {
                gradeSelect.classList.add('input-error');
                isValid = false;
                rowError = true;
            }
            if (isNaN(credits) || credits < 0) {
                creditsInput.classList.add('input-error');
                isValid = false;
                rowError = true;
            }
            
            if (!rowError) {
                courses.push({ grade, credits });
            }
        });
        return { courses, isValid };
    }

    /**
     * Handles the main calculation logic.
     */
    function handleCalculate() {
        clearErrors();
        let errors = [];

        const { courses, isValid: coursesValid } = getCourseData();
        if (!coursesValid) {
            errors.push("Please enter valid grades and credits for all courses.");
        }
        if (courses.length === 0) {
            errors.push("Please add at least one course.");
        }

        const currentGpa = parseFloat(currentGpaInput.value);
        const currentCredits = parseFloat(currentCreditsInput.value);
        let cumulativeDataValid = true;

        // Validate cumulative inputs only if *both* are entered or *neither* are
        const gpaEntered = !isNaN(currentGpa);
        const creditsEntered = !isNaN(currentCredits);

        if (gpaEntered && !creditsEntered) {
             errors.push("Please enter Total Credits Earned if entering Current GPA.");
             currentCreditsInput.classList.add('input-error');
             cumulativeDataValid = false;
        } else if (!gpaEntered && creditsEntered) {
            errors.push("Please enter Current GPA if entering Total Credits Earned.");
            currentGpaInput.classList.add('input-error');
            cumulativeDataValid = false;
        } else if (gpaEntered && (currentGpa < 0 || currentGpa > 4.0)) {
            errors.push("Current GPA must be between 0.0 and 4.0.");
            currentGpaInput.classList.add('input-error');
            cumulativeDataValid = false;
        } else if (creditsEntered && currentCredits < 0) {
            errors.push("Total Credits Earned cannot be negative.");
            currentCreditsInput.classList.add('input-error');
            cumulativeDataValid = false;
        } else {
             currentGpaInput.classList.remove('input-error');
             currentCreditsInput.classList.remove('input-error');
        }
        
        // Show errors or proceed
        if (errors.length > 0 || !coursesValid) {
            showErrors(errors);
            hideResults();
            return;
        }

        // Calculate Semester GPA
        let semesterQualityPoints = 0;
        let semesterCredits = 0;
        courses.forEach(course => {
            semesterQualityPoints += (gradeMap[course.grade] || 0) * course.credits;
            semesterCredits += course.credits;
        });

        const semesterGpa = semesterCredits > 0 ? (semesterQualityPoints / semesterCredits) : 0;

        // Display Semester Results
        semesterGpaResult.textContent = semesterGpa.toFixed(3);
        semesterCreditsResult.textContent = semesterCredits.toFixed(1);
        resultsSection.style.display = 'block';

        // Calculate and Display Cumulative GPA (if applicable)
        if (cumulativeDataValid && gpaEntered && creditsEntered) {
            const previousQualityPoints = currentGpa * currentCredits;
            const totalQualityPoints = previousQualityPoints + semesterQualityPoints;
            const totalCredits = currentCredits + semesterCredits;
            const cumulativeGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;

            cumulativeGpaResult.textContent = cumulativeGpa.toFixed(3);
            totalCreditsResult.textContent = totalCredits.toFixed(1);
            cumulativeGpaSection.style.display = 'block';
            totalCreditsSection.style.display = 'block';
        } else {
            cumulativeGpaSection.style.display = 'none';
            totalCreditsSection.style.display = 'none';
        }
    }
    
    /**
     * Resets the form and results.
     */
    function handleReset() {
        calculatorForm.reset();
        // Remove all but the first course row
        const rows = courseRowsContainer.querySelectorAll('.course-row');
        rows.forEach((row, index) => {
            if (index > 0) {
                row.remove();
            } else {
                // Reset first row inputs
                row.querySelector('input[type="text"]').value = '';
                row.querySelector('select').value = '';
                row.querySelector('input[type="number"]').value = '';
            }
        });
        clearErrors();
        hideResults();
        updateRemoveButtonsVisibility();
    }

    function showErrors(errors) {
        errorMessagesDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        courseRowsContainer.querySelectorAll('input, select').forEach(el => el.classList.remove('input-error'));
        currentGpaInput.classList.remove('input-error');
        currentCreditsInput.classList.remove('input-error');
    }

    function hideResults() {
        resultsSection.style.display = 'none';
        semesterGpaResult.textContent = '--';
        semesterCreditsResult.textContent = '--';
        cumulativeGpaResult.textContent = '--';
        totalCreditsResult.textContent = '--';
    }

    // --- Event Listeners ---
    addCourseButton.addEventListener('click', addCourse);
    calculateButton.addEventListener('click', handleCalculate);
    resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    addCourse(); // Add the first row on page load
    updateRemoveButtonsVisibility(); // Ensure its remove button is hidden
});
