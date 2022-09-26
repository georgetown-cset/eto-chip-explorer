import React from "react"
import {render, screen, fireEvent} from "@testing-library/react"

import Dashboard, {
  FILTER_CHOOSE,
  GradientLegend
} from "../dashboard";
import {FILTER_INPUT, FILTER_CONCENTRATION, FILTER_COUNTRY, FILTER_ORG} from "../../helpers/shared";

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
  })});
