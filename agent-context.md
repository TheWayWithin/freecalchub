# Agent Context Document

## Mission Overview
**Mission Code**: ARCHITECTURE
**Started**: 2025-10-03
**Current Phase**: Phase 2 - Architecture Design (COMPLETE)
**Overall Status**: IN_PROGRESS → Phase 3 Ready

## Mission Objectives
Primary objectives from mission briefing:
- [x] Analyze system requirements and architectural characteristics
- [x] Design comprehensive system architecture for FreecalcHub API platform
- [ ] Validate technical feasibility against implementation realities (Next: Developer)
- [x] Generate complete architecture.md documentation
- [ ] Review and approve architecture documentation (Next: Documenter)

## Critical Constraints
Important limitations and requirements to maintain:
- Must support dual-interface: REST API + MCP Server for LLM integration
- Serverless architecture required (AWS Lambda / Vercel Functions)
- Extract and modularize existing 58+ calculator logic without breaking current web UI
- API response time target: <100ms p95
- Security-first development: Never compromise security for convenience
- Phase 1 POC: Focus on 5 core calculators (loan, percentage, BMI, currency, compound interest)

## Accumulated Findings

### Phase 1: Requirements Analysis
**Agent**: @strategist
**Status**: COMPLETE
**Duration**: 45 minutes

### Phase 2: Architecture Design
**Agent**: @architect
**Status**: COMPLETE
**Duration**: 2 hours
**Key Decisions**:
1. **Dual-Interface Architecture**: REST API + MCP server must both be first-class citizens with shared calculator engine
2. **Calculator Extraction Strategy**: Gradual extraction recommended (dual code paths initially, legacy + shared library)
3. **Performance Budget Allocation**: <100ms p95 = Auth (10ms) + Calc (30ms) + DB (20ms async) + Network (30ms)
4. **Caching Strategy**: Multi-layer caching (CDN 70% hit → Redis 20% hit → Compute 10% cold)
5. **Usage Tracking Pattern**: Async message queue → batch DB insert (decouples from API response)

**Critical Information**:
- **Highest Risk**: Calculator logic extraction from 58+ web calculators (must not break existing functionality)
- **Core Constraint**: Security is non-negotiable (TLS 1.3, JWT RS256, input validation, rate limiting)
- **Performance Bottleneck**: Serverless cold starts can add 100-500ms (needs optimization)
- **Key Differentiator**: MCP integration for LLM market positioning

**Outputs Created**:
- `/Users/jamiewatters/DevProjects/freecalchub/requirements-analysis.md` - Comprehensive requirements synthesis
  - Architectural characteristics matrix with priorities
  - System boundaries and external interfaces defined
  - Functional and non-functional requirements detailed
  - Stakeholder concerns analysis (Developer Dave, AI Agent Alice, Enterprise Emma)
  - 5 critical architectural decisions identified and analyzed
  - Risk assessment with mitigation strategies
  - Phase 1 POC success criteria established

**Key Decisions**:
1. **Calculator Extraction**: Gradual extraction with dual code paths (VALIDATED as feasible)
2. **Caching Strategy**: Calculator-specific TTL with multi-layer approach (CDN 70% + Redis 20%)
3. **MCP Deployment**: Embedded MCP server sharing codebase with REST API
4. **Authentication**: JWT with refresh tokens (RS256 signing)
5. **Usage Tracking**: Hybrid with message queue (SQS → batch PostgreSQL insert)

**Critical Validation**:
- ✅ Examined existing calculator code - extraction is HIGHLY FEASIBLE
- ✅ Performance budget <100ms p95 is ACHIEVABLE (62ms estimated, 38ms buffer)
- ✅ Vercel Functions optimal choice (cold start <100ms)
- ✅ API template already exists at `/api-templates/calculator-module.template.js`

**Outputs Created**:
- `/Users/jamiewatters/DevProjects/freecalchub/architecture.md` - Complete system architecture (12,000+ lines)
  - System architecture diagrams (context, deployment, data flow, components)
  - Infrastructure design (Vercel + Supabase + Redis + SQS + CloudFlare)
  - Shared calculator engine pattern (dual-interface: REST + MCP)
  - Multi-layer caching strategy with TTL configuration
  - Async usage tracking pattern (fire-and-forget to SQS)
  - Security architecture (JWT RS256, TLS 1.3, rate limiting, audit logging)
  - Database schema with monthly partitioning strategy
  - All 5 critical decisions addressed with detailed rationale
  - Deployment and scaling plans (Phase 1 → Phase 2 → Phase 3)
  - Technology selection justification

## Technical Context

### Input Documents
- **FCH-API-PRD.md**: Comprehensive product requirements document
  - Vision: Transform 58+ static calculators into API-accessible services
  - Target markets: Developers, AI agents/LLMs, enterprises
  - Monetization: Tiered pricing ($0-$99/month + enterprise custom)
  - Revenue projections: $42K Year 1 → $1.14M Year 3

### Architecture Decisions

**D-1: Calculator Logic Extraction Strategy**
- **Decision**: Gradual extraction with dual code paths (Option A)
- **Rationale**: Minimizes risk to existing 58+ web calculators, allows incremental validation
- **Pattern**: Legacy code + shared library in parallel, fallback mechanism for safety
- **Validation**: CONFIRMED feasible after examining existing calculator code structure

