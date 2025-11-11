import { NextRequest, NextResponse } from 'next/server';
import type { MakeCallsRequest, MakeCallsResponse, CallResult, VapiCallResponse } from '@/types';

// Helper function to wait/delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to make a single call to Vapi (immediate or scheduled)
async function makeSingleCall(
  assistantId: string,
  phoneNumber: string,
  phoneNumberId: string,
  scheduledAt?: string // ISO 8601 timestamp in UTC (optional)
): Promise<CallResult> {
  try {
    const requestBody: any = {
      assistantId,
      customer: {
        number: phoneNumber,
        numberE164CheckEnabled: false,
      },
      phoneNumberId,
    };

    // Add schedulePlan if scheduledAt is provided
    if (scheduledAt) {
      requestBody.schedulePlan = {
        earliestAt: scheduledAt,
      };
    }

    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
      scheduledAt: data.schedulePlan?.earliestAt,
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

// Main POST handler - RECURSIVE CALLING (Immediate or Scheduled)
export async function POST(request: NextRequest) {
  try {
    const body: MakeCallsRequest = await request.json();
    const { assistantId, phoneNumbers, delay = 2000, scheduleFrom, useScheduling = false } = body;

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

    const callType = useScheduling ? 'SCHEDULED CALLS' : 'IMMEDIATE CALLS';
    console.log(`[${callType}] Starting for ${phoneNumbers.length} numbers...`);

    const results: CallResult[] = [];
    let scheduledCalls = 0;

    // Calculate base scheduled time (if scheduling is enabled)
    let baseScheduleTime = scheduleFrom ? new Date(scheduleFrom) : new Date();

    // RECURSIVE LOOP - Make calls one by one with delay or scheduling
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i].trim();

      if (!phoneNumber) {
        console.log(`[SKIP] Empty phone number at index ${i}`);
        continue;
      }

      let scheduledAt: string | undefined;

      // If scheduling is enabled, calculate schedule time for this call
      if (useScheduling) {
        // For bulk calls: schedule with 3-second intervals
        const scheduleTime = new Date(baseScheduleTime.getTime() + (i * 3000)); // 3 seconds apart
        scheduledAt = scheduleTime.toISOString();
        console.log(`[${i + 1}/${phoneNumbers.length}] Scheduling ${phoneNumber} for ${scheduleTime.toLocaleString()}...`);
      } else {
        console.log(`[${i + 1}/${phoneNumbers.length}] Calling ${phoneNumber} immediately...`);
      }

      // Make the call (immediate or scheduled)
      const result = await makeSingleCall(assistantId, phoneNumber, phoneNumberId, scheduledAt);
      results.push(result);

      if (result.status === 'scheduled') {
        scheduledCalls++;
      }

      console.log(
        `[${i + 1}/${phoneNumbers.length}] Result:`,
        result.callId ? `✅ ${result.callId} (${result.status})` : `❌ ${result.error}`
      );

      // For immediate calls, wait before next call (except for the last one)
      if (!useScheduling && i < phoneNumbers.length - 1) {
        console.log(`[DELAY] Waiting ${delay}ms before next call...`);
        await sleep(delay);
      }
    }

    // Calculate statistics
    const successfulCalls = results.filter(r => r.callId && !r.error).length;
    const failedCalls = results.filter(r => r.error).length;

    const response: MakeCallsResponse = {
      results,
      totalCalls: results.length,
      successfulCalls,
      failedCalls,
      scheduledCalls: useScheduling ? scheduledCalls : undefined,
    };

    console.log(
      `[COMPLETE] Total: ${results.length}, Success: ${successfulCalls}, Failed: ${failedCalls}` +
      (useScheduling ? `, Scheduled: ${scheduledCalls}` : '')
    );

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
