import { NextRequest, NextResponse } from 'next/server';
import type { MakeCallsRequest, MakeCallsResponse, CallResult, VapiCallResponse } from '@/types';

// Helper function to wait/delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to make a single call to Vapi
async function makeSingleCall(
  assistantId: string,
  phoneNumber: string,
  phoneNumberId: string
): Promise<CallResult> {
  try {
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId,
        customer: {
          number: phoneNumber,
          numberE164CheckEnabled: false,
        },
        phoneNumberId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }

    const data: VapiCallResponse = await response.json();

    return {
      number: phoneNumber,
      callId: data.id,
      status: data.status as any,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      number: phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
      timestamp: new Date().toISOString(),
    };
  }
}

// Main POST handler - RECURSIVE CALLING
export async function POST(request: NextRequest) {
  try {
    const body: MakeCallsRequest = await request.json();
    const { assistantId, phoneNumbers, delay = 2000 } = body;

    // Validation
    if (!assistantId || !phoneNumbers || phoneNumbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: assistantId and phoneNumbers are required',
        },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: VAPI_PHONE_NUMBER_ID not set',
        },
        { status: 500 }
      );
    }

    console.log(`[BULK CALLING] Starting calls for ${phoneNumbers.length} numbers...`);

    const results: CallResult[] = [];

    // RECURSIVE LOOP - Make calls one by one with delay
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i].trim();

      if (!phoneNumber) {
        console.log(`[SKIP] Empty phone number at index ${i}`);
        continue;
      }

      console.log(`[${i + 1}/${phoneNumbers.length}] Calling ${phoneNumber}...`);

      // Make the call
      const result = await makeSingleCall(assistantId, phoneNumber, phoneNumberId);
      results.push(result);

      console.log(`[${i + 1}/${phoneNumbers.length}] Result:`, result.callId ? `✅ ${result.callId}` : `❌ ${result.error}`);

      // Wait before next call (except for the last one)
      if (i < phoneNumbers.length - 1) {
        console.log(`[DELAY] Waiting ${delay}ms before next call...`);
        await sleep(delay);
      }
    }

    // Calculate statistics
    const successfulCalls = results.filter(r => r.callId).length;
    const failedCalls = results.filter(r => r.error).length;

    const response: MakeCallsResponse = {
      results,
      totalCalls: results.length,
      successfulCalls,
      failedCalls,
    };

    console.log(`[COMPLETE] Total: ${results.length}, Success: ${successfulCalls}, Failed: ${failedCalls}`);

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('[ERROR] Bulk calling failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process calls',
      },
      { status: 500 }
    );
  }
}
