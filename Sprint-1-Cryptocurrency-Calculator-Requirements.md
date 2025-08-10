# Sprint 1: Cryptocurrency Calculator Requirements
**FreecalcHub - TOP 3 Finance/Cryptocurrency Calculators**  
**Version:** 1.0  
**Date:** 2025-01-09  
**Status:** READY FOR IMPLEMENTATION

---

## Project Overview

This document defines detailed, implementation-ready requirements for the TOP 3 Finance/Cryptocurrency calculators for Sprint 1 on FreecalcHub. Each calculator follows the established template patterns and includes comprehensive user stories, technical specifications, and edge case handling.

**Template Compliance:** All calculators must use `/Users/jamiewatters/DevProjects/freecalchub/calculator-template.html` as the base template and follow `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md` guidelines.

---

## Calculator 1: Crypto Profit/Loss Calculator

### User Stories

**Epic:** As a cryptocurrency trader, I want to calculate my profit/loss from crypto trades so that I can track my performance and make informed trading decisions.

#### Core User Stories

**US-001: Basic Profit/Loss Calculation**
- **As a** crypto trader
- **I want to** enter my buy and sell details for a cryptocurrency trade
- **So that** I can see my exact profit or loss

**Acceptance Criteria:**
- [ ] User can input purchase price, quantity, sale price
- [ ] System calculates gross profit/loss = (Sale Price - Purchase Price) × Quantity
- [ ] Results display profit in green, loss in red
- [ ] Percentage gain/loss is calculated and displayed
- [ ] All monetary values formatted as USD currency

**Priority:** P0 (Must Have)  
**Effort:** M (3-5 days)  
**Dependencies:** None

**US-002: Trading Fees Integration**
- **As a** crypto trader concerned about fees
- **I want to** include buy and sell fees in my calculation
- **So that** I get an accurate net profit/loss

**Acceptance Criteria:**
- [ ] Optional fields for buy fee and sell fee (both percentage and flat rate)
- [ ] Net profit/loss = Gross P/L - Buy Fees - Sell Fees
- [ ] Clear breakdown showing gross vs net results
- [ ] Fee calculation supports both percentage (0.1%) and flat rate ($5) inputs
- [ ] Validation ensures fees don't exceed trade value

**Priority:** P0 (Must Have)  
**Effort:** S (1-2 days)  
**Dependencies:** US-001

**US-003: Multiple Trade Analysis**
- **As a** active trader
- **I want to** add multiple trades for the same cryptocurrency
- **So that** I can see my overall performance across all trades

**Acceptance Criteria:**
- [ ] "Add Another Trade" button to create additional trade rows
- [ ] Summary section showing total investment, total return, overall P/L
- [ ] Average buy price calculation across all trades
- [ ] Remove individual trade functionality
- [ ] Maximum 10 trades per calculation to prevent performance issues

**Priority:** P1 (Should Have)  
**Effort:** L (5-8 days)  
**Dependencies:** US-001, US-002

### Technical Specifications

#### Input Fields
**Trade Details Section:**
- `cryptocurrency_symbol`: Text input (BTC, ETH, etc.) - Optional for display
- `purchase_price`: Number input, step="0.00001", min="0", required
- `quantity`: Number input, step="0.00001", min="0.00001", required
- `sale_price`: Number input, step="0.00001", min="0", required

**Fee Structure Section:**
- `buy_fee_type`: Radio buttons ("percentage" | "flat")
- `buy_fee_amount`: Number input, conditional validation based on type
- `sell_fee_type`: Radio buttons ("percentage" | "flat")  
- `sell_fee_amount`: Number input, conditional validation based on type

#### Calculation Formulas
```javascript
// Basic Calculations
grossProfit = (salePrice - purchasePrice) * quantity
grossProfitPercentage = ((salePrice - purchasePrice) / purchasePrice) * 100

// Fee Calculations
buyFeeAmount = (buyFeeType === 'percentage') 
  ? (purchasePrice * quantity * buyFeeAmount / 100)
  : buyFeeAmount

sellFeeAmount = (sellFeeType === 'percentage')
  ? (salePrice * quantity * sellFeeAmount / 100)
  : sellFeeAmount

// Net Results  
netProfit = grossProfit - buyFeeAmount - sellFeeAmount
netProfitPercentage = (netProfit / (purchasePrice * quantity + buyFeeAmount)) * 100
```

