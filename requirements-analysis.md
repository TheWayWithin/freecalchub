# FreecalcHub API Platform - Requirements Analysis
## Strategic Requirements Synthesis for Architecture Design

**Document Version:** 1.0
**Analysis Date:** 2025-10-03
**Analyst:** The Strategist
**Purpose:** Comprehensive requirements analysis to inform system architecture design

---

## Executive Analysis Summary

FreecalcHub API Platform transforms 58+ proven static web calculators into a dual-interface API service (REST + MCP) targeting developers, LLMs, and enterprises. This analysis synthesizes requirements from the PRD to define architectural characteristics, system boundaries, stakeholder concerns, and critical constraints that will guide the architecture design.

**Critical Strategic Insight:** The dual-interface requirement (REST + MCP) is not just a feature - it's a core architectural driver that positions FreecalcHub at the intersection of traditional developer tools and the AI revolution. The architecture must treat both interfaces as first-class citizens.

**Key Finding:** Existing calculator logic extraction is the highest-risk architectural decision. The modularization strategy must enable API access while maintaining 100% compatibility with current web calculators serving existing users.

---

## 1. Architectural Characteristics Matrix

### 1.1 Primary Architectural Characteristics (Must Have)

| Characteristic | Requirement | Success Criteria | Architecture Impact |
|----------------|-------------|------------------|---------------------|
| **Scalability** | Support 100 calls/month to 100,000+ calls/month | Auto-scaling without degradation | Serverless architecture, stateless design, horizontal scaling |
| **Performance** | <100ms p95 response time | 95th percentile under 100ms | Caching layer, optimized algorithms, CDN distribution |
| **Availability** | 99.9% uptime | Max 43 minutes downtime/month | Multi-region deployment, health checks, automatic failover |
| **Security** | JWT auth, rate limiting, encryption | Zero security incidents | TLS 1.3, input validation, audit logging, GDPR compliance |
| **Cost Efficiency** | Serverless for variable demand | Cost per API call <$0.001 | Pay-per-use infrastructure, efficient caching |
| **Maintainability** | Dual codebase (web + API) maintenance | Single source of truth for logic | Modular calculator engine, shared libraries |

### 1.2 Secondary Architectural Characteristics (Should Have)

| Characteristic | Requirement | Target Metric |
|----------------|-------------|---------------|
| **Extensibility** | Easy addition of new calculators | <1 day to add new calculator |
| **Testability** | Automated testing for accuracy | 100% calculation logic test coverage |
| **Observability** | Usage tracking and monitoring | Real-time metrics dashboard |
| **Interoperability** | Multiple interface types | REST, MCP, GraphQL (future) |
| **Evolvability** | Easy to add enterprise features | Architecture supports white-label, custom calculators |

### 1.3 Architectural Trade-offs

**Prioritization Framework:**
1. **Security > Performance** - Never compromise security for speed
2. **Accuracy > Performance** - Correct calculations are non-negotiable
3. **Availability > Feature Richness** - Core calculators must always work
4. **Developer Experience > Internal Convenience** - API design prioritizes users

---

## 2. System Boundaries and External Interfaces

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FREECALCHUB ECOSYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │  Existing Web    │                                                   │
│  │  Calculators     │                                                   │
│  │  (58+ HTML/JS)   │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           │ shares logic with                                           │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │         FREECALCHUB API PLATFORM (NEW)                  │           │
│  │                                                           │           │
│  │  ┌──────────────┐         ┌──────────────────────┐     │           │
│  │  │   REST API   │         │   MCP Server         │     │           │
│  │  │   Interface  │         │   Interface          │     │           │
│  │  └──────┬───────┘         └──────┬───────────────┘     │           │
│  │         │                         │                      │           │
│  │         └─────────┬───────────────┘                      │           │
│  │                   │                                       │           │
│  │         ┌─────────▼──────────────────────┐              │           │
│  │         │  Shared Calculator Engine      │              │           │
│  │         │  (Modularized from web logic)  │              │           │
│  │         └────────────────────────────────┘              │           │
│  │                                                           │           │
│  └─────────────────────────────────────────────────────────┘           │
│                           │                                              │
│                           │                                              │
│              ┌────────────┴────────────────┐                            │
│              ▼                             ▼                             │
│  ┌──────────────────────┐      ┌────────────────────┐                  │
│  │  PostgreSQL          │      │  Redis Cache       │                  │
│  │  (Usage Tracking)    │      │  (Response Cache)  │                  │
│  └──────────────────────┘      └────────────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

External Integrations:
┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐
│   Stripe     │  │  Currency Data   │  │  CloudFlare CDN  │
│  (Billing)   │  │    Provider      │  │  (Distribution)  │
└──────────────┘  └──────────────────┘  └───────────────────┘

User Types:
┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐
│  Developer   │  │    LLM/AI        │  │   Web Visitors   │
│   (REST)     │  │    (MCP)         │  │  (Existing HTML) │
└──────────────┘  └──────────────────┘  └───────────────────┘
```

### 2.2 Interface Definitions

#### 2.2.1 Frontend Interfaces (External)

**A. Existing Web Calculators (Must Remain Functional)**
- **Interface Type:** HTML/JavaScript embedded calculators
- **Users:** 58+ calculators serving organic web traffic
- **Critical Constraint:** Cannot break existing functionality
- **Integration Pattern:** Shared calculation logic via modular libraries
- **Data Flow:** User input → Client-side validation → Calculator engine → DOM update

**B. REST API (New - Primary Revenue Driver)**
- **Interface Type:** RESTful HTTP/HTTPS API
- **Endpoint Pattern:** `https://api.freecalchub.com/v1/{category}/{calculator}`
- **Authentication:** Bearer token (API key)
- **Content Types:** JSON (primary), XML (future), CSV (batch)
- **Users:** Developers, third-party applications
- **Expected Volume:** 100 calls/month (free) to 100,000+ calls/month (paid)

**C. MCP Server Interface (New - AI Differentiation)**
- **Interface Type:** Model Context Protocol for LLM integration
- **Protocol:** MCP tool definitions and JSON-RPC communication
- **Users:** Claude, GPT-4, and other LLM platforms
- **Integration:** Native tool calling within LLM conversations
- **Key Advantage:** Natural language parameter extraction

#### 2.2.2 Backend Interfaces (External Dependencies)

**A. Stripe Integration (Critical for Revenue)**
- **Purpose:** Subscription billing, usage tracking, payment processing
- **Integration Type:** Stripe API + Webhooks
- **Operations Required:**
  - Customer creation and management
  - Subscription lifecycle management
  - Usage-based billing (API call metering)
  - Invoice generation
- **Webhook Events:** payment_succeeded, subscription_updated, usage_recorded

**B. Currency Data Provider (For Currency Calculator)**
- **Purpose:** Real-time and historical exchange rates
- **Required Data:** 150+ currency pairs, daily updates
- **Refresh Rate:** Daily for free tier, real-time for paid tiers
- **Fallback Strategy:** Cached rates + stale data warnings
- **Providers Considered:** ExchangeRate-API, Fixer.io, Open Exchange Rates

**C. Authentication Service (JWT Management)**
- **Purpose:** API key generation, JWT signing/verification
- **Token Types:** Access tokens (short-lived), Refresh tokens (long-lived)
- **Security Requirements:** RS256 signing, secure key rotation
- **Integration:** Middleware for all API routes

#### 2.2.3 Internal System Interfaces

**A. Calculator Engine Interface (Core Component)**
```javascript
// Standardized calculator interface
interface CalculatorEngine {
  execute(params: CalculatorInput): CalculatorOutput;
  validate(params: CalculatorInput): ValidationResult;
  getMetadata(): CalculatorMetadata;
}
```

**B. API Gateway Interface**
- **Responsibilities:** Authentication, rate limiting, request routing
- **Pattern:** Middleware chain with failover logic
- **Logging:** Request/response logging for audit trail

**C. Storage Interfaces**
- **PostgreSQL:** User accounts, API keys, usage records
- **Redis:** Response caching, rate limit counters, session data

### 2.3 System Boundary Constraints

**In Scope:**
- ✅ Extraction and modularization of 58+ calculator logic
- ✅ REST API with full CRUD operations
- ✅ MCP server wrapper for LLM integration
- ✅ API authentication and authorization
- ✅ Usage tracking and billing integration
- ✅ Response caching for performance
- ✅ Rate limiting per tier
- ✅ Developer portal and documentation

**Out of Scope:**
- ❌ Modification of existing web calculator UI
- ❌ Custom calculator builder (post-MVP)
- ❌ GraphQL interface (Phase 3)
- ❌ WebSocket real-time updates (Phase 3)
- ❌ White-label customization (Enterprise feature)
- ❌ Mobile SDK development (future consideration)

**Boundary Decisions:**
- **Calculator Logic:** Must be extracted and shared between web and API
- **Data Ownership:** API platform owns usage data, not calculation results
- **Authentication:** API-specific, separate from web session management
- **Deployment:** Separate infrastructure for API, existing web stays on current hosting

---

## 3. Functional Requirements Analysis

### 3.1 Core Functional Requirements (Must Have for MVP)

