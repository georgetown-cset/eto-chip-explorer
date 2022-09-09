import React from "react"
import renderer from "react-test-renderer"

import ProcessDetail from "../process_detail"

const descriptions = [
  {"slug": "N59", "body": "Some text about N59"},
  {"slug": "N35", "body": "Some text about N35"},
]

describe("Process detail", () => {
  it("renders correctly", () => {
    const tree = renderer
      .create(<ProcessDetail selectedNode="N35" descriptions={descriptions}/>)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
