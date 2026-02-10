export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
}
export type AgentState = {
  values: {
    agentName: string;
    description: string;
    callType: string;
    language: string;
    voice: string;
    prompt: string;
    model: string;
    latency: number;
    speed: number;
    callScript: string;
    serviceDescription: string;
    attachments: number[];
    tools: {
      allowHangUp: boolean;
      allowCallback: boolean;
      liveTransfer: boolean;
    };
  };
  errors: Record<string, string>;
};

export type ActionAgent =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "UPDATE_TOOL"; tool: string; value: boolean }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET_FORM" };

export type StartTestCallState = {
  values: {
    testFirstName: string;
    testLastName: string;
    testGender: string;
    testPhone: string;
  };
  errors: Record<string, string>;
};

export type ActionStartTestCall =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET_FORM" };
