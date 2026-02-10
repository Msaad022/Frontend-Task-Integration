type DropdownState = {
  data: any[];
  isLoading: boolean;
  error: string | null;
};
type State = {
  [key: string]: DropdownState;
};
type Action =
  | { type: "FETCH_START"; dropdown: string }
  | { type: "FETCH_SUCCESS"; dropdown: string; payload: any[] }
  | { type: "FETCH_ERROR"; dropdown: string; payload: string };
export const initialState: State = {};
/**
 * dropdownReducer is a reducer function that manages the state of multiple dropdowns in the AgentForm component.
 */
export function dropdownReducer(state: State, action: Action): State {
  const { dropdown } = action;

  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        [dropdown]: {
          ...(state[dropdown] || { data: [] }),
          isLoading: true,
          error: null,
        },
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        [dropdown]: {
          isLoading: false,
          data: action.payload,
          error: null,
        },
      };
    case "FETCH_ERROR":
      return {
        ...state,
        [dropdown]: {
          ...(state[dropdown] || { data: [] }),
          isLoading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
}