#### FR-1: Calculator Logic Modularization
**Requirement:** Extract calculation logic from 58+ web calculators into reusable modules
**Acceptance Criteria:**
- Each calculator exposed as standalone TypeScript/JavaScript module
- Web calculators continue to function without modification
- API endpoints use identical calculation logic
- 100% accuracy parity between web and API results

**Architecture Implications:**
- Need shared library accessible to both web and API codebases
- Version control for calculator logic (breaking changes management)
- Testing framework that validates both interfaces

#### FR-2: REST API Implementation
**Requirement:** Implement RESTful API for all calculator operations
**Acceptance Criteria:**
- Standardized endpoint structure: `/v1/{category}/{calculator}`
- JSON request/response format with schema validation
- HTTP status codes following REST conventions (200, 400, 401, 403, 429, 500)
- OpenAPI 3.0 specification for all endpoints

**Priority Endpoints (Phase 1 POC):**
1. `POST /v1/finance/loan` - Loan calculations
2. `POST /v1/math/percentage` - Percentage calculations
3. `POST /v1/health/bmi` - BMI calculations
4. `POST /v1/conversions/currency` - Currency conversion
5. `POST /v1/finance/investment/compound` - Compound interest

#### FR-3: MCP Server Implementation
**Requirement:** Implement Model Context Protocol server for LLM integration
**Acceptance Criteria:**
- MCP tool definitions for all calculators
- Natural language parameter extraction
- Error messages optimized for LLM understanding
- Context-aware calculator recommendations

**Sample Tool Definition:**
```json
{
  "name": "calculate_loan",
  "description": "Calculate monthly payment, total interest, and amortization schedule for a loan",
  "parameters": {
    "type": "object",
    "properties": {
      "principal": {
        "type": "number",
        "description": "Loan principal amount in dollars"
      },
      "annual_rate": {
        "type": "number",
        "description": "Annual interest rate as percentage (e.g., 5.5 for 5.5%)"
      },
      "term_months": {
        "type": "number",
        "description": "Loan term in months"
      },
      "extra_payment": {
        "type": "number",
        "description": "Optional extra monthly payment",
        "default": 0
      }
    },
    "required": ["principal", "annual_rate", "term_months"]
  }
}
```

#### FR-4: Authentication and Authorization
**Requirement:** Secure API access with token-based authentication
**Acceptance Criteria:**
- API key generation via developer portal
- JWT access tokens with configurable expiration
- Refresh token mechanism for long-lived sessions
- Role-based access control (RBAC) for enterprise features

**Security Flow:**
1. User registers → API key generated
2. Client requests access token with API key
3. Access token used for API calls (Bearer authentication)
4. Token validation on every request
5. Refresh token used to obtain new access token

#### FR-5: Rate Limiting
**Requirement:** Enforce tier-based rate limits
**Acceptance Criteria:**
- Free tier: 100 calls/month, 10 calls/minute
- Developer tier: 10,000 calls/month, 100 calls/minute
- Professional tier: 100,000 calls/month, 1,000 calls/minute
- Enterprise tier: Unlimited with custom limits
- Clear error messages when limits exceeded (HTTP 429)
- Rate limit headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining)

#### FR-6: Usage Tracking
**Requirement:** Track API usage for billing and analytics
**Acceptance Criteria:**
- Record every API call with timestamp, user, endpoint, response time
- Aggregate usage by user and time period (daily, monthly)
- Export usage data for billing integration
- Real-time usage dashboard for users
- Webhook notifications for usage thresholds (80%, 100%)

#### FR-7: Response Caching
**Requirement:** Cache calculation results for performance
**Acceptance Criteria:**
- Deterministic calculations cached (same input → same output)
- Cache key based on calculator + parameters
- TTL based on data volatility (currency: 1 hour, loan: 24 hours)
- Cache invalidation on calculator version updates
- Cache hit rate >70% target

### 3.2 Phase 2 Functional Requirements (Post-MVP)

#### FR-8: Batch Processing
**Requirement:** Process multiple calculations in single request
**Batch Size:** Up to 100 calculations per request (Professional tier)
**Response Format:** Array of results with individual status codes

#### FR-9: Webhook Callbacks
**Requirement:** Async calculation results via webhooks
**Use Case:** Long-running calculations or scheduled batch jobs
**Reliability:** Retry logic with exponential backoff

#### FR-10: Advanced Analytics
**Requirement:** Detailed usage analytics and insights
**Metrics:** Most-used calculators, peak usage times, error rates, performance trends

### 3.3 Non-Functional Requirements

#### NFR-1: Performance Requirements
- **Response Time:** <100ms p95 for all calculator endpoints
- **Throughput:** Support 1,000 requests/second at peak
- **Database Query Time:** <20ms for usage tracking inserts
- **Cache Hit Ratio:** >70% for cacheable calculators

**Performance Testing Requirements:**
- Load testing at 10x expected traffic
- Stress testing to identify breaking points
- Endurance testing for memory leaks

#### NFR-2: Availability Requirements
- **Uptime SLA:** 99.9% (43 minutes downtime/month maximum)
- **Recovery Time Objective (RTO):** <5 minutes
- **Recovery Point Objective (RPO):** <1 minute of data loss
- **Health Check Frequency:** Every 30 seconds
- **Automatic Failover:** <30 seconds

**Availability Strategy:**
- Multi-region deployment (primary + failover)
- Database replication with automatic failover
- Circuit breaker pattern for external dependencies
- Graceful degradation (serve cached results if database down)

#### NFR-3: Scalability Requirements
- **Horizontal Scaling:** Auto-scale based on request volume
- **Scale-up Trigger:** CPU >70% for 2 minutes
- **Scale-down Trigger:** CPU <30% for 10 minutes
- **Maximum Instances:** 20 (configurable per environment)
- **Database Scaling:** Connection pooling, read replicas for analytics

#### NFR-4: Security Requirements
- **Authentication:** JWT with RS256 signing
- **Authorization:** API key + tier-based access control
- **Encryption in Transit:** TLS 1.3 only
- **Encryption at Rest:** AES-256 for sensitive data
- **Input Validation:** JSON schema validation on all inputs
- **Rate Limiting:** Token bucket algorithm with Redis
- **Audit Logging:** All API calls logged with request/response bodies
- **GDPR Compliance:** No PII in calculation data, user data anonymization options

#### NFR-5: Reliability Requirements
- **Error Rate:** <0.1% (999 successful requests per 1000)
- **Calculation Accuracy:** 100% (zero tolerance for incorrect results)
- **Data Integrity:** Checksums for all stored data
- **Retry Logic:** Exponential backoff for transient failures
- **Timeout Handling:** 30 second timeout for all API calls

#### NFR-6: Maintainability Requirements
- **Code Coverage:** >80% for calculator logic, >70% overall
- **Documentation Coverage:** 100% of public API endpoints documented
- **Logging Standards:** Structured JSON logging with correlation IDs
- **Monitoring Dashboards:** Real-time metrics for all critical paths
- **Deployment Frequency:** Support multiple deployments per day (CI/CD)

#### NFR-7: Usability Requirements (Developer Experience)
- **API Discovery:** Interactive API explorer (Swagger UI)
- **Error Messages:** Clear, actionable error messages with examples
- **Code Examples:** Sample code in 5+ languages (JS, Python, Go, Ruby, PHP)
- **SDKs:** Official SDKs for popular languages (Phase 2)
- **Onboarding Time:** Developer can make first successful API call in <5 minutes

---

## 4. Stakeholder Concerns Analysis

### 4.1 Primary Stakeholder: Developer Dave (API Consumers)

**Profile:**
- Full-stack developer at fintech startup
- Building mobile app requiring loan calculations
- Timeline pressure: needs to ship in 2 weeks
- Technical skill: High, but prefers simple APIs

**Critical Concerns:**
1. **Integration Simplicity**
   - Concern: "How quickly can I integrate this into my app?"
   - Requirement: Clear documentation, code examples, <5 minute first call
   - Architecture Impact: Need comprehensive docs, interactive API explorer

2. **Reliability**
   - Concern: "Will this API be available when my users need it?"
   - Requirement: 99.9% uptime SLA, status page, incident notifications
   - Architecture Impact: Multi-region deployment, health monitoring, alerting

3. **Cost Predictability**
   - Concern: "Will API costs scale linearly with my user growth?"
   - Requirement: Transparent pricing, usage alerts, cost estimation tools
   - Architecture Impact: Accurate usage tracking, real-time metrics dashboard

4. **Performance**
   - Concern: "Will API latency impact my app's user experience?"
   - Requirement: <100ms response time, low jitter, global CDN
   - Architecture Impact: Edge caching, optimized algorithms, performance monitoring

5. **Support Quality**
   - Concern: "What happens when I get stuck?"
   - Requirement: Responsive support, detailed error messages, community forum
   - Architecture Impact: Comprehensive error logging, debugging tools

**Success Metrics for Developer Dave:**
- Time to first successful API call: <5 minutes
- Integration completion time: <4 hours
- Support ticket resolution time: <24 hours
- API availability experienced: >99.9%

### 4.2 Primary Stakeholder: AI Agent Alice (LLM Applications)

**Profile:**
- LLM-powered financial advisor chatbot
- Requires accurate calculations for mortgage and investment advice
- Natural language input from end users
- Zero tolerance for calculation errors (legal liability)