**D-2: Caching Strategy**
- **Decision**: Calculator-specific TTL with multi-layer approach (Option B)
- **Rationale**: Balance performance (<100ms) with data freshness requirements
- **Implementation**: CDN Edge (70% hit) → Redis (20% hit) → Compute (10% cold)
- **TTL**: Deterministic calculators 24hr, currency converter 1hr

**D-3: MCP Server Deployment Model**
- **Decision**: Embedded MCP server sharing codebase with REST API (Option B)
- **Rationale**: Lower latency, simpler deployment, code reuse, cost efficient
- **Pattern**: Single deployment, router layer detects protocol, shared calculator engine

**D-4: Authentication Architecture**
- **Decision**: JWT with refresh tokens, RS256 signing (Option B)
- **Rationale**: Industry standard, stateless, fine-grained control, OAuth2 migration path
- **Flow**: API key → JWT access token (1hr) → Refresh token (30d)

**D-5: Database Architecture for Usage Tracking**
- **Decision**: Hybrid with message queue (Option C) - SQS → batch PostgreSQL
- **Rationale**: Decouples API response from DB writes, ensures <100ms p95, handles spikes
- **Pattern**: Fire-and-forget to SQS → background worker → batch insert (1000 records)

### Technology Stack
**FINALIZED** (with rationale):
- **Runtime**: Node.js 20+ LTS with TypeScript 5+ (strict mode)
- **Framework**: Express.js 4.18+ (battle-tested, huge ecosystem)
- **Hosting**: Vercel Functions (primary) - <100ms cold start, seamless GitHub integration
- **Database**: Supabase PostgreSQL 15+ (10GB → 100GB scaling, connection pooling)
- **Cache**: Upstash Redis (1GB → 10GB scaling, serverless-compatible, <5ms latency)
- **Message Queue**: AWS SQS (standard queue, 4-day retention, reliable)
- **CDN**: CloudFlare (edge caching, DDoS protection, TLS 1.3)
- **Authentication**: JWT RS256 (4096-bit RSA keys) with refresh tokens
- **Validation**: Joi for schema validation
- **Testing**: Jest for unit/integration tests

### Implementation Patterns

**Pattern 1: Shared Calculator Engine** (CRITICAL)
```typescript
abstract class BaseCalculator {
  abstract validate(params: any): ValidationResult;
  abstract calculate(params: any): CalculationResult;
  execute(params: any): CalculationResult {
    const validation = this.validate(params);
    if (!validation.valid) throw new ValidationError(validation.errors);
    return this.calculate(params);
  }
}

// REST API and MCP Server both use the same calculator
class LoanCalculator extends BaseCalculator { ... }
```

**Pattern 2: Multi-Layer Caching** (PERFORMANCE)
```
Request → CDN Edge (70% hit) → Redis (20% hit) → Compute (10% cold)
Result: 90% of requests never touch compute
```

**Pattern 3: Async Usage Tracking** (MAINTAINS <100ms)
```
API Response → Fire-and-forget to SQS → Background Worker → Batch DB Insert
Non-blocking: Usage logging does not delay API response
```

**Pattern 4: Gradual Calculator Extraction** (RISK MITIGATION)
```javascript
function calculateLoan() {
  try {
    if (typeof CalculatorEngine !== 'undefined') {
      return CalculatorEngine.loan.execute(params);  // New shared library
    } else {
      return calculateLoanLegacy(params);  // Fallback to existing
    }
  } catch (error) {
    return calculateLoanLegacy(params);  // Safety fallback
  }
}
```

## Known Issues & Blockers

### Active Issues
None currently

### Resolved Issues
None yet

## Dependencies & Integrations

### External Dependencies
- Stripe: Billing and subscription management
- Real-time currency data provider: For currency converter API
- Authentication service: JWT token management

### Internal Dependencies
- Existing calculator logic in 58+ HTML/JavaScript calculators
- Must extract calculation engines without breaking current web UI

## Next Steps Queue
1. ~~**High Priority**: Strategist analysis of requirements and architectural characteristics~~ ✅ COMPLETE
2. ~~**High Priority**: Architect system design with dual REST + MCP interfaces~~ ✅ COMPLETE
3. **High Priority**: Developer validation of technical feasibility and Phase 1 POC implementation
   - Set up infrastructure (Vercel, Supabase, Redis, SQS)
   - Extract 5 POC calculators (loan, percentage, BMI, currency, compound interest)
   - Implement shared calculator engine with dual-interface support
   - Validate performance <100ms p95 at 100 RPS
   - Implement security measures (JWT, rate limiting, TLS 1.3)
4. **Medium Priority**: Documenter review and approval of architecture.md

## Risk Register
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Calculation extraction breaks web UI | Medium | High | Careful modularization, comprehensive testing |
| API scaling challenges | Medium | High | Start serverless, auto-scaling architecture |
| Low adoption rate | Medium | High | Generous free tier, excellent documentation |
| Accuracy issues in calculations | Low | Critical | Extensive testing, version control, audit logs |

## Performance Metrics
Target metrics from PRD:
- Response Time: <100ms p95
- Uptime: 99.9% availability
- API Calls: 10M+ monthly by Year 2
- Conversion Rate: 5% free-to-paid minimum

## Handoff History
None yet - mission just started

---
*This document is continuously updated throughout the mission. Each agent must read this before starting their task and update it with their findings before completing their work.*
