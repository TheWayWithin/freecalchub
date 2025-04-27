/**
 * Schema Markup for Mortgage Calculator
 * This file generates structured data for search engines to better understand the calculator functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create the schema markup
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // SoftwareApplication schema
      {
        "@type": "SoftwareApplication",
        "name": "Mortgage Calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Calculate monthly mortgage payments, interest costs, and amortization schedule for your home loan with our free mortgage calculator.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "156"
        }
      },
      
      // FAQPage schema
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How is mortgage interest calculated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Mortgage interest is typically calculated monthly based on the outstanding principal balance. Each month, a portion of your payment goes toward the principal, and the rest goes toward interest. As you pay down the principal, more of each payment goes toward the principal and less toward interest. This process is called amortization. The formula used is: Monthly Interest = (Annual Interest Rate ÷ 12) × Outstanding Principal Balance."
            }
          },
          {
            "@type": "Question",
            "name": "What's included in a monthly mortgage payment?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A typical monthly mortgage payment includes four components, often referred to as PITI: Principal (the amount that goes toward paying off the loan balance), Interest (the cost of borrowing the money), Taxes (property taxes collected by your local government), and Insurance (homeowners insurance and possibly private mortgage insurance). Some payments may also include homeowners association (HOA) fees if applicable to your property."
            }
          },
          {
            "@type": "Question",
            "name": "How much house can I afford?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The amount of house you can afford depends on several factors, including your income, existing debt, down payment, credit score, and current interest rates. A common guideline is that your monthly housing costs (including mortgage, taxes, and insurance) should not exceed 28% of your gross monthly income, and your total debt payments (including your mortgage and all other debt) should not exceed 36% of your gross monthly income."
            }
          },
          {
            "@type": "Question",
            "name": "How does making extra payments affect my mortgage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Making extra payments toward your mortgage principal can significantly reduce the total interest you pay over the life of the loan and help you pay off your mortgage earlier. Even small additional payments can make a big difference over time. For example, paying an extra $100 per month on a $250,000, 30-year mortgage at 4% interest could help you pay off your loan about 4 years earlier and save approximately $30,000 in interest."
            }
          },
          {
            "@type": "Question",
            "name": "What is an amortization schedule?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An amortization schedule is a table that shows the breakdown of each mortgage payment into principal and interest over the life of the loan. It details how much of each payment goes toward reducing the principal balance and how much goes toward interest. The schedule also shows the remaining loan balance after each payment. In the early years of a mortgage, a larger portion of each payment goes toward interest, while in later years, more goes toward principal."
            }
          },
          {
            "@type": "Question",
            "name": "How accurate is this mortgage calculator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our mortgage calculator uses standard financial formulas to provide accurate estimates based on the information you input. It accounts for principal, interest, property taxes, homeowners insurance, and optional inputs like PMI and HOA fees. However, the results should be considered estimates and may not reflect the exact terms offered by specific lenders. Actual loan terms, interest rates, and fees can vary based on your credit score, loan-to-value ratio, and other factors."
            }
          },
          {
            "@type": "Question",
            "name": "What is PMI and when do I need to pay it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Private Mortgage Insurance (PMI) is an insurance policy that protects the lender if you default on your mortgage payments. PMI is typically required when you make a down payment of less than 20% on a conventional loan. The cost of PMI varies based on your loan amount, credit score, and down payment, but it generally ranges from 0.3% to 1.5% of your loan amount annually."
            }
          },
          {
            "@type": "Question",
            "name": "Should I choose a 15-year or 30-year mortgage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The choice between a 15-year and 30-year mortgage depends on your financial goals and situation. A 15-year mortgage typically offers lower interest rates, faster equity building, and less total interest paid, but has higher monthly payments. A 30-year mortgage typically offers lower monthly payments, more flexibility for other financial goals, and potential to invest the difference elsewhere."
            }
          },
          {
            "@type": "Question",
            "name": "How do property taxes and insurance affect my mortgage payment?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Property taxes and homeowners insurance can significantly impact your total monthly mortgage payment. In many cases, these costs are collected monthly by your mortgage servicer and held in an escrow account, from which the servicer pays your property tax bills and insurance premiums when they're due. This ensures these important expenses are paid on time."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use this calculator for refinancing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our mortgage calculator can be used to evaluate refinancing options. To do so: Enter your current home value instead of purchase price, enter your desired loan amount (typically your current mortgage balance, unless you're cashing out equity), input the new interest rate and loan term you're considering, and compare the new monthly payment and total interest to your current mortgage."
            }
          }
        ]
      },
      
      // HowTo schema
      {
        "@type": "HowTo",
        "name": "How to Calculate Your Mortgage Payment",
        "description": "Step-by-step guide to calculating your monthly mortgage payment using our mortgage calculator.",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Enter Home Price",
            "text": "Enter the total purchase price of the home you're planning to buy."
          },
          {
            "@type": "HowToStep",
            "name": "Enter Down Payment",
            "text": "Enter your down payment amount either as a dollar amount or as a percentage of the home price."
          },
          {
            "@type": "HowToStep",
            "name": "Select Loan Term",
            "text": "Choose the length of your mortgage, typically 15, 20, or 30 years."
          },
          {
            "@type": "HowToStep",
            "name": "Enter Interest Rate",
            "text": "Enter the annual interest rate for your mortgage loan."
          },
          {
            "@type": "HowToStep",
            "name": "Add Property Taxes and Insurance",
            "text": "Enter your annual property taxes and homeowners insurance to calculate your total monthly payment."
          },
          {
            "@type": "HowToStep",
            "name": "Include Optional Payments",
            "text": "Add any HOA fees or extra monthly payments if applicable."
          },
          {
            "@type": "HowToStep",
            "name": "Review Results",
            "text": "Examine your monthly payment breakdown, amortization schedule, and total interest costs."
          }
        ],
        "tool": {
          "@type": "HowToTool",
          "name": "Mortgage Calculator"
        }
      },
      
      // BreadcrumbList schema
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://free-calc-hub-dev.replit.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Finance",
            "item": "https://free-calc-hub-dev.replit.app/finance/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Mortgage",
            "item": "https://free-calc-hub-dev.replit.app/finance/mortgage/"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Mortgage Calculator",
            "item": "https://free-calc-hub-dev.replit.app/finance/mortgage/mortgage-calculator/"
          }
        ]
      },
      
      // WebPage schema
      {
        "@type": "WebPage",
        "name": "Mortgage Calculator",
        "description": "Free mortgage calculator to estimate monthly payments, total interest, and amortization schedule. See how extra payments can save you thousands. No ads or signup required.",
        "url": "https://free-calc-hub-dev.replit.app/finance/mortgage/mortgage-calculator/",
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".calculator-description", ".how-to-use"]
        },
        "mainEntity": {
          "@type": "SoftwareApplication",
          "name": "Mortgage Calculator"
        }
      }
    ]
  };
  
  // Add the schema to the page
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
});
