# FreecalcHub API & MCP Integration - Product Requirements Document

## Document Version
- **Version:** 1.0
- **Date:** January 2025
- **Author:** Product Strategy Team
- **Status:** Draft

## 1. Executive Summary

### 1.1 Vision Statement
Transform FreecalcHub's 58+ static calculators into programmable, API-accessible services that can be consumed by LLMs, AI agents, and third-party applications, establishing FreecalcHub as the premier calculator-as-a-service platform.

### 1.2 Strategic Objectives
- **Create new B2B revenue streams** through API monetization
- **Position FreecalcHub as an AI-ready platform** for the LLM ecosystem
- **Maintain market leadership** in the online calculator space
- **Enable programmatic access** to validated calculation logic
- **Build developer ecosystem** around calculator APIs

### 1.3 Key Benefits
- **Revenue Diversification:** New subscription-based B2B revenue model
- **Market Expansion:** Access to developer and enterprise markets
- **Competitive Moat:** First-mover advantage in calculator API space
- **SEO Enhancement:** API documentation drives organic traffic
- **Partnership Opportunities:** Integration with AI platforms and tools

## 2. Problem Statement

### 2.1 Market Context
The rise of LLMs and AI agents has created unprecedented demand for programmatic access to computational tools. Currently:
- Developers manually recreate calculation logic, leading to errors
- LLMs cannot reliably perform complex financial calculations
- No standardized API exists for common calculator functions
- Businesses need validated, consistent calculation services

### 2.2 User Pain Points
- **Developers:** Need reliable calculation APIs without building from scratch
- **AI Applications:** Require tool-use capabilities for accurate computations
- **Enterprises:** Want consistent, auditable calculation methods
- **LLM Users:** Need accurate financial/mathematical calculations in conversations

### 2.3 Business Opportunity
- **TAM:** $2.5B API management market (growing 25% annually)
- **SAM:** $150M calculator/computation API segment
- **SOM:** $5M achievable in 3 years with 0.3% market share

## 3. Solution Overview

### 3.1 Core Offering
A dual-approach API platform providing:
1. **RESTful API:** Traditional HTTP endpoints for all calculators
2. **MCP Server:** Native LLM integration via Model Context Protocol
3. **GraphQL Interface:** Complex queries and batch operations
4. **WebSocket Support:** Real-time calculation updates

### 3.2 Key Features
- **Comprehensive Calculator Suite:** 58+ calculators across 7 categories
- **Flexible Input/Output:** JSON, XML, CSV support
- **Batch Processing:** Multiple calculations in single request
- **Webhook Callbacks:** Async processing for complex calculations
- **Usage Analytics:** Detailed API usage dashboard
- **Documentation Portal:** Interactive API explorer

## 4. User Personas

### 4.1 Primary Personas

#### Developer Dave
- **Role:** Full-stack developer at fintech startup
- **Need:** Integrate loan calculations into mobile app
- **Pain:** Building and testing calculation logic takes weeks
- **Solution:** Drop-in API for instant loan calculations

#### AI Agent Alice
- **Role:** LLM-powered financial advisor chatbot
- **Need:** Accurate mortgage and investment calculations
- **Pain:** LLMs produce calculation errors
- **Solution:** MCP tools for guaranteed accurate results

#### Enterprise Emma
- **Role:** IT Director at insurance company
- **Need:** Standardized calculations across departments
- **Pain:** Inconsistent Excel formulas cause errors
- **Solution:** Centralized API with audit trails

### 4.2 Use Cases
1. **Fintech Apps:** Loan comparisons, investment projections
2. **AI Assistants:** Financial planning, tax calculations
3. **E-commerce:** Shipping calculations, currency conversion
4. **Education:** Math tutoring apps, homework helpers
5. **Healthcare:** BMI tracking, calorie calculations

## 5. Functional Requirements

### 5.1 API Endpoints

#### Core Structure
```
BASE_URL: https://api.freecalchub.com/v1
Authentication: Bearer Token (API Key)
Rate Limiting: Tier-based (100-100,000 requests/month)
```

#### Calculator Categories
1. **Finance** (`/finance/*`)
   - `/finance/loan` - Loan calculations
   - `/finance/mortgage` - Mortgage calculations
   - `/finance/investment` - Investment returns
   
2. **Math** (`/math/*`)
   - `/math/percentage` - Percentage calculations
   - `/math/statistics` - Statistical analysis
   
3. **Health** (`/health/*`)
   - `/health/bmi` - BMI calculations
   - `/health/nutrition` - Calorie/macro calculations

### 5.2 MCP Server Capabilities

