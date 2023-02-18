import React from "react"
import {render, screen} from "@testing-library/react"

import ProcessDetail from "../process_detail"

const descriptions = [
  {fields: {slug: "N59"}, "body": "Some text about N59"},
  {fields: {slug: "N35"}, "body": "Some text about N35"},
]

describe("Process detail", () => {
  it("renders correctly", () => {
    const {asFragment} = render(<ProcessDetail selectedNode="N35" descriptions={descriptions}/>);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText("N35", {exact: false})).not.toBeNull();
    expect(screen.queryByText("N59", {exact: false})).toBeNull();
  })
})
