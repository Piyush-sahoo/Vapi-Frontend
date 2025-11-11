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
  status?: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended' | 'failed';
  error?: string;
  timestamp: string;
}

export interface MakeCallsRequest {
  assistantId: string;
  phoneNumbers: string[];
  delay?: number; // milliseconds between calls
}

export interface MakeCallsResponse {
  results: CallResult[];
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
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
  phoneCallProvider: string;
  phoneCallProviderId: string;
  phoneCallTransport: string;
}