#### Tool Definitions
```javascript
{
  "name": "calculate_loan",
  "description": "Calculate loan payment, interest, and amortization",
  "parameters": {
    "principal": "number",
    "rate": "number",
    "term": "number",
    "extra_payment": "number (optional)"
  }
}
```

#### LLM Integration
- Automatic parameter extraction from natural language
- Error handling with helpful suggestions
- Multi-step calculation workflows
- Context-aware calculator selection

### 5.3 Required Features

#### Phase 1 (MVP)
- [ ] Basic authentication system
- [ ] 10 core calculator endpoints
- [ ] Rate limiting
- [ ] JSON input/output
- [ ] Basic documentation

#### Phase 2
- [ ] MCP server implementation
- [ ] Batch processing
- [ ] Webhook callbacks
- [ ] Advanced authentication (OAuth2)
- [ ] Usage analytics dashboard

#### Phase 3
- [ ] GraphQL interface
- [ ] WebSocket support
- [ ] Custom calculator builder
- [ ] White-label options
- [ ] Enterprise features

## 6. Technical Architecture

### 6.1 Infrastructure

#### Backend Stack
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js or Fastify
- **Hosting:** Vercel Functions / AWS Lambda
- **Database:** PostgreSQL for usage tracking
- **Cache:** Redis for response caching
- **CDN:** CloudFlare for global distribution

#### API Gateway
- **Authentication:** JWT tokens with refresh
- **Rate Limiting:** Token bucket algorithm
- **Monitoring:** DataDog or New Relic
- **Documentation:** OpenAPI 3.0 specification

### 6.2 Code Architecture

#### Modular Calculator Engine
```javascript
// Shared calculation module
class CalculatorEngine {
  static loan(params) {
    // Extracted from existing loan-calculator.js
    return {
      monthlyPayment: calculatePayment(params),
      totalInterest: calculateInterest(params),
      amortization: generateSchedule(params)
    };
  }
}
```

#### API Layer
```javascript
// REST endpoint
app.post('/api/v1/finance/loan', authenticate, rateLimit, (req, res) => {
  const result = CalculatorEngine.loan(req.body);
  trackUsage(req.user, 'loan');
  res.json(result);
});
```

### 6.3 Security Requirements
- **Authentication:** API key-based with optional OAuth2
- **Encryption:** TLS 1.3 for all communications
- **Input Validation:** Strict schema validation
- **Rate Limiting:** Per-key and per-IP limits
- **Audit Logging:** All API calls logged
- **GDPR Compliance:** No PII storage without consent

## 7. Proof of Concept Calculators

### 7.1 Phase 1 POC Calculators (Top 5)

#### 1. Loan Calculator (`/finance/loan`)
**Why:** Most popular calculator, clear monetization potential
```json
POST /api/v1/finance/loan
{
  "principal": 100000,
  "annual_rate": 5.5,
  "term_months": 360,
  "extra_payment": 100
}
```

#### 2. Percentage Calculator (`/math/percentage`)
**Why:** High volume, simple implementation, broad use cases
```json
POST /api/v1/math/percentage
{
  "operation": "percent_of",
  "value1": 25,
  "value2": 200
}
```

#### 3. BMI Calculator (`/health/bmi`)
**Why:** Healthcare market potential, simple calculation
```json
POST /api/v1/health/bmi
{
  "weight_kg": 70,
  "height_cm": 175,
  "unit_system": "metric"
}
```

#### 4. Currency Converter (`/conversions/currency`)
**Why:** E-commerce integration, real-time data value-add
```json
POST /api/v1/conversions/currency
{
  "from": "USD",
  "to": "EUR",
  "amount": 1000,
  "date": "2025-01-21"
}
```

#### 5. Compound Interest Calculator (`/finance/investment`)
**Why:** Investment app integration, complex calculation value
```json
POST /api/v1/finance/investment/compound
{
  "principal": 10000,
  "rate": 7,
  "time_years": 10,
  "compounds_per_year": 12,
  "monthly_contribution": 500
}
```

### 7.2 MCP Testing Scenarios

#### Scenario 1: Mortgage Affordability
```
User: "Can I afford a $500k house with $100k down and $5k monthly income?"
MCP Tools Used:
- calculate_mortgage (principal: 400000)
- calculate_dti_ratio (income: 5000, payment: result)
- calculate_affordability (full analysis)
```

#### Scenario 2: Investment Planning
```
User: "How much will I have if I invest $500/month for 20 years at 8% return?"
MCP Tools Used:
- calculate_compound_interest
- calculate_inflation_adjustment
- calculate_tax_impact
```

