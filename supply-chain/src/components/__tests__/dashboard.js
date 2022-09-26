import React from "react"
import {configure} from '@testing-library/dom'
import {render, screen, fireEvent} from "@testing-library/react"

import Dashboard, {
  FILTER_CHOOSE,
  GradientLegend
} from "../dashboard";
import {FILTER_INPUT, FILTER_CONCENTRATION, FILTER_COUNTRY, FILTER_ORG} from "../../helpers/shared";

// configure({
//   getElementError(message, container) {
//     const error = new Error(
//       [message, container.outerHTML].filter(Boolean).join('\n\n'),
//     )
//     error.name = 'TestingLibraryElementError'
//     return error
//   }
// });

describe("Gradient Legend", () => {
  it("renders empty correctly", () => {
    const {asFragment} = render(<GradientLegend type={FILTER_INPUT} numSelected={2}/>);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText(/[a-z]/).textContent).toEqual("Legend:");
  });

  it("renders with boxes correctly", () => {
    const {asFragment} = render(<GradientLegend type={FILTER_COUNTRY} numSelected={2}/>);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText("countries have", {exact: false})).not.toBeNull();
  });
});

describe("Dashboard", () => {
  it("renders correctly", () => {
    const {asFragment} = render(<Dashboard/>);
    expect(asFragment()).toMatchSnapshot();
  });

  it("changes the filter shown", () => {
    render(<Dashboard/>);
    // Initially, only the top-level dropdown is shown
    expect(screen.queryByText("Highlight by", {exact: false})).not.toBeNull();
    expect(screen.queryByText("Choose supplier countries", {exact: false})).toBeNull();

    // Change top level dropdown's value
    fireEvent.mouseDown(screen.getByText("None"));
    fireEvent.click(screen.getByText("Supplier countries"));

    /// Check that the second dropdown is now shown
    expect(screen.queryByText("Highlight by", {exact: false})).not.toBeNull();
    expect(screen.queryByText("Choose supplier countries", {exact: false})).not.toBeNull();

    // Reset dropdown -- not sure why I need to do this, but without this, the
    // changes persist into the next test.
    fireEvent.mouseDown(screen.getAllByText("Supplier countries")[0]);
    fireEvent.click(screen.getByText("None"));
  });

  it("changes the highlighting shown", () => {
    render(<Dashboard/>);
    console.log(screen.htmlElement);
    // Initially, the nodes are not highlighted
    const inputNode = screen.getByText("Crystal growing furnaces");
    expect(inputNode.parentElement.parentElement.classList).not.toContain("highlighted");
    const stageNode = screen.getByText("Assembly, testing, and packaging (ATP)");
    expect(stageNode.parentElement.classList).not.toContain("highlighted");

    // Change top level dropdown's value
    fireEvent.mouseDown(screen.getByText("None"));
    fireEvent.click(screen.getByText("Market concentration"));

    /// Check that the node is now highlighted correctly
    expect(inputNode.parentElement.parentElement.classList).toContain("highlighted");
    expect(inputNode.parentElement.parentElement.classList).toContain("gradient-100");
    expect(stageNode.parentElement.classList).toContain("unhighlighted");
  });

});
