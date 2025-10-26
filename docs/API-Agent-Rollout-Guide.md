# FreecalcHub API - Agent Rollout Guide

## Purpose
This guide enables AI agents to systematically convert FreecalcHub's 58+ calculators into API endpoints using standardized templates and procedures.

## Prerequisites
- Access to calculator source files in `/[category]/[subcategory]/[calculator-name]/js/`
- API templates in `/api-templates/`
- Vercel Functions or similar serverless environment configured
- Authentication system deployed (API keys)
- Rate limiting infrastructure ready

## Phase 1: Calculator Analysis & Extraction

### Step 1.1: Identify Calculator Logic
```bash
# Find the calculator JavaScript file
ls /[category]/[subcategory]/[calculator-name]/js/*.js

# Example:
ls /finance/loan/loan-calculator/js/loan-calculator.js
```

### Step 1.2: Analyze Calculation Functions
Look for:
- Main calculation functions (usually named `calculate*`)
- Input validation logic
- Helper functions (formatting, rounding)
- Edge case handling
- Result formatting

### Step 1.3: Document Parameters
Create a parameter map:
```javascript
// Input Parameters
{
  principal: "Loan amount in dollars",
  annual_rate: "Annual interest rate as percentage",
  term_months: "Loan term in months",
  extra_payment: "Optional extra monthly payment"
}

// Output Structure
{
  monthly_payment: "Regular monthly payment",
  total_interest: "Total interest over loan term",
  total_paid: "Total amount paid",
  payoff_date: "Loan payoff date",
  amortization_schedule: "Monthly breakdown array"
}
```

## Phase 2: Module Creation

### Step 2.1: Copy Module Template
```bash
cp /api-templates/calculator-module.template.js \
   /lib/calculators/[category]/[calculator-name].js
```

### Step 2.2: Extract Calculation Logic
1. Copy core calculation functions from original JS
2. Remove DOM manipulation code
3. Keep pure calculation logic only
4. Ensure all math operations are preserved

### Step 2.3: Implement Validation
```javascript
validateInput(params) {
  const errors = [];
  
  // Check required fields
  if (!params.principal || params.principal <= 0) {
    errors.push({
      field: 'principal',
      message: 'Principal must be greater than 0'
    });
  }
  
  // Check ranges
  if (params.annual_rate < 0 || params.annual_rate > 100) {
    errors.push({
      field: 'annual_rate',
      message: 'Rate must be between 0 and 100'
    });
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Step 2.4: Test Module Independently
```javascript
// test/calculators/[calculator-name].test.js
const { calculate } = require('@/lib/calculators/[category]/[calculator-name]');

describe('[Calculator Name]', () => {
  test('Basic calculation', () => {
    const result = calculate({
      principal: 100000,
      annual_rate: 5.5,
      term_months: 360
    });
    
    expect(result.monthly_payment).toBeCloseTo(567.79, 2);
  });
});
```

## Phase 3: API Endpoint Creation

### Step 3.1: Copy Endpoint Template
```bash
cp /api-templates/api-endpoint.template.js \
   /api/calculators/[category]/[calculator-name].js
```

### Step 3.2: Configure Endpoint
1. Import calculator module
2. Set rate limits per tier
3. Configure validation schema
4. Add specific error handling

### Step 3.3: Deploy Endpoint
```bash
# For Vercel
vercel dev

# Test locally
curl -X POST http://localhost:3000/api/v1/[category]/[calculator-name] \
  -H "Authorization: Bearer test-key" \
  -H "Content-Type: application/json" \
  -d '{"principal": 100000, "annual_rate": 5.5, "term_months": 360}'
```

## Phase 4: MCP Tool Definition

### Step 4.1: Create Tool Definition
```bash
cp /api-templates/mcp-tool.template.json \
   /mcp-tools/calculate_[calculator_name].json
```

### Step 4.2: Configure for LLM Usage
- Write clear, detailed descriptions
- Provide multiple examples
- Define all error cases
- Add natural language patterns

### Step 4.3: Test with LLM
```python
# Test MCP tool integration
from mcp_client import MCPClient

client = MCPClient()
result = client.use_tool(
    "calculate_loan",
    {
        "principal": 100000,
        "annual_rate": 5.5,
        "term_months": 360
    }
)
print(result)
```

## Phase 5: Documentation

### Step 5.1: Generate API Documentation
```javascript
// Generate OpenAPI spec
const spec = {
  openapi: "3.0.0",
  info: {
    title: "[Calculator Name] API",
    version: "1.0.0"
  },
  paths: {
    "/api/v1/[category]/[calculator-name]": {
      post: {
        summary: "Calculate [description]",
        requestBody: { /* ... */ },
        responses: { /* ... */ }
      }
    }
  }
};
```

### Step 5.2: Create Usage Examples
```markdown
## [Calculator Name] API

