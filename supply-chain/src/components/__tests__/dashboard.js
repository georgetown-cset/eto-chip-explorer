import React from "react"
import {render, screen} from "@testing-library/react"

import Dashboard, {
  FILTER_CHOOSE,
  GradientLegend
} from "../dashboard"
import {FILTER_INPUT, FILTER_CONCENTRATION, FILTER_COUNTRY, FILTER_ORG} from "../helpers/shared";

describe("Gradient Legend", () => {
  it("renders empty correctly", () => {
    const {asFragment} = render(<GradientLegend type={FILTER_INPUT} numSelected={2}/>);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText(/[a-z]/)).toBeNull();
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
});