#### Scenario 3: Debt Payoff Strategy
```
User: "Should I pay off my car loan or invest the extra money?"
MCP Tools Used:
- calculate_loan (current loan details)
- calculate_investment_return (alternative scenario)
- compare_scenarios (financial comparison)
```

## 8. Monetization Model

### 8.1 Pricing Tiers

#### Free Tier - $0/month
- 100 API calls/month
- 5 calculators (basic only)
- Rate limit: 10 calls/minute
- Community support
- Attribution required

#### Developer Tier - $29/month
- 10,000 API calls/month
- All calculators
- Rate limit: 100 calls/minute
- Email support
- No attribution required

#### Professional Tier - $99/month
- 100,000 API calls/month
- Batch processing (up to 100)
- Rate limit: 1,000 calls/minute
- Priority support
- Webhook callbacks
- Custom parameters

#### Enterprise Tier - Custom Pricing
- Unlimited API calls
- Custom calculators
- Dedicated infrastructure
- SLA guarantee (99.9%)
- Phone support
- White-label option

### 8.2 Revenue Projections

#### Year 1 (Conservative)
- Free users: 1,000 → 5% conversion
- Paid users: 50 (30 Developer, 15 Professional, 5 Enterprise)
- MRR: $3,500
- ARR: $42,000

#### Year 2 (Growth)
- Free users: 5,000 → 8% conversion
- Paid users: 400 (250 Developer, 100 Professional, 50 Enterprise)
- MRR: $25,000
- ARR: $300,000

#### Year 3 (Scale)
- Free users: 15,000 → 10% conversion
- Paid users: 1,500 (900 Developer, 400 Professional, 200 Enterprise)
- MRR: $95,000
- ARR: $1,140,000

### 8.3 Additional Revenue Streams
- **Premium Data Feeds:** Real-time rates, historical data
- **Custom Calculators:** $5,000+ development fee
- **Training/Consulting:** Integration support at $200/hour
- **Affiliate Commissions:** Financial product recommendations

## 9. Success Metrics

### 9.1 Primary KPIs
- **API Adoption:** 1,000 developers in 6 months
- **Conversion Rate:** 5% free-to-paid minimum
- **Revenue Per User:** $70/month average
- **Churn Rate:** <5% monthly
- **Uptime:** 99.9% availability

### 9.2 Secondary Metrics
- **Response Time:** <100ms p95
- **Documentation Views:** 10,000/month
- **Support Tickets:** <2% of active users
- **LLM Integrations:** 20+ AI applications
- **API Calls:** 10M+ monthly by Year 2

### 9.3 Success Criteria
- **MVP Success:** 100 paying customers in 3 months
- **Market Validation:** $10K MRR in 6 months
- **Scale Validation:** $50K MRR in 12 months
- **Market Leadership:** Top 3 calculator API by Year 2

## 10. Implementation Roadmap

### 10.1 Phase 1: Foundation (Weeks 1-4)
**Goal:** Extract and modularize calculation logic

- Week 1: Architecture design and infrastructure setup
- Week 2: Extract top 5 calculator logic into modules
- Week 3: Build REST API framework and authentication
- Week 4: Deploy beta API with basic documentation

**Deliverables:**
- [ ] Modular calculator engine
- [ ] Basic API with 5 endpoints
- [ ] Authentication system
- [ ] Swagger documentation

### 10.2 Phase 2: MVP Launch (Weeks 5-8)
**Goal:** Public launch with monetization

- Week 5: Add 5 more calculators, implement rate limiting
- Week 6: Build usage tracking and analytics
- Week 7: Integrate Stripe billing, create pricing page
- Week 8: Public launch with marketing campaign

**Deliverables:**
- [ ] 10 calculator endpoints
- [ ] Billing system
- [ ] Usage dashboard
- [ ] Marketing website

### 10.3 Phase 3: MCP Integration (Weeks 9-12)
**Goal:** Enable LLM integration

- Week 9: Implement MCP server wrapper
- Week 10: Create tool definitions for all calculators
- Week 11: Build LLM demo applications
- Week 12: Partner outreach to AI platforms

**Deliverables:**
- [ ] MCP server
- [ ] LLM documentation
- [ ] Demo applications
- [ ] Partner integrations

### 10.4 Phase 4: Scale (Months 4-6)
**Goal:** Full feature set and growth

- Month 4: Add remaining calculators, GraphQL interface
- Month 5: Enterprise features, white-label options
- Month 6: Advanced analytics, custom calculator builder

