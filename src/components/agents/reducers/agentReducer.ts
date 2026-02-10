type ActionAgent =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "UPDATE_TOOL"; tool: string; value: boolean }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET_FORM" };

type AgentState = {
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

export const initialStateAgent: AgentState = {
  values: {
    agentName: "",
    description: "",
    callType: "",
    language: "",
    voice: "",
    prompt: "",
    model: "",
    latency: 0.5,
    speed: 100,
    callScript: "",
    serviceDescription: "",
    attachments: [],
    tools: {
      allowHangUp: true,
      allowCallback: false,
      liveTransfer: false,
    },
  },
  errors: {},
};

export function agentReducer(
  state: AgentState,
  action: ActionAgent,
): AgentState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        // Clear the error for this field as the user types
        errors: { ...state.errors, [action.field]: "" },
      };
    case "UPDATE_TOOL":
      return {
        ...state,
        values: {
          ...state.values,
          tools: { ...state.values.tools, [action.tool]: action.value },
        },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET_FORM":
      return initialStateAgent;
    default:
      return state;
  }
}
