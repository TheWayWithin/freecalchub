/**
 * Analytics Tracking for Mortgage Calculator
 * This file implements Google Analytics tracking for the mortgage calculator
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V8PR7EB78N');
    
    // Track calculator form submissions
    const calculatorForm = document.getElementById('mortgage-calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            // Get form values for enhanced tracking
            const countryCode = document.getElementById('country').value;
            const loanTerm = document.getElementById('loan-term').value;
            const hasExtraPayment = parseFloat(document.getElementById('extra-payment').value) > 0;
            
            // Track the event
            gtag('event', 'calculator_submission', {
                'calculator_type': 'Mortgage Calculator',
                'country': countryCode,
                'loan_term': loanTerm,
                'has_extra_payment': hasExtraPayment,
                'event_category': 'engagement'
            });
        });
    }
    
    // Track country selection changes
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', function() {
            gtag('event', 'country_selection', {
                'calculator_type': 'Mortgage Calculator',
                'country': this.value,
                'event_category': 'engagement'
            });
        });
    }
    
    // Track amortization schedule view toggle
    const showYearly = document.getElementById('show-yearly');
    const showMonthly = document.getElementById('show-monthly');
    
    if (showYearly && showMonthly) {
        showYearly.addEventListener('click', function() {
            gtag('event', 'amortization_view', {
                'calculator_type': 'Mortgage Calculator',
                'view_type': 'yearly',
                'event_category': 'engagement'
            });
        });
        
        showMonthly.addEventListener('click', function() {
            gtag('event', 'amortization_view', {
                'calculator_type': 'Mortgage Calculator',
                'view_type': 'monthly',
                'event_category': 'engagement'
            });
        });
    }
    
    // Track FAQ interactions
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                gtag('event', 'faq_interaction', {
                    'calculator_type': 'Mortgage Calculator',
                    'question': this.textContent.trim(),
                    'event_category': 'engagement'
                });
            });
        });
    }
    
    // Track related calculator clicks
    const relatedCalculatorLinks = document.querySelectorAll('.calculator-card a');
    if (relatedCalculatorLinks.length > 0) {
        relatedCalculatorLinks.forEach(link => {
            link.addEventListener('click', function() {
                gtag('event', 'related_calculator_click', {
                    'calculator_type': 'Mortgage Calculator',
                    'destination': this.getAttribute('href'),
                    'destination_name': this.textContent.trim(),
                    'event_category': 'navigation'
                });
            });
        });
    }
    
    console.log('Analytics tracking initialized for Mortgage Calculator');
});