#### Output Displays
**Results Section:**
- Gross Profit/Loss (monetary and percentage)
- Total Fees Paid
- Net Profit/Loss (monetary and percentage)
- ROI (Return on Investment)
- Break-even price calculation

**Visual Elements:**
- Color-coded results (green for profit, red for loss)
- Profit/Loss indicator icons
- Fee breakdown chart (optional pie chart)

#### Validation Rules
- Purchase price > 0 and ≤ $1,000,000
- Sale price > 0 and ≤ $1,000,000  
- Quantity > 0 and ≤ 1,000,000
- Percentage fees: 0% ≤ fee ≤ 20%
- Flat fees: $0 ≤ fee ≤ $10,000
- Fees cannot exceed 50% of trade value

#### Edge Cases
- Zero quantity → Error message
- Fees exceed trade value → Warning message  
- Identical buy/sell prices → Break-even message
- Very small quantities (< 0.00001) → Precision handling
- Very large numbers → Scientific notation display

---

## Calculator 2: Crypto Tax Calculator

### User Stories

**Epic:** As a cryptocurrency investor, I want to estimate my tax liability on crypto gains so that I can plan for tax obligations and make informed investment decisions.

#### Core User Stories

**US-004: Basic Tax Calculation**
- **As a** crypto investor
- **I want to** calculate taxes on my crypto gains
- **So that** I can estimate my tax liability

**Acceptance Criteria:**
- [ ] User can select tax filing status (Single, Married Filing Jointly, etc.)
- [ ] Input fields for short-term and long-term gains
- [ ] System applies appropriate tax rates based on 2024 tax brackets
- [ ] Clear breakdown of taxes owed for each gain type
- [ ] Total estimated tax liability displayed prominently

**Priority:** P0 (Must Have)  
**Effort:** M (3-5 days)  
**Dependencies:** None

**US-005: Gain/Loss Classification**
- **As a** crypto investor  
- **I want to** classify my gains as short-term or long-term
- **So that** I pay the correct tax rates

**Acceptance Criteria:**
- [ ] Clear explanation of short-term (< 1 year) vs long-term (≥ 1 year)
- [ ] Separate input sections for each classification
- [ ] Different tax rate applications (ordinary income vs capital gains)
- [ ] Educational tooltips explaining the difference
- [ ] Validation prevents negative gain amounts

**Priority:** P0 (Must Have)  
**Effort:** S (1-2 days)  
**Dependencies:** US-004

**US-006: Transaction Import & Analysis**
- **As a** active crypto trader with many transactions
- **I want to** input multiple transactions with dates
- **So that** the system can automatically classify gains/losses correctly

**Acceptance Criteria:**
- [ ] Transaction input table with date, type, amount, price fields
- [ ] Automatic short-term/long-term classification based on dates
- [ ] FIFO (First In, First Out) calculation method
- [ ] Running total of gains/losses by classification
- [ ] Export functionality for tax preparation
- [ ] Maximum 50 transactions to maintain performance

**Priority:** P1 (Should Have)  
**Effort:** XL (8-13 days)  
**Dependencies:** US-004, US-005

### Technical Specifications

#### Input Fields
**Tax Information Section:**
- `filing_status`: Select dropdown (Single, Married Filing Jointly, Married Filing Separately, Head of Household)
- `annual_income`: Number input for tax bracket determination
- `short_term_gains`: Number input, can be negative for losses
- `long_term_gains`: Number input, can be negative for losses

**Transaction Section (Advanced):**
- `transaction_date`: Date input
- `transaction_type`: Select (Buy, Sell)  
- `quantity`: Number input
- `price_per_unit`: Number input
- `cryptocurrency`: Text input (optional)

#### Calculation Formulas
```javascript
// 2024 Tax Brackets (simplified for example)
const TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    // ... additional brackets
  ]
};

const CAPITAL_GAINS_RATES = {
  0: 0,      // 0% for low income
  15: 0.15,  // 15% for middle income  
  20: 0.20   // 20% for high income
};

// Short-term gains taxed as ordinary income
shortTermTax = calculateOrdinaryIncomeTax(shortTermGains, filingStatus, annualIncome)

// Long-term gains taxed at capital gains rates
longTermTax = longTermGains * getCapitalGainsRate(annualIncome, filingStatus)

totalTaxLiability = shortTermTax + longTermTax
```

#### Output Displays
**Tax Summary Section:**
- Short-term gains tax
- Long-term gains tax  
- Total estimated tax liability
- Effective tax rate on crypto gains
- Tax-optimized holding period recommendations

