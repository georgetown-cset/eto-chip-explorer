import React, {useEffect} from "react";
import { useStaticQuery, graphql } from "gatsby"
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {InfoCard, Autocomplete, Dropdown, HelpTooltip, UserFeedback} from "@eto/eto-ui-components";
import {useXarrow} from "react-xarrows";

import Map from "./map";
import { nodeToMeta, variants } from "../../data/graph";
import {countryProvision, countryProvisionConcentration, orgProvision, providerMeta} from "../../data/provision";
import {FILTER_INPUT, FILTER_CONCENTRATION, FILTER_COUNTRY, FILTER_ORG} from "../helpers/shared";
import tooltips from "../helpers/tooltips";

export const FILTER_CHOOSE = "filter-choose";
const DROPDOWN_FILTERS = [FILTER_INPUT, FILTER_COUNTRY, FILTER_ORG];
const MULTI_FILTERS = [FILTER_COUNTRY, FILTER_ORG];

export const GradientLegend = (props) => {
  const {type, numSelected} = props;

  let startLegend, endLegend = "";
  let boxes = null;

  const has = numSelected === 1 ? "country has" : "countries have";
  const company = numSelected === 1 ? "company" : "companies";
  let dataNotAvailable = <div className="gradient-legend-not-available">
    <span>data not available</span>
    <div className="gradient-box not-applicable" />
  </div>;

  switch (type) {
    case FILTER_COUNTRY:
      startLegend = `selected ${has} less market share`;
      endLegend = `selected ${has} more market share`;
      boxes = <div className="gradient-box-wrapper">
        <div className="gradient-box unhighlighted" />
        <div className="gradient-box gradient-20" />
        <div className="gradient-box gradient-40" />
        <div className="gradient-box gradient-60" />
        <div className="gradient-box gradient-80" />
        <div className="gradient-box gradient-100" />
      </div>;
      break;
    case FILTER_CONCENTRATION:
      startLegend = "more supplier countries";
      endLegend = "fewer supplier countries";
      boxes = <div className="gradient-box-wrapper">
        <div className="gradient-box unhighlighted" />
        <div className="gradient-box gradient-60" />
        <div className="gradient-box gradient-100" />
      </div>;
      break;
    case FILTER_ORG:
      startLegend = `not provided by selected ${company}`;
      endLegend = `provided by selected ${company}`;
      boxes = <div className="gradient-box-wrapper">
        <div className="gradient-box unhighlighted" />
        <div className="gradient-box gradient-100" />
      </div>;
      break;
    default:
      dataNotAvailable = null;
      break;
  }

  return (
    <div className="gradient-legend">
      <span className="init-text">Legend:</span>
      {startLegend}
      {boxes}
      {endLegend}
      {dataNotAvailable}
    </div>
  )
}