**Critical Concerns:**
1. **Calculation Accuracy**
   - Concern: "Can I trust these calculations for financial advice?"
   - Requirement: 100% accuracy, audit trail, versioning
   - Architecture Impact: Extensive testing, calculation validation, version control

2. **Natural Language Integration**
   - Concern: "How does the LLM extract parameters from user queries?"
   - Requirement: Clear tool definitions, parameter descriptions, examples
   - Architecture Impact: MCP tool design, parameter validation, helpful errors

3. **Error Handling**
   - Concern: "How do I handle errors gracefully in conversations?"
   - Requirement: LLM-friendly error messages, suggested corrections
   - Architecture Impact: Structured error responses, context-aware messages

4. **Multi-Step Workflows**
   - Concern: "Can I chain multiple calculations together?"
   - Requirement: Support for complex financial scenarios
   - Architecture Impact: Stateless design, support for calculation sequences

5. **Compliance**
   - Concern: "Does this meet financial calculation standards?"
   - Requirement: Regulatory compliance, calculation methodology transparency
   - Architecture Impact: Documented formulas, compliance certifications

**Success Metrics for AI Agent Alice:**
- Calculation accuracy: 100%
- Parameter extraction success rate: >95%
- Error recovery rate: >90%
- User satisfaction with financial advice: >4.5/5

### 4.3 Primary Stakeholder: Enterprise Emma (Corporate IT Director)

**Profile:**
- IT Director at insurance company (500+ employees)
- Needs standardized calculations across departments
- Budget authority: $50K+ annual contracts
- Requires SLAs, audit trails, and support

**Critical Concerns:**
1. **SLA Guarantees**
   - Concern: "What happens if the API goes down during business hours?"
   - Requirement: 99.9% SLA with financial penalties, dedicated support
   - Architecture Impact: Enterprise-grade infrastructure, SLA monitoring

2. **Custom Calculators**
   - Concern: "Can you build insurance-specific calculators for us?"
   - Requirement: Custom calculator development service, private endpoints
   - Architecture Impact: Extensible calculator framework, multi-tenant architecture

3. **Security & Compliance**
   - Concern: "How do we ensure data privacy and audit compliance?"
   - Requirement: SOC 2 compliance, audit logs, data residency options
   - Architecture Impact: Comprehensive logging, compliance certifications, regional deployment

4. **White-Label Options**
   - Concern: "Can we brand this as our own calculation service?"
   - Requirement: Custom domain, branded API documentation, no attribution
   - Architecture Impact: Multi-tenant design, configurable branding

5. **Enterprise Support**
   - Concern: "Do we have dedicated support for critical issues?"
   - Requirement: Phone support, dedicated account manager, custom SLAs
   - Architecture Impact: Priority queue, escalation workflows

**Success Metrics for Enterprise Emma:**
- SLA compliance: 100% (financial penalties if missed)
- Custom calculator delivery time: <2 weeks
- Support response time: <1 hour for critical issues
- ROI vs in-house development: >300%

### 4.4 Secondary Stakeholder: Existing Web Users

**Profile:**
- Current users of 58+ web calculators
- Expect calculators to work exactly as they do now
- May not know or care about API development

**Critical Concerns:**
1. **Zero Disruption**
   - Concern: "I just want my calculator to keep working"
   - Requirement: 100% functionality preservation
   - Architecture Impact: Shared calculation logic, regression testing

2. **Performance Consistency**
   - Concern: "The calculator should be just as fast"
   - Requirement: No performance degradation from modularization
   - Architecture Impact: Optimized shared libraries, performance benchmarks

**Success Metrics for Web Users:**
- Functionality preservation: 100%
- Performance degradation: 0%
- User-reported issues: 0

### 4.5 Internal Stakeholder: FreecalcHub Business

**Strategic Concerns:**
1. **Revenue Growth**
   - Target: $42K Year 1 → $1.14M Year 3
   - Requirement: Scalable monetization, low churn
   - Architecture Impact: Usage-based billing, tier flexibility

2. **Market Positioning**
   - Target: Top 3 calculator API by Year 2
   - Requirement: Differentiation via MCP, comprehensive suite
   - Architecture Impact: LLM-first features, rapid calculator addition

3. **Operational Efficiency**
   - Target: Minimal support burden, high automation
   - Requirement: Self-service portal, excellent documentation
   - Architecture Impact: Automated onboarding, clear error messages

4. **Risk Mitigation**
   - Target: Prevent calculation errors, maintain trust
   - Requirement: Extensive testing, version control, audit trails
   - Architecture Impact: Calculation validation framework, error tracking

---

## 5. Architectural Constraints and Assumptions

### 5.1 Hard Constraints (Cannot Change)

#### C-1: Existing Calculator Preservation
**Constraint:** Must not break or modify the existing 58+ web calculators
**Justification:** These calculators drive significant organic traffic and revenue
**Architecture Impact:**
- Calculation logic must be extracted, not replaced
- Web calculators continue to use current JavaScript files
- Shared libraries loaded alongside existing code (no refactoring of HTML/JS)

**Validation Requirement:**
- Automated regression tests comparing web vs API outputs
- Test all 58+ calculators with comprehensive input sets
- Performance benchmarks to detect degradation

#### C-2: Dual-Interface Requirement
**Constraint:** Must support both REST API and MCP server interfaces
**Justification:** Revenue model depends on both developer and LLM markets
**Architecture Impact:**
- Calculation engine must be interface-agnostic
- Single source of truth for calculator logic
- Both interfaces use identical validation and execution paths

**Design Pattern:**
```javascript
// Shared calculation engine
CalculatorEngine.execute(params) → results

// REST API wrapper
app.post('/api/v1/finance/loan', (req, res) => {
  const result = CalculatorEngine.loan.execute(req.body);
  res.json(result);
});

// MCP tool wrapper
mcpServer.defineTool('calculate_loan', (params) => {
  return CalculatorEngine.loan.execute(params);
});
```

#### C-3: Serverless Architecture
**Constraint:** Must use serverless infrastructure (Vercel Functions / AWS Lambda)
**Justification:** Cost efficiency for variable API demand, pay-per-use model
**Architecture Impact:**
- Stateless function design
- Cold start optimization (<100ms initialization)
- External state management (Redis, PostgreSQL)

**Cold Start Mitigation:**
- Pre-warmed function pools
- Optimized dependency bundling
- Connection pooling for databases

#### C-4: Security-First Development
**Constraint:** Never compromise security for convenience (CLAUDE.md principle)
**Justification:** API security breaches could destroy business trust
**Architecture Impact:**
- All security features are non-negotiable
- Root cause analysis required before any security modifications
- Security review for all architectural decisions

**Security Checklist:**
- ✅ TLS 1.3 for all communications
- ✅ JWT with strong signing algorithms (RS256)
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent abuse
- ✅ Audit logging for all API calls
- ✅ Regular security audits

#### C-5: Response Time Target
**Constraint:** <100ms p95 response time for all calculator endpoints
**Justification:** Developer experience and competitive advantage
**Architecture Impact:**
- Aggressive caching strategy
- Optimized calculation algorithms
- CDN distribution for global latency reduction
- Database query optimization

**Performance Budget:**
- Authentication: <10ms
- Calculation: <30ms
- Database logging: <20ms (async)
- Response serialization: <10ms
- Network latency: <30ms (via CDN)
- **Total: <100ms p95**

### 5.2 Soft Constraints (Can Negotiate)

#### C-6: Technology Stack
**Preferred:** Node.js 20+ with TypeScript, Express.js/Fastify
**Flexibility:** Can use other languages/frameworks if justified
**Constraint Reason:** Existing calculator logic is JavaScript-based
**Alternative Consideration:** Go or Rust for performance-critical calculators

#### C-7: Database Choice
**Preferred:** PostgreSQL for relational data, Redis for caching
**Flexibility:** Can use other databases if performance/cost benefits proven
**Constraint Reason:** Team familiarity, strong ACID guarantees

#### C-8: Deployment Platform
**Preferred:** Vercel Functions (primary), AWS Lambda (alternative)
**Flexibility:** Can use other serverless platforms
**Constraint Reason:** Ease of deployment, cost structure

### 5.3 Assumptions (Need Validation)

#### A-1: Calculator Logic Extractability
**Assumption:** Existing JavaScript calculation logic can be cleanly extracted into modules
**Validation Needed:** Analyze 5 POC calculators for extraction feasibility
**Risk if False:** May require rewriting calculation logic (high effort, accuracy risk)
**Mitigation:** Phase 1 POC validates extraction approach before full rollout

#### A-2: Calculation Determinism
**Assumption:** Most calculators are deterministic (same input → same output)
**Validation Needed:** Identify non-deterministic calculators (e.g., currency with real-time data)
**Impact on Caching:** Deterministic calculators can be aggressively cached
**Exception Handling:** Non-deterministic calculators need TTL-based caching

#### A-3: API Demand Volume
**Assumption:** Revenue projections assume 5-10% conversion from free to paid
**Validation Needed:** Beta testing with early adopters
**Risk if False:** Over/under-provisioned infrastructure
**Mitigation:** Auto-scaling architecture handles wide variance

