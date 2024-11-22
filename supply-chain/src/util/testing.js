import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export function userEventSetup(jsx, options) {
  return {
    user: userEvent.setup(options),
    ...render(jsx),
  }
}
