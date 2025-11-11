import { NextResponse } from 'next/server';
import type { VapiAssistant } from '@/types';

export async function GET() {
  try {
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assistants: ${response.statusText}`);
    }

    const assistants: VapiAssistant[] = await response.json();

    return NextResponse.json({
      success: true,
      assistants,
      count: assistants.length,
    });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assistants',
      },
      { status: 500 }
    );
  }
}
