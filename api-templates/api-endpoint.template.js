/**
 * FreecalcHub API - Endpoint Template
 * 
 * INSTRUCTIONS FOR AGENTS:
 * 1. Copy this template for each API endpoint
 * 2. Replace [CALCULATOR_NAME] placeholders
 * 3. Import the corresponding calculator module
 * 4. Configure rate limiting based on tier
 * 5. Add to main API router
 * 
 * File location: /api/calculators/[category]/[calculator-name].js
 */

// Import dependencies
import { NextResponse } from 'next/server';
import { [CALCULATOR_NAME] } from '@/lib/calculators/[category]/[calculator-name]';
import { authenticate } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { trackUsage } from '@/lib/analytics';
import { validateRequest } from '@/lib/validation';
import { logger } from '@/lib/logger';

/**
 * API Endpoint: /api/v1/[category]/[calculator-name]
 * Method: POST
 * Description: [Brief description of calculator functionality]
 */

// Rate limiting configuration by tier
const RATE_LIMITS = {
  free: { requests: 100, window: '1h' },
  developer: { requests: 1000, window: '1h' },
  professional: { requests: 10000, window: '1h' },
  enterprise: { requests: -1, window: '1h' } // Unlimited
};

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Main POST handler
 */
export async function POST(request) {
  const startTime = Date.now();
  let userId = null;
  let tier = 'free';
  
  try {
    // Step 1: Authentication
    const authResult = await authenticate(request);
    if (!authResult.valid) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: authResult.message,
          code: 'AUTH_FAILED'
        },
        { status: 401 }
      );
    }
    
    userId = authResult.userId;
    tier = authResult.tier;
    
    // Step 2: Rate Limiting
    const rateLimitResult = await rateLimit(userId, RATE_LIMITS[tier]);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Try again in ${rateLimitResult.retryAfter} seconds`,
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit,
            'X-RateLimit-Remaining': rateLimitResult.remaining,
            'X-RateLimit-Reset': rateLimitResult.reset
          }
        }
      );
    }
    
    // Step 3: Parse and Validate Request Body
    const body = await request.json();
    
    // Validate against schema
    const validationResult = validateRequest(body, [CALCULATOR_NAME].ValidationSchema);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid input parameters',
          code: 'VALIDATION_ERROR',
          details: validationResult.errors
        },
        { status: 400 }
      );
    }
    
    // Step 4: Perform Calculation
    const calculator = new [CALCULATOR_NAME]({
      precision: body.precision || 2,
      currency: body.currency || 'USD'
    });
    
    const result = calculator.calculate(body);
    
    // Step 5: Track Usage (async, don't wait)
    trackUsage({
      userId,
      tier,
      endpoint: '/api/v1/[category]/[calculator-name]',
      timestamp: new Date().toISOString(),
      response_time: Date.now() - startTime,
      success: true
    }).catch(err => logger.error('Usage tracking failed:', err));
    
    // Step 6: Return Success Response
    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          calculator: '[calculator-name]',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          response_time_ms: Date.now() - startTime
        }
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining,
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'Cache-Control': 'private, max-age=60'
        }
      }
    );
    
  } catch (error) {
    // Log error
    logger.error('API Error:', {
      endpoint: '/api/v1/[category]/[calculator-name]',
      userId,
      error: error.message,
      stack: error.stack,
      body: request.body
    });
    
    // Track failed usage
    if (userId) {
      trackUsage({
        userId,
        tier,
        endpoint: '/api/v1/[category]/[calculator-name]',
        timestamp: new Date().toISOString(),
        response_time: Date.now() - startTime,
        success: false,
        error: error.message
      }).catch(err => logger.error('Usage tracking failed:', err));
    }
    
    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred processing your request',
        code: 'INTERNAL_ERROR',
        request_id: request.headers.get('x-request-id')
      },
      { status: 500 }
    );
  }
}

/**
 * Example request:
 * 
 * POST /api/v1/[category]/[calculator-name]
 * Headers:
 *   Authorization: Bearer YOUR_API_KEY
 *   Content-Type: application/json
 * 
 * Body:
 * {
 *   "param1": value1,
 *   "param2": value2,
 *   "precision": 2,
 *   "currency": "USD"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "result": 12345.67,
 *     "details": { ... }
 *   },
 *   "metadata": {
 *     "calculator": "[calculator-name]",
 *     "version": "1.0.0",
 *     "timestamp": "2025-01-21T10:00:00Z",
 *     "response_time_ms": 45
 *   }
 * }
 */