**Educational Content:**
- Tax bracket explanation
- Capital gains vs ordinary income comparison
- Tax optimization strategies

#### Validation Rules
- Annual income: $0 ≤ income ≤ $10,000,000
- Gains can be negative (losses)
- Filing status must be selected
- Transaction dates must be valid dates
- Transaction quantities > 0

#### Edge Cases
- Net losses → Tax loss harvesting information
- Very high gains → Alternative Minimum Tax considerations  
- Multiple assets → Aggregate gain/loss handling
- Wash sale rule implications → Warning messages

---

## Calculator 3: DCA (Dollar Cost Averaging) Calculator

### User Stories

**Epic:** As a cryptocurrency investor, I want to simulate Dollar Cost Averaging strategies so that I can compare different investment approaches and optimize my investment timing.

#### Core User Stories

**US-007: Basic DCA Simulation**
- **As a** long-term crypto investor
- **I want to** simulate regular investments over time
- **So that** I can see the potential outcomes of dollar cost averaging

**Acceptance Criteria:**
- [ ] User inputs investment amount, frequency, and duration
- [ ] System simulates regular purchases at specified intervals
- [ ] Results show total invested, total value, and overall return
- [ ] Comparison with lump-sum investment at start date
- [ ] Clear visualization of investment progress over time

**Priority:** P0 (Must Have)  
**Effort:** L (5-8 days)  
**Dependencies:** External price data API

**US-008: Historical Performance Analysis**
- **As a** data-driven investor
- **I want to** see how DCA would have performed historically
- **So that** I can validate the strategy with real market data

**Acceptance Criteria:**
- [ ] User selects cryptocurrency and date range
- [ ] System uses historical price data for calculations
- [ ] Chart showing DCA vs lump-sum performance over time
- [ ] Statistical analysis (volatility reduction, average purchase price)
- [ ] Performance metrics (total return, CAGR, maximum drawdown)

**Priority:** P0 (Must Have)  
**Effort:** L (5-8 days)  
**Dependencies:** US-007, Historical price data API

**US-009: Strategy Comparison**
- **As a** strategic investor
- **I want to** compare different DCA frequencies and amounts
- **So that** I can optimize my investment strategy

**Acceptance Criteria:**
- [ ] Multiple scenario comparison (weekly vs monthly vs quarterly)
- [ ] Variable investment amounts over time
- [ ] Side-by-side performance comparison
- [ ] Optimal strategy recommendations based on results
- [ ] Risk-adjusted return calculations

**Priority:** P1 (Should Have)  
**Effort:** L (5-8 days)  
**Dependencies:** US-007, US-008

### Technical Specifications

#### Input Fields
**Investment Parameters Section:**
- `investment_amount`: Number input, min="1", required
- `investment_frequency`: Select (Daily, Weekly, Monthly, Quarterly)
- `investment_duration`: Number input (months), min="1", max="240"
- `start_date`: Date input, max="today"
- `cryptocurrency`: Select dropdown (BTC, ETH, ADA, etc.)

**Comparison Settings:**
- `lump_sum_amount`: Auto-calculated or manual override
- `include_fees`: Checkbox with fee percentage input
- `inflation_adjustment`: Checkbox with rate input

#### Calculation Formulas
```javascript
// DCA Calculation Logic
function calculateDCA(amount, frequency, duration, priceHistory) {
  let totalInvested = 0;
  let totalTokens = 0;
  const purchases = [];
  
  const intervalDays = getIntervalDays(frequency); // Daily: 1, Weekly: 7, etc.
  const totalPurchases = Math.floor(duration * 30 / intervalDays);
  
  for (let i = 0; i < totalPurchases; i++) {
    const purchaseDate = new Date(startDate);
    purchaseDate.setDate(purchaseDate.getDate() + (i * intervalDays));
    
    const price = getPriceOnDate(priceHistory, purchaseDate);
    const tokensAdded = amount / price;
    
    totalInvested += amount;
    totalTokens += tokensAdded;
    
    purchases.push({
      date: purchaseDate,
      price: price,
      amount: amount,
      tokens: tokensAdded,
      totalInvested: totalInvested,
      totalTokens: totalTokens
    });
  }
  
  const finalPrice = getPriceOnDate(priceHistory, endDate);
  const totalValue = totalTokens * finalPrice;
  const totalReturn = totalValue - totalInvested;
  const averagePurchasePrice = totalInvested / totalTokens;
  
  return {
    totalInvested,
    totalTokens, 
    totalValue,
    totalReturn,
    averagePurchasePrice,
    purchases
  };
}
```

