import {FILTER_INPUT, FILTER_COUNTRY, FILTER_CONCENTRATION, FILTER_ORG} from "../helpers/shared";

const tooltips = {
  [FILTER_INPUT]: "Use this option to jump to a specified stage, process, tool, or material in the supply chain.",
  [FILTER_COUNTRY]: "Highlights chip inputs supplied by a specified country or set of countries.",
  [FILTER_ORG]: "Highlights chip inputs supplied by a specified company or set of companies.",
  [FILTER_CONCENTRATION]: "Highlights chip inputs supplied by a small number of countries.",

  providers: {
    countries: "Countries with significant global market share.",
    orgs: "Global companies with significant market share or otherwise notable capabilities.",
  },
};

export default tooltips;
