import React from "react"
import {render, screen} from "@testing-library/react"

import ProcessDetail from "../ProcessDetail"

describe("Process detail", () => {
  it("renders correctly", () => {
    const {asFragment} = render(<ProcessDetail description="Some text about N35" />);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText("N35", {exact: false})).not.toBeNull();
    expect(screen.queryByText("N59", {exact: false})).toBeNull();
  })
})
