type StartTestCallState = {
  values: {
    testFirstName: string;
    testLastName: string;
    testGender: string;
    testPhone: string;
  };
  errors: Record<string, string>;
};
type ActionStartTestCall =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET_FORM" };

export const initialStartTestCall: StartTestCallState = {
  values: {
    testFirstName: "",
    testLastName: "",
    testGender: "",
    testPhone: "",
  },
  errors: {},
};
/**
 * StartTestCallState and startTestCallReducer are used to manage the state of the test call form, which includes fields for test call details and error handling.
 */
export function startTestCallReducer(
  state: StartTestCallState,
  action: ActionStartTestCall,
): StartTestCallState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        // Clear the error for this field as the user types
        errors: { ...state.errors, [action.field]: "" },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET_FORM":
      return initialStartTestCall;
    default:
      return state;
  }
}