#### A-4: LLM Integration Adoption
**Assumption:** MCP will become standard for LLM tool integration
**Validation Needed:** Monitor MCP protocol adoption across LLM platforms
**Risk if False:** Investment in MCP may not yield expected returns
**Mitigation:** REST API is primary interface, MCP is value-add

#### A-5: Calculation Accuracy Parity
**Assumption:** Extracted calculator logic will produce identical results to web calculators
**Validation Needed:** Comprehensive testing with edge cases
**Risk if False:** Loss of user trust, potential legal issues
**Mitigation:** Automated regression testing, gradual rollout, version comparison tools

#### A-6: Developer Documentation Quality
**Assumption:** Excellent documentation will drive 50%+ of conversions
**Validation Needed:** User testing of documentation with developers
**Impact:** Documentation is critical path for MVP success
**Mitigation:** Invest heavily in docs, interactive examples, video tutorials

### 5.4 Regulatory and Compliance Constraints

#### C-9: GDPR Compliance
**Requirement:** No storage of PII without explicit consent
**Architecture Impact:**
- Calculation inputs/outputs are not stored (unless user opts in)
- Usage tracking uses anonymized identifiers
- Right to deletion supported (wipe all user data)
- Data residency options for EU users

#### C-10: Financial Calculation Standards
**Requirement:** Calculation methodologies must be transparent and auditable
**Architecture Impact:**
- Document calculation formulas
- Version all calculation logic
- Audit trail for all calculation executions
- Support for calculation verification (input → formula → output transparency)

#### C-11: API Key Security
**Requirement:** API keys must be stored securely, never in plaintext
**Architecture Impact:**
- Hash API keys before storage (bcrypt or Argon2)
- Support key rotation without service disruption
- Automatic key expiration and renewal

---

## 6. Risk Assessment and Mitigation Strategies

### 6.1 Technical Risks

#### Risk T-1: Calculator Logic Extraction Failure
**Probability:** Medium (40%)
**Impact:** Critical (blocks MVP)
**Root Cause:** Existing JavaScript may be tightly coupled to DOM or have hidden dependencies

**Mitigation Strategy:**
1. **Phase 1 POC Validation:** Extract 5 calculators before committing to full architecture
2. **Extraction Pattern:**
   ```javascript
   // Current (coupled to DOM)
   function calculateLoan() {
     const principal = document.getElementById('principal').value;
     // ...calculation...
     document.getElementById('result').innerText = payment;
   }

   // Refactored (modular)
   export function calculateLoan(params) {
     const { principal, rate, term } = params;
     // ...calculation...
     return { monthlyPayment, totalInterest };
   }
   ```
3. **Dual Implementation:** If extraction fails, rewrite calculator logic with test parity
4. **Testing Framework:** Automated tests ensuring web and API produce identical results

**Contingency Plan:**
- If >20% of calculators can't be extracted cleanly, pivot to gradual rewrite
- Prioritize high-value calculators first (loan, mortgage, investment)
- Accept technical debt of dual maintenance temporarily

#### Risk T-2: Performance Degradation
**Probability:** Medium (30%)
**Impact:** High (fails <100ms SLA)
**Root Cause:** Serverless cold starts, inefficient algorithms, database latency

**Mitigation Strategy:**
1. **Cold Start Optimization:**
   - Pre-warm function pools with scheduled pings
   - Minimize dependency bundling (tree-shaking, code splitting)
   - Use provisioned concurrency for critical endpoints
2. **Algorithm Optimization:**
   - Profile all calculations for performance bottlenecks
   - Use memoization for repeated calculations
   - Implement incremental calculation where possible (e.g., amortization schedules)
3. **Caching Strategy:**
   - Redis cache for deterministic calculations
   - CDN edge caching for global latency reduction
   - Cache-warming for popular calculator/parameter combinations