**Deliverables:**
- [ ] 58+ calculator endpoints
- [ ] GraphQL API
- [ ] Enterprise features
- [ ] Custom calculator platform

## 11. Risk Analysis

### 11.1 Technical Risks

#### Risk: Infrastructure Scaling
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Start with serverless, auto-scaling architecture

#### Risk: Calculation Accuracy
- **Probability:** Low
- **Impact:** Critical
- **Mitigation:** Extensive testing, version control, audit logs

### 11.2 Business Risks

#### Risk: Low Adoption
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Generous free tier, excellent documentation, developer outreach

#### Risk: Competition
- **Probability:** High
- **Impact:** Medium
- **Mitigation:** First-mover advantage, comprehensive suite, MCP differentiation

### 11.3 Operational Risks

#### Risk: Support Burden
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Self-service documentation, community forum, tiered support

## 12. Competitive Analysis

### 12.1 Direct Competitors
- **None identified:** No comprehensive calculator API platform exists

### 12.2 Indirect Competitors

#### Wolfram Alpha API
- **Strengths:** Advanced computational engine
- **Weaknesses:** Complex, expensive, overkill for simple calculations
- **Our Advantage:** Simpler, cheaper, purpose-built

#### Individual Calculator APIs
- **Strengths:** Specialized features
- **Weaknesses:** Fragmented, inconsistent, limited scope
- **Our Advantage:** One-stop-shop, consistent interface

### 12.3 Competitive Advantages
1. **Comprehensive Suite:** 58+ calculators in one platform
2. **Dual Interface:** REST + MCP for maximum compatibility
3. **Developer-Friendly:** Excellent docs, simple integration
4. **Cost-Effective:** Competitive pricing with generous free tier
5. **LLM-Ready:** Native AI integration capabilities

## 13. MVP Scope

### 13.1 In Scope
- ✅ 10 core calculator endpoints (5 POC + 5 additional)
- ✅ REST API with JSON support
- ✅ API key authentication
- ✅ Basic rate limiting
- ✅ Swagger documentation
- ✅ Usage tracking
- ✅ Simple billing (Stripe)
- ✅ Developer portal

### 13.2 Out of Scope (Post-MVP)
- ❌ MCP server (Phase 3)
- ❌ GraphQL interface
- ❌ Webhook callbacks
- ❌ Batch processing
- ❌ Custom calculators
- ❌ White-label options
- ❌ Advanced analytics
- ❌ OAuth2 authentication

### 13.3 MVP Success Criteria
- [ ] 10 working API endpoints
- [ ] <100ms response time
- [ ] 99% uptime
- [ ] 100 developer signups
- [ ] 10 paying customers
- [ ] $1,000 MRR

## 14. Go-to-Market Strategy

### 14.1 Launch Strategy
1. **Soft Launch:** Beta with 50 developers
2. **Product Hunt:** Launch when 10 calculators ready
3. **Developer Communities:** Reddit, HackerNews, Dev.to
4. **Content Marketing:** API tutorials, use cases
5. **Partner Outreach:** LLM platforms, AI tools

### 14.2 Marketing Channels
- **SEO:** API documentation pages
- **Content:** Developer tutorials and guides
- **Social:** Twitter/X developer community
- **Partnerships:** AI/LLM tool integrations
- **Referral:** Developer referral program

### 14.3 Key Messages
- "Every calculator you need, one API"
- "Make your LLM mathematically accurate"
- "Stop rebuilding calculation logic"
- "From mortgage to BMI - we calculate everything"

## 15. Conclusion

The FreecalcHub API platform represents a strategic evolution from static web tools to programmable services. By providing both traditional REST APIs and cutting-edge MCP integration, we position ourselves at the intersection of conventional development and the AI revolution.

With 58+ calculators ready to be transformed into API endpoints, minimal infrastructure requirements, and clear monetization paths, this initiative offers:
- **Low risk:** Leverages existing, tested calculation logic
- **High reward:** Access to growing B2B API market
- **Future-proof:** AI/LLM integration capabilities
- **Sustainable growth:** Subscription-based recurring revenue

The time is optimal to establish FreecalcHub as the definitive calculator API platform before competitors recognize this opportunity.

## Appendices

### Appendix A: Technical Specifications
[Detailed API specifications, data schemas, and integration guides]

### Appendix B: Financial Projections
[Detailed P&L projections, CAC/LTV analysis, and sensitivity models]

### Appendix C: Research Data
[Market research, user interviews, and competitive analysis data]

---

**Document Status:** Ready for stakeholder review
**Next Steps:** Approve MVP scope and begin Phase 1 implementation
**Contact:** product@freecalchub.com