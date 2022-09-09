import React from "react"
import {render, screen} from "@testing-library/react"

import ProcessDetail from "../process_detail"

const descriptions = [
  {"slug": "N59", "body": "Some text about N59"},
  {"slug": "N35", "body": "Some text about N35"},
]

describe("Process detail", () => {
  it("renders correctly", async () => {
    const {asFragment} = render(<ProcessDetail selectedNode="N35" descriptions={descriptions}/>);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText("Some text about N35")).not.toBeNull();
    expect(screen.queryByText("Some text about N59")).toBeNull();
  })
})