### Basic Usage
```bash
curl -X POST https://api.freecalchub.com/v1/[category]/[calculator-name] \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"param1": value1, "param2": value2}'
```

### Python Example
```python
import requests

response = requests.post(
    "https://api.freecalchub.com/v1/[category]/[calculator-name]",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"param1": value1, "param2": value2}
)
```
```

## Phase 6: Testing & Validation

### Step 6.1: Accuracy Testing
Compare API results with web calculator:
1. Test 10 random input combinations
2. Verify results match exactly
3. Test edge cases (0, negative, very large numbers)
4. Document any discrepancies

### Step 6.2: Performance Testing
```bash
# Load test with Apache Bench
ab -n 1000 -c 10 \
  -H "Authorization: Bearer test-key" \
  -T "application/json" \
  -p test-payload.json \
  https://api.freecalchub.com/v1/[category]/[calculator-name]
```

Target metrics:
- Response time: <100ms p95
- Throughput: >100 req/sec
- Error rate: <0.1%

### Step 6.3: Integration Testing
Test with:
- Different authentication tiers
- Rate limiting boundaries
- Invalid inputs
- Malformed requests

## Phase 7: Deployment

### Step 7.1: Pre-deployment Checklist
- [ ] Module unit tests pass
- [ ] API endpoint tested locally
- [ ] Documentation complete
- [ ] MCP tool definition validated
- [ ] Rate limiting configured
- [ ] Error handling comprehensive
- [ ] Logging implemented

### Step 7.2: Deploy to Production
```bash
# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://api.freecalchub.com/v1/[category]/[calculator-name]/health
```

### Step 7.3: Post-deployment Monitoring
- Check error rates in logs
- Monitor response times
- Track usage patterns
- Gather user feedback

## Automation Script for Agents

```javascript
// automation/convert-calculator.js
async function convertCalculator(category, name) {
  // 1. Extract logic
  const logic = await extractCalculatorLogic(category, name);
  
  // 2. Create module
  const module = await createCalculatorModule(logic);
  
  // 3. Generate tests
  const tests = await generateTests(module);
  
  // 4. Create endpoint
  const endpoint = await createAPIEndpoint(module);
  
  // 5. Generate MCP tool
  const mcpTool = await generateMCPTool(module);
  
  // 6. Deploy
  const result = await deploy(endpoint);
  
  // 7. Validate
  await validateDeployment(result.url);
  
  return {
    success: true,
    url: result.url,
    documentation: result.docs
  };
}

// Run for all calculators
const calculators = await getCalculatorList();
for (const calc of calculators) {
  await convertCalculator(calc.category, calc.name);
}
```

## Success Criteria

### Per Calculator
- [ ] Calculation accuracy: 100% match with web version
- [ ] Response time: <100ms
- [ ] Documentation: Complete with examples
- [ ] Tests: >90% coverage
- [ ] Error handling: All cases covered

### Overall Project
- [ ] 58+ calculators converted
- [ ] Unified API interface
- [ ] Comprehensive documentation
- [ ] MCP tools for all calculators
- [ ] Performance SLA met

## Rollout Schedule

### Week 1: Pilot (5 calculators)
- Loan Calculator ✓
- Percentage Calculator
- BMI Calculator
- Currency Converter
- Compound Interest Calculator

### Week 2-3: Finance Category (20 calculators)
- All mortgage calculators
- All investment calculators
- All retirement calculators
- All tax calculators

### Week 4: Remaining Categories (33 calculators)
- Math calculators
- Health calculators
- Business calculators
- Conversion calculators
- Date/Time calculators
- Lifestyle calculators

## Troubleshooting

### Common Issues

#### Issue: Calculation Mismatch
**Solution**: Check for:
- Rounding differences
- Order of operations
- Floating point precision
- Edge case handling

#### Issue: Performance Degradation
**Solution**: 
- Implement caching for common inputs
- Optimize calculation algorithms
- Use memoization for expensive operations

#### Issue: Rate Limiting Errors
**Solution**:
- Verify tier configuration
- Check Redis connection
- Validate API key permissions

## Support Resources

- **Templates**: `/api-templates/`
- **Documentation**: `/docs/api/`
- **Tests**: `/test/api/`
- **Examples**: `/examples/api/`
- **Support**: api-support@freecalchub.com

## Conclusion

This guide enables systematic, consistent conversion of all FreecalcHub calculators to API endpoints. By following these procedures, agents can:

1. **Maintain consistency** across all API endpoints
2. **Ensure quality** through standardized testing
3. **Enable scalability** with template-based approach
4. **Accelerate development** through automation
5. **Guarantee compatibility** with LLMs via MCP

The result will be a comprehensive, professional-grade API platform ready for monetization and integration with AI systems.