4. **Database Optimization:**
   - Async logging (don't block response on DB writes)
   - Connection pooling
   - Read replicas for analytics queries

**Performance Monitoring:**
- Real-time p95 response time tracking
- Automatic alerts if >100ms sustained for 5 minutes
- Weekly performance reports with regression detection

#### Risk T-3: Scalability Bottlenecks
**Probability:** Low (20%)
**Impact:** High (service degradation during traffic spikes)
**Root Cause:** Database connection limits, rate limiter saturation, memory leaks

**Mitigation Strategy:**
1. **Load Testing:**
   - Test at 10x expected peak traffic
   - Identify breaking points and bottlenecks
   - Simulate Black Friday-level traffic spikes
2. **Database Scaling:**
   - Connection pooling with max limits
   - Read replicas for usage analytics
   - Consider Aurora Serverless for auto-scaling PostgreSQL
3. **Rate Limiter Design:**
   - Distributed rate limiting with Redis
   - Per-user and global rate limits
   - Graceful degradation (serve cached results when throttled)
4. **Memory Management:**
   - Serverless functions auto-restart (no long-lived memory leaks)
   - Monitor memory usage per function invocation

**Stress Testing Plan:**
- Monthly load tests simulating 100K requests/minute
- Chaos engineering: random component failures
- Gradual traffic ramp-up during launches

#### Risk T-4: Data Consistency Issues
**Probability:** Low (15%)
**Impact:** Critical (incorrect calculations, billing errors)
**Root Cause:** Race conditions, eventual consistency, calculation version mismatches

**Mitigation Strategy:**
1. **Transactional Integrity:**
   - Use database transactions for critical operations (billing, usage tracking)
   - Idempotency keys for duplicate request detection
   - Optimistic locking for concurrent updates
2. **Calculation Versioning:**
   - Version all calculator logic (semantic versioning)
   - Store calculation version with each API call
   - Support parallel versions during migrations
3. **Testing Strategy:**
   - Concurrent request testing for race conditions
   - Property-based testing for calculation correctness
   - Chaos testing for eventual consistency scenarios

**Data Validation:**
- Checksums for all stored calculation data
- Periodic audits comparing usage logs with billing records
- Reconciliation reports for discrepancies

### 6.2 Business Risks

#### Risk B-1: Low API Adoption
**Probability:** Medium (35%)
**Impact:** High (revenue targets missed)
**Root Cause:** Poor developer experience, inadequate marketing, strong competition

**Mitigation Strategy:**
1. **Developer Experience Focus:**
   - Interactive API explorer (try before signup)
   - Code examples in 5+ languages
   - Video tutorials for common use cases
   - <5 minute onboarding time
2. **Generous Free Tier:**
   - 100 API calls/month free (enough to evaluate)
   - No credit card required for free tier
   - Easy upgrade path to paid tiers
3. **Marketing Strategy:**
   - Product Hunt launch with demo video
   - Content marketing: "How to add calculations to your app in 5 minutes"
   - Developer community outreach (Reddit, HackerNews, Dev.to)
   - Partnership with LLM platforms (Claude, OpenAI)
4. **Feedback Loop:**
   - Beta testing with 50 developers before public launch
   - Weekly user interviews to identify friction points
   - Rapid iteration on documentation and DX

**Success Indicators:**
- 100 developer signups in first month
- 10 paying customers within 3 months
- 4.5/5 developer satisfaction rating

#### Risk B-2: High Churn Rate
**Probability:** Medium (30%)
**Impact:** High (revenue growth stalls)
**Root Cause:** Unreliable service, better alternatives, cost concerns

**Mitigation Strategy:**
1. **Reliability Excellence:**
   - 99.9% uptime SLA with financial penalties
   - Proactive incident communication
   - Status page with real-time metrics
2. **Value Demonstration:**
   - Usage analytics showing ROI (time saved vs in-house development)
   - Case studies from successful customers
   - Feature releases that increase stickiness (batch processing, webhooks)
3. **Retention Tactics:**
   - Annual billing discounts (15% off)
   - Loyalty rewards for long-term customers
   - Proactive support for high-value accounts
4. **Churn Analysis:**
   - Exit interviews with churned customers
   - Identify common churn triggers
   - Automated win-back campaigns

**Churn Target:** <5% monthly churn rate

#### Risk B-3: Competition from Established Players
**Probability:** High (60%)
**Impact:** Medium (market share pressure)
**Root Cause:** Low barriers to entry, attractive market opportunity

**Mitigation Strategy:**
1. **First-Mover Advantage:**
   - Launch before competitors recognize opportunity
   - Build comprehensive calculator suite (58+ vs competitors' 10-20)
   - Establish brand as "calculator API" leader
2. **Differentiation:**
   - MCP integration for LLM market (unique offering)
   - Superior developer experience (docs, examples, support)
   - More generous free tier than competitors
3. **Network Effects:**
   - Open-source client libraries (community contributions)
   - Public calculator marketplace (user-contributed calculators)
   - Integration ecosystem (Zapier, n8n, etc.)
4. **Innovation Pipeline:**
   - Custom calculator builder (Phase 3)
   - White-label options for enterprises
   - Industry-specific calculator suites (fintech, healthcare, e-commerce)

**Competitive Monitoring:**
- Weekly competitor analysis (new features, pricing changes)
- User surveys comparing FreecalcHub to alternatives
- Feature parity tracking

### 6.3 Operational Risks

#### Risk O-1: Support Burden Overwhelming Team
**Probability:** Medium (40%)
**Impact:** Medium (slows feature development)
**Root Cause:** Inadequate documentation, complex integration issues, high user volume

**Mitigation Strategy:**
1. **Self-Service Documentation:**
   - Comprehensive FAQ covering 80% of common questions
   - Interactive troubleshooting wizard
   - Community forum for peer support
   - Video tutorials for complex integrations
2. **Automated Support:**
   - Chatbot for common questions (powered by LLM + MCP)
   - Automated debugging tools (API request inspector)
   - Email templates for frequent issues
3. **Tiered Support:**
   - Free tier: Community support only
   - Paid tiers: Email support (24-48 hour SLA)
   - Enterprise: Phone support with dedicated account manager
4. **Support Analytics:**
   - Track most common support topics
   - Proactively improve documentation for top issues
   - Identify product gaps causing support burden

**Support Metrics:**
- <2% of active users create support tickets
- 80% of tickets resolved via self-service
- <24 hour response time for paid tier support

#### Risk O-2: Infrastructure Cost Overruns
**Probability:** Low (25%)
**Impact:** Medium (impacts profitability)
**Root Cause:** Inefficient resource usage, unexpected traffic patterns, cache miss ratio

**Mitigation Strategy:**
1. **Cost Monitoring:**
   - Real-time infrastructure cost dashboards
   - Alerts for anomalous spending
   - Cost attribution per customer/tier
2. **Optimization Tactics:**
   - Aggressive caching to reduce compute costs
   - Serverless auto-scaling to match demand
   - Reserved instances for predictable baseline load
   - CDN for static content and edge caching
3. **Cost per API Call Target:**
   - Target: <$0.001 per API call
   - Break down costs: compute, database, cache, network
   - Optimize highest-cost components first
4. **Pricing Alignment:**
   - Ensure pricing covers infrastructure costs + margin
   - Adjust tiers if cost structure changes
   - Enterprise custom pricing for high-volume users

**Cost Optimization Cycle:**
- Monthly cost review and optimization
- Quarterly pricing strategy review
- Annual infrastructure architecture assessment

#### Risk O-3: Calculation Accuracy Incidents
**Probability:** Low (10%)
**Impact:** Critical (legal liability, trust erosion)
**Root Cause:** Logic bugs, rounding errors, formula mistakes, version mismatches

**Mitigation Strategy:**
1. **Extensive Testing:**
   - Unit tests for all calculation logic (>95% coverage)
   - Property-based testing (QuickCheck-style)
   - Regression tests comparing web vs API outputs
   - Edge case testing (zero, negative, extreme values)
2. **Calculation Validation:**
   - Independent verification of complex formulas (loan, mortgage, investment)
   - Third-party audit of calculation accuracy
   - User-reported issue tracking with high priority
3. **Version Control:**
   - Semantic versioning for all calculators
   - Changelog documenting formula changes
   - Support for multiple API versions (v1, v2) during transitions
4. **Incident Response:**
   - Automated alerts for calculation anomalies (sudden result changes)
   - Rollback mechanism for bad calculator deployments
   - Transparent communication about calculation fixes

**Accuracy Guarantee:**
- 100% calculation accuracy (zero tolerance for errors)
- Formal verification for critical financial calculators
- Public bug bounty for calculation errors ($500-$5,000 rewards)

---

## 7. Critical Architectural Decisions Required

### 7.1 Decision Point D-1: Calculator Logic Extraction Strategy

**Context:** 58+ web calculators currently have calculation logic embedded in HTML/JavaScript files. Need to extract this logic for API use while maintaining web calculator functionality.

**Options:**

**Option A: Gradual Extraction with Dual Maintenance**
- Extract calculator logic into shared modules
- Web calculators import shared modules alongside existing code
- No modification to existing HTML/JavaScript structure
- **Pros:** Zero risk to existing web calculators, incremental approach
- **Cons:** Temporary dual code paths, longer timeline

**Option B: Full Refactor with Replacement**
- Completely rewrite web calculator JavaScript to use new shared modules
- Replace existing calculator files with modular architecture
- **Pros:** Clean architecture, single source of truth immediately
- **Cons:** High risk of breaking existing calculators, requires extensive regression testing

**Option C: API-First with Web Wrapper**
- Build API calculators from scratch using validated formulas
- Web calculators call API endpoints (internal or public)
- **Pros:** Single calculation source, web automatically benefits from API improvements
- **Cons:** Adds latency to web calculators, couples web to API availability

**Recommended Decision: Option A - Gradual Extraction**
- **Rationale:** Minimizes risk to existing revenue-generating web calculators
- **Phase 1 POC:** Validate extraction approach with 5 calculators
- **Rollout:** Extract calculators incrementally, prioritize high-value ones first
- **Future State:** Eventually deprecate old code paths once API proven stable

**Architecture Impact:**
```javascript
// Phase 1: Dual implementation
// Web calculator (existing)
function calculateLoan() { /* existing logic */ }

// Shared module (new)
export function loanCalculation(params) { /* extracted logic */ }

// Phase 2: Web uses shared module
import { loanCalculation } from './shared/loan-engine.js';
function calculateLoan() {
  const result = loanCalculation({ /* params */ });
  // update DOM
}
```

### 7.2 Decision Point D-2: Caching Strategy

**Context:** Need to balance performance (<100ms) with data freshness. Some calculators are deterministic (loan, BMI), others need real-time data (currency).

**Options:**

**Option A: Aggressive Caching with Long TTL**
- Cache all calculations for 24 hours
- Invalidate cache on calculator version updates
- **Pros:** Maximum performance, lowest infrastructure cost
- **Cons:** Stale data for time-sensitive calculators (currency)

**Option B: Calculator-Specific TTL**
- Deterministic calculators: 24 hour TTL
- Semi-deterministic (currency): 1 hour TTL
- Non-cacheable (custom): No caching
- **Pros:** Balance of performance and freshness
- **Cons:** Complex cache management, requires calculator metadata

**Option C: User-Controlled Caching**
- API parameter: `cache: true/false` or `max_age: 3600`
- User decides freshness requirements
- **Pros:** Maximum flexibility for API consumers
- **Cons:** Lower cache hit rate, more complex implementation

**Recommended Decision: Option B - Calculator-Specific TTL**
- **Rationale:** Optimal balance of performance and data freshness
- **Implementation:** Calculator metadata includes `cacheStrategy` property
- **Default Behavior:** Aggressive caching for deterministic, conservative for time-sensitive
- **Future Enhancement:** Allow paid tier users to request fresh calculations (`X-Force-Refresh` header)

**Cache Architecture:**
```javascript
const cacheConfig = {
  'finance/loan': { ttl: 86400, key: 'hash(params)' },        // 24 hours
  'finance/currency': { ttl: 3600, key: 'hash(params+date)' }, // 1 hour
  'custom/*': { ttl: 0 }                                       // No cache
};
```

### 7.3 Decision Point D-3: MCP Server Deployment Model

**Context:** MCP server can be deployed as standalone service or embedded within REST API infrastructure.

**Options:**

**Option A: Standalone MCP Server**
- Separate deployment from REST API
- Dedicated endpoint: `mcp.freecalchub.com`
- **Pros:** Isolation, independent scaling, cleaner separation of concerns
- **Cons:** Additional infrastructure, network hop between MCP and calculator engine

**Option B: Embedded MCP Server**
- MCP server runs within same infrastructure as REST API
- Shared calculator engine, different interface layer
- **Pros:** Lower latency, shared resources, simpler deployment
- **Cons:** Coupled deployments, potential resource contention

**Option C: Hybrid Approach**
- REST API and MCP server share same serverless functions
- Router layer directs traffic based on protocol (HTTP vs MCP)
- **Pros:** Resource efficiency, single deployment, code reuse
- **Cons:** Protocol mixing complexity

**Recommended Decision: Option B - Embedded MCP Server**
- **Rationale:** Simplifies deployment, maximizes code reuse, lower latency
- **Implementation:** Single codebase with dual interface layers
- **Future Flexibility:** Can extract to standalone if scaling requirements diverge

**Architecture Pattern:**
```javascript
// Shared calculator engine
import { CalculatorEngine } from './core/engine';

// REST API interface
app.post('/api/v1/finance/loan', (req, res) => {
  const result = CalculatorEngine.execute('loan', req.body);
  res.json(result);
});

// MCP server interface
mcpServer.defineTool('calculate_loan', (params) => {
  return CalculatorEngine.execute('loan', params);
});
```

### 7.4 Decision Point D-4: Authentication Architecture

**Context:** Need to support API key authentication with potential for OAuth2, SSO in future.

**Options:**

**Option A: API Key Only**
- Simple API key generation and validation
- No session management, stateless
- **Pros:** Simple implementation, low overhead
- **Cons:** Limited security features, no fine-grained permissions

**Option B: JWT with Refresh Tokens**
- API key exchanged for short-lived JWT access token
- Refresh token for long-lived sessions
- **Pros:** Industry standard, supports expiration, fine-grained claims
- **Cons:** More complex, requires token refresh logic

**Option C: Dual Authentication**
- API key for simple use cases (server-to-server)
- OAuth2 for complex scenarios (user-delegated access)
- **Pros:** Maximum flexibility, supports all use cases
- **Cons:** High implementation complexity

**Recommended Decision: Option B - JWT with Refresh Tokens**
- **Rationale:** Balance of security and developer experience
- **MVP Implementation:** API key → JWT flow
- **Future Enhancement:** Add OAuth2 for enterprise features

**Authentication Flow:**
```
1. Developer creates account → API key generated
2. Client requests access token: POST /auth/token { api_key }
3. Server returns: { access_token (JWT, 1 hour), refresh_token (30 days) }
4. Client uses access token: Authorization: Bearer <access_token>
5. On expiration, refresh: POST /auth/refresh { refresh_token }
```

**JWT Claims:**
```json
{
  "sub": "user_id",
  "tier": "developer",
  "rate_limit": 10000,
  "scope": ["calculators:read", "batch:execute"],
  "exp": 1640995200,
  "iat": 1640991600
}
```

### 7.5 Decision Point D-5: Database Architecture for Usage Tracking

**Context:** Need to track millions of API calls for billing and analytics. Must be fast (async), queryable, and cost-effective.

**Options:**

**Option A: Relational Database (PostgreSQL)**
- Traditional RDBMS with `api_calls` table
- **Pros:** Strong consistency, powerful querying, ACID transactions
- **Cons:** Write-heavy workload may cause bottlenecks, higher cost at scale

**Option B: Time-Series Database (TimescaleDB, InfluxDB)**
- Optimized for time-series data
- **Pros:** Excellent write performance, efficient aggregations, data retention policies
- **Cons:** Additional infrastructure, learning curve

**Option C: Hybrid Approach**
- Write to message queue (SQS, Kafka) → batch insert to database
- **Pros:** Decouples API response from database writes, handles traffic spikes
- **Cons:** Eventual consistency, more complex architecture

**Recommended Decision: Option C - Hybrid with Message Queue**
- **Rationale:** Ensures <100ms API response time, handles traffic spikes gracefully
- **Implementation:**
  1. API call → async write to SQS
  2. Background worker → batch insert to PostgreSQL (every 5 seconds or 1000 records)
  3. Real-time metrics → Redis counters
  4. Analytics queries → PostgreSQL

**Data Flow:**
```
API Request
    ↓
[Calculate & Respond] <100ms
    ↓
[Async: Write to SQS] ~5ms
    ↓
[Background: Batch Insert to DB] (decoupled)
    ↓
[Analytics: Query PostgreSQL] (for dashboards)
```

**Schema Design:**
```sql
CREATE TABLE api_calls (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_params JSONB,
  response_time_ms INTEGER,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  billed BOOLEAN DEFAULT FALSE
);

-- Partitioning by month for efficient queries
CREATE INDEX idx_api_calls_user_created ON api_calls(user_id, created_at);
CREATE INDEX idx_api_calls_billing ON api_calls(user_id, billed) WHERE NOT billed;
```

---

## 8. Integration Strategy Analysis

### 8.1 External Integration: Stripe (Billing)

**Integration Criticality:** High (blocks revenue)
**Integration Type:** REST API + Webhooks

**Required Operations:**
1. **Customer Management**
   - Create customer on user registration
   - Update customer metadata (tier, usage limits)
   - Handle customer deletion (GDPR)

2. **Subscription Lifecycle**
   - Create subscription on tier upgrade
   - Update subscription on tier change
   - Cancel subscription on downgrade/churn
   - Handle payment failures (dunning)

3. **Usage-Based Billing**
   - Report API usage to Stripe (metered billing)
   - Handle overage charges for Professional tier
   - Support annual billing discounts

4. **Webhook Handling**
   - `customer.subscription.created` → Enable API access
   - `customer.subscription.deleted` → Disable API access
   - `invoice.payment_succeeded` → Reset usage counters
   - `invoice.payment_failed` → Suspend account (grace period)

**Architecture Integration:**
```javascript
// Usage reporting to Stripe
async function reportUsage(userId, quantity) {
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  await stripe.subscriptionItems.createUsageRecord(
    subscription.items.data[0].id,
    { quantity, timestamp: Math.floor(Date.now() / 1000) }
  );
}

// Webhook handler
app.post('/webhooks/stripe', (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);

  switch (event.type) {
    case 'invoice.payment_succeeded':
      resetUsageCounters(event.data.object.customer);
      break;
    case 'customer.subscription.deleted':
      disableAPIAccess(event.data.object.customer);
      break;
  }

  res.json({ received: true });
});
```

**Reliability Considerations:**
- Stripe API calls may fail → Implement retry logic with exponential backoff
- Webhooks may be delayed → Handle out-of-order events gracefully
- Usage reporting must be accurate → Reconciliation job compares our logs with Stripe

### 8.2 External Integration: Currency Data Provider

**Integration Criticality:** Medium (affects one calculator)
**Integration Type:** REST API with daily/hourly updates

**Providers Evaluated:**
1. **ExchangeRate-API** - Free tier, daily updates, 150+ currencies
2. **Fixer.io** - $10/month, hourly updates, historical data
3. **Open Exchange Rates** - $12/month, hourly updates, excellent docs

**Recommended Provider: ExchangeRate-API**
- **Rationale:** Free tier for MVP, upgrade to paid as usage grows
- **Rate Limits:** 1,500 requests/month (free), 100,000/month (paid)
- **Data Freshness:** Daily updates (free), hourly (paid)

**Caching Strategy:**
```javascript
// Cache exchange rates for 1 hour (free tier) or 15 minutes (paid tier)
async function getExchangeRate(from, to, date = 'latest') {
  const cacheKey = `exchange_rate:${from}:${to}:${date}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const data = await response.json();

  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  return data.rates[to];
}
```

**Fallback Strategy:**
- Primary: ExchangeRate-API
- Fallback: Cached rates with "stale data" warning
- Emergency: Manual rate update via admin panel

**Cost Analysis:**
- Free tier: 1,500 API calls/month = 50 currency calculations/day
- Paid tier ($10/month): 100,000 API calls = 3,333 currency calculations/day
- With 1-hour caching: 24x reduction → 80,000 currency calculations/day on paid tier

### 8.3 External Integration: CloudFlare CDN

**Integration Criticality:** Medium (performance optimization)
**Integration Type:** Reverse proxy with edge caching

**Use Cases:**
1. **Static Assets:** API documentation, code examples, images
2. **Edge Caching:** Cache API responses at global edge locations
3. **DDoS Protection:** Rate limiting, bot detection
4. **SSL/TLS Termination:** Automatic certificate management

**Configuration:**
```javascript
// CloudFlare cache rules for API responses
// Deterministic calculators: cache at edge for 1 hour
// Currency converter: cache for 5 minutes
// Custom calculators: no edge caching

// Cache-Control headers
res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Deterministic
res.set('Cache-Control', 'public, max-age=300, s-maxage=300');   // Currency
res.set('Cache-Control', 'private, no-cache');                   // Custom
```

**Performance Impact:**
- Edge caching reduces latency by 50-80ms for global users
- Offloads 70%+ of traffic from origin servers (cost savings)
- Improves availability (serve cached responses during origin outages)

**Cost Analysis:**
- CloudFlare Free Tier: Unlimited bandwidth, basic caching
- CloudFlare Pro ($20/month): Advanced caching rules, image optimization
- Expected Cost: Free tier for MVP, upgrade to Pro at 1M requests/month

### 8.4 Internal Integration: Web Calculators

**Integration Criticality:** Critical (must not break existing functionality)
**Integration Type:** Shared JavaScript libraries

**Integration Approach:**
```html
<!-- Existing calculator HTML -->
<script src="/calculators/loan-calculator.js"></script>

<!-- Add shared library (new) -->
<script src="/shared/calculator-engine.min.js"></script>

<!-- Updated calculator uses shared library -->
<script>
  // Option 1: Gradual migration (safest)
  function calculateLoan() {
    try {
      // Try new shared library
      const result = CalculatorEngine.loan.execute({
        principal: parseFloat(document.getElementById('principal').value),
        rate: parseFloat(document.getElementById('rate').value),
        term: parseInt(document.getElementById('term').value)
      });
      displayResult(result);
    } catch (error) {
      // Fallback to existing logic
      console.warn('Shared library failed, using legacy logic', error);
      calculateLoanLegacy();
    }
  }

  // Keep existing function as fallback
  function calculateLoanLegacy() {
    // ... existing logic ...
  }
</script>
```

**Rollout Strategy:**
1. **Phase 1:** Deploy shared library alongside existing code (no changes to calculators)
2. **Phase 2:** A/B test 10% of traffic using shared library
3. **Phase 3:** Gradually increase to 50%, monitor for errors
4. **Phase 4:** Full rollout once 99.9% parity confirmed
5. **Phase 5:** Remove legacy code paths

**Regression Testing:**
```javascript
// Automated testing comparing old vs new
describe('Loan Calculator Parity', () => {
  const testCases = [
    { principal: 100000, rate: 5.5, term: 360 },
    { principal: 250000, rate: 3.5, term: 180 },
    // ... 100+ test cases covering edge cases
  ];

  testCases.forEach(params => {
    it(`produces identical results for ${JSON.stringify(params)}`, () => {
      const legacyResult = calculateLoanLegacy(params);
      const sharedResult = CalculatorEngine.loan.execute(params);

      expect(sharedResult.monthlyPayment).toBeCloseTo(legacyResult.monthlyPayment, 2);
      expect(sharedResult.totalInterest).toBeCloseTo(legacyResult.totalInterest, 2);
    });
  });
});
```

---

## 9. Phase 1 POC Success Criteria

### 9.1 Technical Success Criteria

**POC Scope:** 5 calculators (loan, percentage, BMI, currency, compound interest)

#### T-1: Calculator Logic Extraction
- [ ] Successfully extract calculation logic from 5 web calculators
- [ ] Create shared TypeScript/JavaScript modules for each calculator
- [ ] Web calculators use shared modules without breaking existing functionality
- [ ] 100% parity between web and extracted logic (automated tests pass)

**Validation Method:**
- Automated regression tests with 50+ test cases per calculator
- Visual comparison testing on live web calculators
- Performance benchmarks show <5% degradation

#### T-2: REST API Implementation
- [ ] 5 working API endpoints deployed to production
- [ ] OpenAPI 3.0 specification complete and validated
- [ ] API response time <100ms p95 under 100 requests/second load
- [ ] Interactive API explorer (Swagger UI) functional

**Validation Method:**
- Load testing with k6 or Artillery (100 rps sustained for 10 minutes)
- Manual testing of all endpoints with Postman/Insomnia
- Performance monitoring showing p95 <100ms

#### T-3: Authentication System
- [ ] API key generation working
- [ ] JWT access token flow implemented
- [ ] Token validation middleware protecting all endpoints
- [ ] Rate limiting enforced (10 requests/minute for test tier)

**Validation Method:**
- Security testing with invalid tokens (should return 401)
- Rate limit testing (11th request should return 429)
- Token expiration testing (expired token should return 401)

#### T-4: MCP Server (Stretch Goal for POC)
- [ ] MCP server wrapper for 2 calculators (loan, percentage)
- [ ] Tool definitions tested with Claude or GPT-4
- [ ] Natural language parameter extraction working
- [ ] Error handling LLM-friendly

**Validation Method:**
- Manual testing with Claude/GPT-4 (conversation-based calculation)
- Parameter extraction accuracy >90% for common phrasing
- Error messages understandable to LLMs

### 9.2 Business Success Criteria

#### B-1: Developer Onboarding
- [ ] 20 beta testers successfully onboarded
- [ ] Average time to first API call <5 minutes
- [ ] 90% of beta testers successfully integrate at least 1 calculator
- [ ] Documentation rated 4+/5 by beta testers

**Validation Method:**
- User interviews with beta testers
- Analytics tracking onboarding funnel (signup → first API call)
- NPS survey after 1 week of usage

#### B-2: API Reliability
- [ ] 99%+ uptime during 2-week POC period
- [ ] Zero calculation accuracy issues reported
- [ ] <5 support tickets from 20 beta testers
- [ ] API response time <100ms p95

**Validation Method:**
- Uptime monitoring (UptimeRobot, Pingdom)
- Calculation validation via user feedback
- Support ticket tracking
- Performance monitoring dashboards

#### B-3: Revenue Validation
- [ ] 5 beta testers express willingness to pay ($29-$99/month)
- [ ] Pricing tiers validated with customer interviews
- [ ] Stripe integration working (test mode)
- [ ] Usage tracking accurate (matches Stripe metered billing)

**Validation Method:**
- Pricing survey with beta testers
- Customer interviews on value proposition
- Test Stripe subscription flow end-to-end
- Reconciliation report: our usage logs vs Stripe

### 9.3 POC Go/No-Go Decision Criteria

**Proceed to Full MVP if:**
- ✅ All 5 calculators extracted successfully with 100% parity
- ✅ API response time <100ms p95 achieved
- ✅ At least 15/20 beta testers successfully integrated
- ✅ Zero critical security or accuracy issues
- ✅ At least 3 beta testers commit to paid tier

**Pivot or Re-scope if:**
- ❌ Calculator extraction fails for >2 calculators (consider rewrite approach)
- ❌ API response time >200ms p95 (revisit caching, serverless config)
- ❌ <10 beta testers successfully integrate (fix onboarding friction)
- ❌ Zero willingness to pay (revisit pricing, value proposition)

**Abort Project if:**
- 🛑 Calculator extraction fundamentally impossible without full rewrite
- 🛑 Cannot achieve <300ms response time (performance non-viable)
- 🛑 Security issues cannot be resolved
- 🛑 Zero market interest from beta testers

---

## 10. Strategic Recommendations for Architect

### 10.1 Architecture Priorities (Ranked)

1. **Security First (P0 - Critical)**
   - Never compromise security for convenience (CLAUDE.md principle)
   - TLS 1.3, JWT with strong signing, input validation, audit logging are non-negotiable
   - Security review required for all architectural decisions

2. **Existing Calculator Preservation (P0 - Critical)**
   - Highest risk area: breaking 58+ web calculators
   - Recommend gradual extraction with dual code paths initially
   - Automated regression testing is mandatory

3. **Performance (<100ms) (P0 - Critical)**
   - Make or break for developer experience
   - Aggressive caching strategy essential
   - Serverless cold start optimization required

4. **Dual-Interface Support (P1 - High)**
   - REST and MCP must be first-class citizens
   - Shared calculation engine with thin interface layers
   - Avoid duplicating logic between interfaces

5. **Scalability (P1 - High)**
   - Auto-scaling serverless architecture
   - Stateless design for horizontal scaling
   - Database designed for high write volume (usage tracking)

6. **Developer Experience (P2 - Medium)**
   - Excellent documentation drives conversions
   - Interactive API explorer, code examples, SDKs
   - Clear error messages with actionable guidance

7. **Cost Efficiency (P2 - Medium)**
   - Target <$0.001 per API call
   - Serverless pay-per-use model
   - Aggressive caching reduces compute costs

### 10.2 Critical Architecture Patterns

#### Pattern 1: Shared Calculator Engine (Essential)
```
┌─────────────────────────────────────────────┐
│         Shared Calculator Engine            │
│  (Single source of truth for all logic)     │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  Calculator Interface (Abstract)     │  │
│  │  - execute(params): result           │  │
│  │  - validate(params): errors          │  │
│  │  - getMetadata(): schema             │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │  Loan   │  │   BMI   │  │Currency │     │
│  │  Calc   │  │  Calc   │  │  Calc   │ ... │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
└──────────────┬───────────────┬──────────────┘
               │               │
       ┌───────▼─────┐  ┌──────▼─────┐
       │  REST API   │  │ MCP Server │
       │  Interface  │  │ Interface  │
       └─────────────┘  └────────────┘
```

**Why Essential:**
- Single source of truth prevents calculation divergence
- Easy to add new calculators (implement interface)
- Testable in isolation (no interface coupling)

#### Pattern 2: Async Usage Tracking (Performance Critical)
```
API Request → [Calculate & Respond] <100ms
                      ↓
              [Async: Log to Queue]
                      ↓
              [Background: Batch DB Insert]
                      ↓
              [Analytics: PostgreSQL Queries]
```

**Why Essential:**
- Decouples API response from database writes
- Handles traffic spikes gracefully
- Ensures <100ms response time

#### Pattern 3: Multi-Layer Caching (Cost & Performance)
```
Request → CDN Edge Cache (70% hit rate)
              ↓ (miss)
          Redis Cache (20% hit rate)
              ↓ (miss)
          Calculator Execution (10% cold)
              ↓
          Cache Result (propagate up)
```

**Why Essential:**
- 90% cache hit rate = 10x cost reduction
- Edge caching reduces global latency
- Redis provides fast cache for dynamic content

### 10.3 Key Architectural Decisions to Document

The architect should explicitly address these decisions in architecture.md:

1. **Calculator Extraction Strategy** (Section 7.1 recommendation)
   - How will calculation logic be modularized?
   - What's the migration path from existing to shared logic?
   - How to validate parity between old and new?

2. **Caching Strategy** (Section 7.2 recommendation)
   - Which calculators are cacheable? (deterministic vs time-sensitive)
   - What are the TTL values?
   - How to handle cache invalidation?

3. **MCP Server Deployment** (Section 7.3 recommendation)
   - Embedded or standalone MCP server?
   - How to share code between REST and MCP?
   - What's the tool definition structure?

4. **Authentication Architecture** (Section 7.4 recommendation)
   - API key + JWT flow details
   - Token expiration and refresh strategy
   - Future: OAuth2 for enterprise features

5. **Usage Tracking** (Section 7.5 recommendation)
   - Message queue + batch insert pattern
   - How to ensure billing accuracy?
   - Reconciliation with Stripe metered billing

### 10.4 Technical Validation Checkpoints

Before finalizing architecture, validate these assumptions with developer:

**Checkpoint 1: Calculator Logic Extractability**
- [ ] Developer reviews 5 POC calculators for extraction feasibility
- [ ] Identifies any DOM coupling or hidden dependencies
- [ ] Confirms extraction approach (gradual vs rewrite)

**Checkpoint 2: Performance Feasibility**
- [ ] Developer benchmarks serverless cold start times
- [ ] Tests caching hit rates with sample workload
- [ ] Validates <100ms p95 is achievable with current approach

**Checkpoint 3: MCP Integration**
- [ ] Developer confirms MCP protocol understanding
- [ ] Validates tool definition structure with Claude/GPT-4
- [ ] Tests parameter extraction from natural language

**Checkpoint 4: Security Implementation**
- [ ] Developer reviews JWT signing approach (RS256)
- [ ] Validates rate limiting algorithm (token bucket with Redis)
- [ ] Confirms input validation framework (JSON schema)

### 10.5 Open Questions for Architect

These questions should be explicitly answered in the architecture documentation:

1. **Serverless Platform Choice:**
   - Vercel Functions vs AWS Lambda?
   - What are the cold start implications?
   - How to handle connection pooling for PostgreSQL?

2. **Database Partitioning Strategy:**
   - How to partition `api_calls` table for performance?
   - Time-based partitioning (monthly)?
   - When to archive old data?

3. **Error Handling Strategy:**
   - How to handle external service failures (Stripe, currency API)?
   - Circuit breaker pattern implementation?
   - Fallback strategies for each dependency?

4. **Monitoring and Observability:**
   - What metrics to track? (response time, error rate, cache hit ratio)
   - Which monitoring tools? (DataDog, New Relic, CloudWatch)
   - How to aggregate logs across serverless functions?

5. **Versioning Strategy:**
   - API versioning approach (/v1, /v2 or header-based)?
   - How to support multiple calculator versions?
   - Deprecation policy for old API versions?

---

## 11. Handoff to Architect

### 11.1 Key Insights Summary

**Critical Finding 1: Dual-Interface is Core Architecture Driver**
The requirement for both REST API and MCP server is not just a feature - it fundamentally shapes the architecture. The design must treat both interfaces as first-class citizens with a shared calculation engine.

**Critical Finding 2: Calculator Extraction is Highest Risk**
Successfully extracting logic from 58+ web calculators without breaking existing functionality is the most critical architectural challenge. Recommend gradual extraction with extensive regression testing.

**Critical Finding 3: Performance Budget is Tight**
<100ms p95 response time requires aggressive caching, serverless optimization, and async usage tracking. Every millisecond counts in the architecture design.

**Critical Finding 4: Security is Non-Negotiable**
Following CLAUDE.md principles, security features (TLS 1.3, JWT, input validation, rate limiting) cannot be compromised for convenience. Security review required for all decisions.

### 11.2 Recommended Architecture Focus Areas

**Phase 1 (POC) - Must Have:**
1. Shared calculator engine with abstract interface
2. REST API with 5 endpoints (loan, percentage, BMI, currency, compound interest)
3. JWT authentication with API key flow
4. Redis caching for performance
5. Async usage tracking (message queue + batch insert)

**Phase 2 (MVP) - Should Have:**
1. MCP server integration with tool definitions
2. Rate limiting per tier (token bucket algorithm)
3. Stripe billing integration
4. Developer portal and documentation
5. Multi-region deployment for availability

**Phase 3 (Scale) - Nice to Have:**
1. GraphQL interface
2. Batch processing endpoints
3. Webhook callbacks
4. Custom calculator builder
5. White-label options for enterprise

### 11.3 Files and Resources for Architect

**Input Documents:**
- `/Users/jamiewatters/DevProjects/freecalchub/FCH-API-PRD.md` - Complete PRD
- `/Users/jamiewatters/DevProjects/freecalchub/requirements-analysis.md` - This document
- `/Users/jamiewatters/DevProjects/freecalchub/templates/architecture-template.md` - Architecture template to populate
- `/Users/jamiewatters/DevProjects/freecalchub/CLAUDE.md` - Critical development principles

**Context Files:**
- `/Users/jamiewatters/DevProjects/freecalchub/agent-context.md` - Mission context
- `/Users/jamiewatters/DevProjects/freecalchub/handoff-notes.md` - Handoff instructions

**Existing Calculators (for extraction analysis):**
- Located in web root (need developer to identify exact paths)
- 5 POC calculators: loan, percentage, BMI, currency, compound interest
- JavaScript files contain calculation logic to be extracted

### 11.4 Next Steps for Architect

1. **Review this requirements analysis thoroughly**
   - Understand architectural characteristics and constraints
   - Review risk assessment and mitigation strategies
   - Note critical decisions required

2. **Analyze existing calculator code**
   - Collaborate with developer to examine 5 POC calculators
   - Validate extraction feasibility
   - Identify any architectural blockers

3. **Design system architecture**
   - Use `/templates/architecture-template.md` as structure
   - Address all critical decisions from Section 7
   - Create diagrams for system, data, and deployment architecture

4. **Technical validation with developer**
   - Review architecture design for implementation feasibility
   - Validate performance assumptions (cold start, caching, response time)
   - Confirm security approach

5. **Create comprehensive architecture.md**
   - Populate template with detailed architecture design
   - Include all diagrams, decisions, and rationale
   - Document trade-offs and future considerations

### 11.5 Success Criteria for Architecture Phase

Architecture phase is complete when:
- [ ] `architecture.md` fully documented using template structure
- [ ] All critical decisions from Section 7 explicitly addressed
- [ ] System architecture diagrams created (context, deployment, data flow)
- [ ] Developer validates technical feasibility of design
- [ ] Security approach reviewed and approved
- [ ] Performance targets validated as achievable
- [ ] Risk mitigation strategies documented for all high/critical risks

---

## 12. Appendices

### Appendix A: Architectural Characteristics Reference

**Scalability:**
- Horizontal scaling via serverless auto-scaling
- Stateless design (no server affinity)
- Database connection pooling and read replicas
- Target: 100 calls/month → 100,000+ calls/month seamlessly

**Performance:**
- <100ms p95 response time
- <10ms authentication
- <30ms calculation
- <20ms database logging (async)
- 70%+ cache hit rate

**Availability:**
- 99.9% uptime SLA (43 min downtime/month max)
- Multi-region deployment with failover
- Health checks every 30 seconds
- Automatic recovery <5 minutes

**Security:**
- TLS 1.3 encryption in transit
- JWT with RS256 signing
- Input validation (JSON schema)
- Rate limiting (token bucket)
- Audit logging for all API calls
- GDPR compliance (no PII storage without consent)

**Maintainability:**
- Modular calculator engine (easy to extend)
- 80%+ code coverage
- Comprehensive documentation
- CI/CD for rapid deployment

### Appendix B: User Persona Summary

**Developer Dave:**
- Needs: Simple integration, reliability, predictable costs
- Success: <5 min first API call, >99.9% uptime, <$50/month cost

**AI Agent Alice:**
- Needs: Accurate calculations, natural language integration, LLM-friendly errors
- Success: 100% calculation accuracy, >95% parameter extraction, seamless MCP integration

**Enterprise Emma:**
- Needs: SLA guarantees, custom calculators, compliance, dedicated support
- Success: 99.9% SLA compliance, custom calculators in <2 weeks, SOC 2 compliance

**Existing Web Users:**
- Needs: Zero disruption, same performance
- Success: 100% functionality preservation, no performance degradation

### Appendix C: Technology Stack Recommendations

**Backend:**
- Runtime: Node.js 20+ with TypeScript
- Framework: Fastify (performance) or Express (familiarity)
- Serverless: Vercel Functions (primary), AWS Lambda (alternative)

**Database:**
- Primary: PostgreSQL (usage tracking, user data)
- Cache: Redis (response cache, rate limiting)
- Message Queue: AWS SQS or Redis Streams (async usage tracking)

**API:**
- REST: OpenAPI 3.0 specification
- MCP: Model Context Protocol for LLM integration
- Future: GraphQL (Phase 3)

**Hosting:**
- Serverless: Vercel or AWS Lambda
- CDN: CloudFlare (edge caching, DDoS protection)
- Database: Supabase (managed PostgreSQL) or AWS RDS

**Monitoring:**
- APM: DataDog or New Relic
- Logging: CloudWatch or Logtail
- Uptime: UptimeRobot or Pingdom
- Error Tracking: Sentry

**External Services:**
- Billing: Stripe (subscription + metered billing)
- Currency Data: ExchangeRate-API
- Authentication: Custom JWT (MVP), Auth0 (enterprise)

### Appendix D: Glossary

- **MCP (Model Context Protocol):** Protocol for LLMs to call external tools/functions
- **JWT (JSON Web Token):** Token-based authentication standard
- **Serverless:** Cloud execution model where infrastructure auto-scales to zero
- **p95 Response Time:** 95th percentile response time (95% of requests faster)
- **Rate Limiting:** Restricting API calls per time period to prevent abuse
- **Deterministic Calculation:** Same input always produces same output (cacheable)
- **Metered Billing:** Billing based on actual usage (API calls) rather than flat fee
- **Edge Caching:** Caching content at CDN edge locations near users

### Appendix E: References

**Architecture Patterns:**
- [Serverless Architecture Patterns](https://www.serverless.com/patterns/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

**Technology Documentation:**
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Stripe Metered Billing](https://stripe.com/docs/billing/subscriptions/metered-billing)
- [Vercel Functions](https://vercel.com/docs/functions)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

**Best Practices:**
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Serverless Performance](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-1/)

---

**End of Requirements Analysis**

*This document provides comprehensive requirements synthesis to guide the architecture design. All findings, decisions, and recommendations are based on analysis of FCH-API-PRD.md and strategic product requirements.*

*Next Agent: @architect - Please read this document thoroughly before designing the system architecture. Use the architecture template to document your design decisions.*