#### Output Displays
**Performance Summary:**
- Total Amount Invested
- Total Tokens Acquired  
- Average Purchase Price
- Current Portfolio Value
- Total Return ($ and %)
- Annualized Return Rate

**Comparison Analysis:**
- DCA vs Lump Sum performance
- Volatility reduction metrics
- Best/worst purchase prices
- Time-weighted return analysis

**Visual Elements:**
- Investment timeline chart
- Price vs average cost chart  
- Portfolio value growth chart
- Purchase frequency distribution

#### API Requirements
**External Data Source:** CoinGecko API or similar
- **Endpoint:** Historical price data
- **Authentication:** Public API (no key required)
- **Rate Limits:** 50 calls/minute
- **Data Format:** JSON with date, price pairs

#### Validation Rules
- Investment amount: $1 ≤ amount ≤ $100,000
- Duration: 1 ≤ months ≤ 240 (20 years max)
- Start date: Must be ≥ 1 year ago for sufficient data
- End date: Cannot be future date
- Frequency must allow ≥ 10 data points

#### Edge Cases
- Insufficient historical data → Reduce date range or show warning
- API rate limits → Cache responses, queue requests
- Market closure dates → Use previous day's closing price  
- Extreme price volatility → Show volatility warnings
- Very small investment amounts → Precision handling for fractional tokens

---

## Implementation Guidelines

### Template Compliance
- Use `/Users/jamiewatters/DevProjects/freecalchub/calculator-template.html` as base
- Follow all CSP headers and GTM implementation from template
- Implement V2 FAQ structure with accordion functionality
- Include all required Schema.org markup (SoftwareApplication, FAQPage, HowTo, BreadcrumbList, WebPage)

### File Structure
```
/finance/cryptocurrency/
├── crypto-profit-calculator/
│   ├── index.html
│   ├── css/crypto-profit-calculator.css  
│   └── js/crypto-profit-calculator.js
├── crypto-tax-calculator/
│   ├── index.html
│   ├── css/crypto-tax-calculator.css
│   └── js/crypto-tax-calculator.js
└── dca-calculator/
    ├── index.html  
    ├── css/dca-calculator.css
    └── js/dca-calculator.js
```

### Related Calculators (for each page)
- Compound Interest Calculator (`/finance/investment/compound-interest-calculator/`)
- Investment Return Calculator (future)
- Portfolio Rebalancing Calculator (future)
- Crypto Staking Rewards Calculator (future)
- Tax Bracket Calculator (`/finance/tax/tax-bracket-calculator/`)

### Success Metrics
- Page load time < 3 seconds
- Calculator results display < 1 second
- Mobile responsive across all devices  
- 100% HTML validation score
- Schema.org markup validation passes
- No console errors in supported browsers

### Risk Mitigation
- **API Dependency:** Implement fallback mock data for DCA calculator
- **Calculation Accuracy:** Include unit tests for all formulas
- **Performance:** Limit max transactions/trades to prevent browser freeze
- **Tax Disclaimer:** Include clear disclaimers about tax advice limitations
- **Data Validation:** Comprehensive input sanitization and validation

---

## Quality Assurance Checklist

### Functional Testing
- [ ] All calculation formulas produce expected results
- [ ] Input validation prevents invalid data entry
- [ ] Error messages are clear and actionable
- [ ] Results display correctly formatted values
- [ ] Reset functionality clears all inputs and results

### UI/UX Testing  
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Dark mode compatibility maintained
- [ ] Loading states shown for API calls
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Print-friendly results sections

### Technical Testing
- [ ] HTML validates with W3C validator
- [ ] Schema.org markup validates successfully  
- [ ] No console errors in Chrome, Firefox, Safari, Edge
- [ ] Performance benchmarks met
- [ ] SEO meta tags properly configured

### Content Testing
- [ ] All educational content is accurate and helpful
- [ ] FAQ sections answer common user questions
- [ ] Tax disclaimers are legally appropriate
- [ ] Related calculator links are correct and functional

---

**Document Status:** READY FOR IMPLEMENTATION  
**Next Steps:** Assign to @developer for Sprint 1 development  
**Review Required:** Technical feasibility validation by @architect