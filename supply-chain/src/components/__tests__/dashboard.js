import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { userEventSetup } from '../../util/testing';

import Dashboard, {
  GradientLegend
} from "../dashboard";
import {FILTER_INPUT, FILTER_COUNTRY} from "../../helpers/shared";

window.URL.createObjectURL = jest.fn();

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
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = function() {};
    const location = {
      ...window.location,
      search: '',
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });
  })

  it.skip("renders correctly", () => {
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

  it("opens the documentation node", async () => {
    const { user } = userEventSetup(<Dashboard />);

    // Click on an input node to show its documentation
    expect(screen.getAllByText("Crystal growing furnaces").length).toEqual(1);
    await user.click(screen.getByText("Crystal growing furnaces"));
    expect(screen.getAllByText("Crystal growing furnaces").length).toEqual(3);

    // Click on another node inside the documentation panel
    await user.click(screen.getAllByText("Deposition")[1]);
    expect(screen.queryAllByText("Some text about N35")).not.toBeNull();

    // Close the documentation panel
    await user.click(screen.getByText("Clear Highlights"));
    expect(screen.getAllByText("Crystal growing furnaces").length).toEqual(1);
  });

  it("opens a documentation node with variants and subvariants", () => {
    render(<Dashboard/>);
    // Click on a node with subvariants
    fireEvent.click(screen.getByText("Deposition tools"));
    fireEvent.click(screen.getAllByText("Chemical vapor deposition tools")[0]);

    // Show subvariants list
    expect(screen.getAllByText("Atomic layer deposition tools").length).toEqual(5);
  });

  it("opens a stage node", () => {
    render(<Dashboard/>);
    // Click on a stage node title
    fireEvent.click(screen.getByText("Fabrication"));

    // Show stage node text
    expect(screen.getByText("Chart shows share of global fabrication capacity", {exact: false})).not.toBeNull();
  });

  it("changes the highlighting shown", () => {
    render(<Dashboard/>);
    // Initially, the nodes are not highlighted
    const inputNode = screen.getByText("Crystal growing furnaces");
    expect(inputNode.parentElement.parentElement.classList).not.toContain("highlighted");
    const stageNode = screen.getByText("Assembly, testing, and packaging (ATP)");
    expect(stageNode.parentElement.classList).not.toContain("highlighted");

    // Change top level dropdown's value
    fireEvent.mouseDown(screen.getByText("None"));
    fireEvent.click(screen.getByText("Market concentration"));

    // Check that the node is now highlighted correctly
    expect(inputNode.parentElement.parentElement.classList).toContain("highlighted");
    expect(inputNode.parentElement.parentElement.classList).toContain("gradient-100");
    expect(stageNode.parentElement.classList).toContain("not-applicable");
  });

});
