document.addEventListener('DOMContentLoaded', function() {
    console.log("Test calculator page JavaScript loaded.");
    const calcButton = document.getElementById('calculateButton');
    const resultOutput = document.getElementById('testResultOutput');
    const resultsSection = document.getElementById('resultsSection');

    if (calcButton) {
        calcButton.addEventListener('click', function() {
            resultsSection.style.display = 'block';
            if(resultOutput) {
                resultOutput.textContent = "Test calculation successful!";
            }
        });
    }
});
