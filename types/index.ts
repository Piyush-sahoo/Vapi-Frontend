export interface VapiAssistant {
  id: string;
  name: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  model?: {
    model: string;
    provider?: string;
  };
  voice?: {
    voiceId: string;
    provider: string;
  };
  firstMessage?: string;
}

export interface CallResult {
  number: string;
  callId?: string;
  status?: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended' | 'failed' | 'scheduled';
  error?: string;
  timestamp: string;
  scheduledAt?: string; // ISO timestamp when call is scheduled for
}

export interface SchedulePlan {
  earliestAt: string; // ISO 8601 timestamp in UTC
}

export interface MakeCallsRequest {
  assistantId: string;
  phoneNumbers: string[];
  delay?: number; // milliseconds between calls (for immediate calls)
  scheduleFrom?: string; // ISO timestamp to start scheduling from (optional)
  useScheduling?: boolean; // Whether to use scheduling feature
}

export interface MakeCallsResponse {
  results: CallResult[];
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  scheduledCalls?: number;
}

export interface VapiCallResponse {
  id: string;
  assistantId: string;
  phoneNumberId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  cost: number;
  customer: {
    number: string;
    numberE164CheckEnabled: boolean;
  };
  status: string;
  phoneCallProvider?: string;
  phoneCallProviderId?: string;
  phoneCallTransport?: string;
  schedulePlan?: SchedulePlan;
}