const Dashboard = () => {

  // Keeps track of the selected node, which can be a process node or a process input/tool/material
  const [selectedNode, setSelectedNode] = React.useState(null);
  // Keeps track of the parent node, which must be a process node. This is used to keep track of
  // where the documentation node should be displayed.
  const [parentNode, setParentNode] = React.useState(null);
  // Function to update the above nodes
  const updateXarrow = useXarrow();
  const updateSelected = (evt, selectedNode, parentNode) => {
    if (evt !== null) {
      evt.stopPropagation();
    }
    if (selectedNode !== null && window.plausible) {
      window.plausible('Open Documentation Node', {props: {node: selectedNode}});
    }
    setSelectedNode(selectedNode);
    setParentNode(parentNode);
    updateXarrow();
    // Put filter values in URL parameters.
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeys = ["parentNode", "selectedNode"];
    for (const filterKey of filterKeys) {
      const filterVal = (filterKey === "parentNode") ? parentNode : selectedNode;
      if (filterVal) {
        urlParams.set(filterKey, filterVal);
      } else {
        urlParams.delete(filterKey);
      }
    }
    window.history.replaceState(null, null, window.location.pathname + "?" + urlParams.toString());
    // Close the documentation node under the filter bar
    setDocumentationPanelToggle(false);
  };

  const data = useStaticQuery(graphql`
    query {
      site {
        buildTime(formatString: "MMMM DD, YYYY")
      }
    }
  `);

  const getInputNodes = () => {
    const inputNodes = {};
    for(let node in nodeToMeta){
      if(nodeToMeta[node]["type"] === "tool_resource" || nodeToMeta[node]["type"] === "material_resource"){
        inputNodes[node] = 1;
      }
    }
    return inputNodes;
  };

  // Each key variant is associated with a list of all
  // its ancestors.
  const getVariantToAncestors = () => {
    const variantToAncestor = {};
    // First, map each variant to its immediate parent
    for (const node in variants) {
      for (const variant of variants[node]) {
        variantToAncestor[variant] = [node];
      }
    }
    // Then, add all other ancestors
    for (const variant in variantToAncestor) {
      let ancestor = variantToAncestor[variant];
      while (ancestor in variantToAncestor) {
        ancestor = variantToAncestor[ancestor];
        variantToAncestor[variant].push(...ancestor);
      }
    }
    return variantToAncestor;
  }
  const variantToAncestor = getVariantToAncestors();

  const getCurrentHighlights = (currFilterValues = filterValues) => {
    let highlighter = FILTER_INPUT;
    let hasHighlighter = false;
    for(let fv in defaultFilterValues){
      // The top-level filter does not result in any highlighting
      if (fv === FILTER_CHOOSE) {
        continue;
      }
      // If the user hasn't selected anything, there should be no highlighting.
      // First, we check this condition for the multi-selects, by comparing arrays.
      if (MULTI_FILTERS.includes(fv)) {
        if (currFilterValues[fv].length === 0) {
          continue;
        } else if ((defaultFilterValues[fv].length !== currFilterValues[fv].length) ||
            (defaultFilterValues[fv][0] !== currFilterValues[fv][0])){
          highlighter = fv;
          hasHighlighter = true;
        }
      // Then, we check this condition for the single-selects, by comparing values directly.
      } else {
        if (currFilterValues[fv] && defaultFilterValues[fv] !== currFilterValues[fv]){
          highlighter = fv;
          hasHighlighter = true;
        }
      }
    }
    if (hasHighlighter) {
      setHighlighterFilter(highlighter);
      // window.plausible is not available when running in dev mode
      if (window.plausible) {
        window.plausible('Apply Filter', {props: {
          filter: highlighter,
          filterValues: JSON.stringify(currFilterValues[highlighter])
        }});
      }
    } else {
      setHighlighterFilter('');
      setHighlights({});
      return;
    }
    const currMapping = filterToValues[highlighter];
    if(highlighter === FILTER_INPUT) {
      const identityMap = {"type": "binary"};  // Use binary on/off shading on nodes
      let provKey = currFilterValues[highlighter];
      identityMap[provKey] = 1;
      // If the selected input is a variant, select the canonical version as well
      if (variantToAncestor[provKey] !== undefined) {
        for (const variantAncestor of variantToAncestor[provKey]) {
          identityMap[variantAncestor] = 1;
        }
      }
      setHighlights(identityMap);
    } else {
      const highlightGradientMap = {"type" : "gradient"};  // Use gradient shading on nodes
      if (highlighter === FILTER_CONCENTRATION) {
        for (const nodeId in countryProvisionConcentration) {
          const numCountries = countryProvisionConcentration[nodeId];
          if (numCountries === 1) {  // Highly concentrated
            highlightGradientMap[nodeId] = 81;
          } else if (numCountries <= 3) {  // Medium concentrated
            highlightGradientMap[nodeId] = 41;
          } else {  // Not concentrated
            continue;
          }
        }
      } else if (MULTI_FILTERS.includes(highlighter)) {
        let highlightFirst = undefined;
        for (const name of currFilterValues[highlighter]) {
          // If name is not one of the choices, we ignore it
          if (!(name in currMapping)) {
            continue;
          }
          for (const provKey in currMapping[name]) {
            let provValue = currMapping[name][provKey]
            // We round qualitative "major"/"minor" values to numerical approximations.
            // For orgs, we treat all providers as if they are providing almost all of
            // the node.
            if (highlighter === FILTER_ORG) {
              provValue = 81;
            }
            // For countries, we treat major providers as providing some small share.
            else if (highlighter === FILTER_COUNTRY) {
              if (provValue === "Major") {
                provValue = 21;
              } else if (provValue === "negligible") {
                provValue = 0;
              }
            }
            if (isNaN(provValue)) {
              continue;
            }
            if (provKey in highlightGradientMap) {
              highlightGradientMap[provKey] += provValue;
            } else {
              highlightGradientMap[provKey] = provValue;
            }
            // If the provision node is a variant of another parent node,
            // we show the highlighting on the top-level parent node.
            let provKeyTemp = provKey;
            if (variantToAncestor[provKeyTemp] !== undefined) {
              const variantAncestors = variantToAncestor[provKeyTemp];
              for (const variantAncestor of variantAncestors) {
                provKeyTemp = variantAncestor;
                if (variantAncestor in highlightGradientMap) {
                  highlightGradientMap[variantAncestor] = Math.max(provValue, highlightGradientMap[variantAncestor]);
                } else {
                  highlightGradientMap[variantAncestor] = provValue;
                }
              }
            }
            // Find the top node so we can scroll it into view
            const highlightedProvKey = provKeyTemp;
            const highlightedProvElem = document.getElementById(highlightedProvKey);
            if ((highlightFirst === undefined) || (highlightFirst === null) ||
                (highlightedProvElem && highlightedProvElem.offsetTop < highlightFirst.offsetTop)) {
              highlightFirst = highlightedProvElem;
            }
          }
        }
        if (highlightFirst !== undefined) {
          highlightFirst.scrollIntoView({block: "center"});
        }

      }
      setHighlights(highlightGradientMap);
    }
  };

  const inputNodes = getInputNodes();
  const listOfFilters = [
    {val: "None", text: "None"},
    {val: FILTER_INPUT, text: <span style={{display: "flex"}}>Specific inputs <HelpTooltip smallIcon text={tooltips[FILTER_INPUT]} /></span>},
    {val: FILTER_COUNTRY, text: <span style={{display: "flex"}}>Supplier countries <HelpTooltip smallIcon text={tooltips[FILTER_COUNTRY]} /></span>},
    {val: FILTER_ORG, text: <span style={{display: "flex"}}>Supplier companies <HelpTooltip smallIcon text={tooltips[FILTER_ORG]} /></span>},
    {val: FILTER_CONCENTRATION, text: <span style={{display: "flex"}}>Market concentration <HelpTooltip smallIcon text={tooltips[FILTER_CONCENTRATION]} /></span>},
  ];
  const filterKeys = [FILTER_CHOOSE, FILTER_INPUT, FILTER_COUNTRY, FILTER_ORG, FILTER_CONCENTRATION];
  const defaultFilterValues = {
    [FILTER_CHOOSE]: "None",
    [FILTER_INPUT]: null,
    [FILTER_COUNTRY]: [],
    [FILTER_ORG]: [],
    [FILTER_CONCENTRATION]: false,
  };
  const filterToValues = {
    [FILTER_CHOOSE]: listOfFilters,
    [FILTER_INPUT]: inputNodes,
    [FILTER_COUNTRY]: countryProvision,
    [FILTER_ORG]: orgProvision,
    [FILTER_CONCENTRATION]: [true, false],
  };
  const [filterValues, setFilterValues] = React.useState(defaultFilterValues);
  const [highlighterFilter, setHighlighterFilter] = React.useState('');
  const [highlights, setHighlights] = React.useState({});
  const [documentationPanelToggle, setDocumentationPanelToggle] = React.useState(false);

  const handleChange = (val, key) => {
    const updatedFilterValues = {...defaultFilterValues};
    if (key !== null) {
      // Keep the value of FILTER_CHOOSE until the user explicitly clears it
      updatedFilterValues[FILTER_CHOOSE] = filterValues[FILTER_CHOOSE];
      updatedFilterValues[key] = val;
    }
    setFilterValues(updatedFilterValues);
    // If the chosen filter is FILTER_CONCENTRATION, set that value explicitly
    // since that filter has no dropdown
    if (updatedFilterValues[FILTER_CHOOSE] === FILTER_CONCENTRATION) {
      updatedFilterValues[FILTER_CONCENTRATION] = true;
    }
    getCurrentHighlights(updatedFilterValues);
    // Put filter values in URL parameters.
    const urlParams = new URLSearchParams(window.location.search);
    for (const filterKey of filterKeys) {
      const filterVal = updatedFilterValues[filterKey];
      if (filterVal !== null) {
        if (filterVal === defaultFilterValues[filterKey]) {
          urlParams.delete(filterKey);
        } else {
          urlParams.set(filterKey, filterVal);
        }
      }
    }
    window.history.replaceState(null, null, window.location.pathname + "?" + urlParams.toString());
    // Close any open documentation node
    updateSelected(null, null, null);
    // Open a documentation node under the filter bar
    if (updatedFilterValues[FILTER_INPUT] !== defaultFilterValues[FILTER_INPUT]) {
      setDocumentationPanelToggle(true);
    }
  };

  // Functions to interface with ETO dropdown component
  const countryOptions = [];
  Object.keys(countryProvision).sort().filter((c) => c !== "Various").map((name) => (
    countryOptions.push({"val": name, "text": name})
  ));

  const inputResourceOptions = [];
  Object.keys(inputNodes).sort(
    (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
  ).map((name) => (
    inputResourceOptions.push({"val": name, "text": nodeToMeta[name]["name"]})
  ));

  const organizationOptions = [];
  Object.keys(orgProvision).sort(
    (a, b) => ('' + providerMeta[a]["name"]).localeCompare(providerMeta[b]["name"])
  ).map((name) => (
    organizationOptions.push({"val": name, "text": providerMeta[name]["name"]})
  ));

  const dropdownParams = {
    [FILTER_INPUT]: {
      "label": "Choose input",
      "key": FILTER_INPUT,
      "options": inputResourceOptions
    },
    [FILTER_COUNTRY]: {
      "label": "Choose supplier countries",
      "key": FILTER_COUNTRY,
      "options": countryOptions
    },
    [FILTER_ORG]: {
      "label": "Choose supplier companies",
      "key": FILTER_ORG,
      "options": organizationOptions
    },
  };

  // Sets the state of the app based on the queries in the URL.
  // This will only run once, when the component is initially rendered.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const updatedFilterValues = {...defaultFilterValues};
    for (const filterKey of filterKeys) {
      let filterVal = urlParams.get(filterKey);
      if (filterVal !== null) {
        if (MULTI_FILTERS.includes(filterKey)) {
          // This is a multi-select, so we need to pass in an array
          if (filterVal === "") {
            filterVal = [];
          } else {
            filterVal = filterVal.split(",");
          }
        }
        updatedFilterValues[filterKey] = filterVal;
      }
    }
    setFilterValues(updatedFilterValues);
    // If the chosen filter is FILTER_CONCENTRATION, set that value explicitly
    // since that filter has no dropdown
    if (updatedFilterValues[FILTER_CHOOSE] === FILTER_CONCENTRATION) {
      updatedFilterValues[FILTER_CONCENTRATION] = true;
    }
    getCurrentHighlights(updatedFilterValues);

    // Handle documentation nodes
    const paramsParentNode = urlParams.get("parentNode");
    const paramsSelectedNode = urlParams.get("selectedNode");
    setParentNode(paramsParentNode);
    setSelectedNode(paramsSelectedNode);
    updateXarrow();
    // Scroll the open documentation into view
    if (paramsParentNode) {
      const parentElem = document.getElementById(paramsParentNode);
      parentElem.scrollIntoView({behavior: "smooth", block: "start"});
    }

    // Only open the filter documentation node if no other documentation node
    // is open
    if (!paramsSelectedNode && updatedFilterValues[FILTER_INPUT] !== defaultFilterValues[FILTER_INPUT]) {
      setDocumentationPanelToggle(true);
    }

    // We want to force the arrows to rerender because some of the elements
    // might have shifted around, but the library does not offer a force
    // rerender function, so we will pretend the window was resized, which
    // will force the react-xarrows library to rerender.
    setTimeout(function (){
      window.dispatchEvent(new Event('resize'));
    }, 200);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (<>
    <div style={{maxWidth: "1500px"}}>
      <InfoCard
        title={"Supply Chain Explorer"}
        description={
          <div>
            ETO's Supply Chain Explorer is designed to quickly orient non-experts to the essential inputs, players, and relationships involved in producing advanced computer chips. Use the Explorer to learn how these chips are made, who makes them, and the tools, materials, and processes involved in the supply chain.
            <Typography component={"div"} style={{paddingTop: "15px"}}>
            <strong>Learn more:</strong> <a href="https://eto.tech/tool-docs/chipexplorer" target="_blank" rel="noopener">Documentation</a><span style={{padding: "0px 10px"}}>|</span>Blog post: <a href="https://eto.tech/blog/five-takeaways-chip-supply-chain" target="_blank" rel="noopener">Five quick takeaways on the chip supply chain</a><span style={{padding: "0px 10px"}}>|</span><a href="https://eto.tech/blog/?tag=Supply%20Chain%20Explorer" target="_blank" rel="noopener">All Explorer blog posts</a>
            <p>
              Last updated on {data.site.buildTime}. Underlying data originally published in 2021.
            </p>
            </Typography>
          </div>
        }
        documentationLink="https://eto.tech/tool-docs/chipexplorer/"
        headingComponent="h1"
        sidebarTitle={"Quick guide"}
        sidebarContent={
          <div>
            <div style={{paddingBottom: "15px"}}>Click on any part of the diagram to view a summary description, supplier countries, and supplier companies.</div>
            <div>Use the filter bar at the top to jump to a specific input, or to highlight different parts of the diagram according to countries, companies, or market concentration.</div>
          </div>
        }
      />
    </div>
    <Paper style={{position: "sticky", top: "0px", zIndex: "20"}}
      className="filter-bar"
      elevation={0}
    >
      <Dropdown
        inputLabel="Highlight by"
        selected={filterValues[FILTER_CHOOSE]}
        setSelected={(evt) => handleChange(evt, FILTER_CHOOSE)}
        options={filterToValues[FILTER_CHOOSE]}
      />
      {(DROPDOWN_FILTERS.includes(filterValues[FILTER_CHOOSE])) &&
        <div key={dropdownParams[filterValues[FILTER_CHOOSE]].label}>
          <Autocomplete
            inputLabel={dropdownParams[filterValues[FILTER_CHOOSE]].label}
            selected={filterValues[dropdownParams[filterValues[FILTER_CHOOSE]].key]}
            setSelected={(evt) => handleChange(evt, dropdownParams[filterValues[FILTER_CHOOSE]].key)}
            multiple={MULTI_FILTERS.includes(dropdownParams[filterValues[FILTER_CHOOSE]].key)}
            options={dropdownParams[filterValues[FILTER_CHOOSE]].options}
          />
        </div>
      }
      <Button id="clear-button" variant={"outlined"} onClick={(evt) => handleChange(evt, null)}>
        Clear Highlights
      </Button>
      <UserFeedback context={"the Supply Chain Explorer"}
        mkFormSubmitLink={(context, queryParams, feedback) => `https://docs.google.com/forms/d/e/1FAIpQLSeaAgmf2g6O80ebW_fsRAa6Ma0CxnRwxgEr480aIg5Xz96FJg/formResponse?usp=pp_url&entry.1524532195=${feedback}&entry.1308802318=${queryParams}&entry.135985468=${context}&submit=Submit`}/>
      {
        highlighterFilter !== '' && highlighterFilter !== FILTER_INPUT &&
        <GradientLegend type={highlighterFilter} numSelected={Array.isArray(filterValues[highlighterFilter]) ? filterValues[highlighterFilter].length : 1}/>
      }
    </Paper>
    <div style={{display: "inline-block", textAlign: "center", backgroundColor: "white"}}>
      <Map highlights={highlights} highlighterFilter={highlighterFilter} filterValues={filterValues} defaultFilterValues={defaultFilterValues}
        documentationPanelToggle={documentationPanelToggle} setDocumentationPanelToggle={setDocumentationPanelToggle}
        parentNode={parentNode} selectedNode={selectedNode} updateSelected={updateSelected} />
    </div>
  </>);
};

export default Dashboard;
