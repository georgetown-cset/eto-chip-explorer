import React, {useEffect} from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { AppIntro, AppWrapper, Dropdown } from "@eto/eto-ui-components";
import {useXarrow} from "react-xarrows";

import Map from "./map";
import { nodeToMeta, variants } from "../../data/graph";
import {countryProvision, countryProvisionConcentration, orgProvision, providerMeta} from "../../data/provision";

const FILTER_CHOOSE = "filter-choose";
const FILTER_INPUT = "input-resource";
const FILTER_COUNTRY = "country";
const FILTER_CONCENTRATION = "concentration";
const FILTER_ORG = "organization";
const DROPDOWN_FILTERS = [FILTER_INPUT, FILTER_COUNTRY, FILTER_ORG];
const MULTI_FILTERS = [FILTER_COUNTRY, FILTER_ORG];

const GradientLegend = (props) => {
  const {type, numSelected} = props;

  let startLegend, endLegend = "";
  let boxes = null;

  switch (type) {
    case FILTER_COUNTRY:
      const has = numSelected === 1 ? "country has" : "countries have";
      startLegend = `selected ${has} 0% market share`;
      endLegend = `selected ${has} >80% market share`;
      boxes = <div className="gradient-box-wrapper">
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
      <div className="gradient-box gradient-20" />
      <div className="gradient-box gradient-60" />
      <div className="gradient-box gradient-100" />
    </div>;
      break;
    case FILTER_ORG:
      const company = numSelected === 1 ? "company" : "companies";
      startLegend = `not provided by selected ${company}`;
      endLegend = `provided by selected ${company}`;
      boxes = <div className="gradient-box-wrapper">
      <div className="gradient-box gradient-20" />
      <div className="gradient-box gradient-100" />
    </div>;
      break;
  }

  return (
    <div className="gradient-legend">
      {startLegend}
      {boxes}
      {endLegend}
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
  };

  const getInputToNodes = () => {
    const inputTypes = ["materials", "tools"];
    const inputToNode = {};
    for(let node in nodeToMeta){
      if(nodeToMeta[node]["type"] === "process"){
        for (let inputType of inputTypes) {
          for(let input of nodeToMeta[node][inputType]){
            if(!(input in inputToNode)){
              inputToNode[input] = {};
            }
            inputToNode[input][node] = 1;
          }
        }
      }
    }
    return inputToNode;
  };

  const getVariantToNode = () => {
    const variantToNode = {};
    for (const node in variants) {
      for (const variant of variants[node]) {
        variantToNode[variant] = node;
      }
    }
    return variantToNode;
  }
  const variantToNode = getVariantToNode();

  const getCurrentHighlights = (currFilterValues = filterValues) => {
    let highlighter = FILTER_INPUT;
    let hasHighlighter = false;
    for(let fv in defaultFilterValues){
      if(defaultFilterValues[fv] !== currFilterValues[fv]){
        highlighter = fv;
        hasHighlighter = true;
      }
    }
    if (hasHighlighter) {
      setHighlighterFilter(highlighter)
    } else {
      setHighlighterFilter('');
    }
    const currMapping = filterToValues[highlighter];
    if(highlighter === FILTER_INPUT) {
      const identityMap = {"type": "binary"};  // Use binary on/off shading on nodes
      identityMap[currFilterValues[highlighter]] = 1;
      setHighlights(identityMap)
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
        for (const name of currFilterValues[highlighter]) {
          // If name is "All", we ignore it
          if (!(name in currMapping)) {
            continue;
          }
          for (const provKey in currMapping[name]) {
            let provValue = currMapping[name][provKey]
            // We round qualitative "major"/"minor" values to numerical approximations
            if (provValue === "Major") {
              provValue = 81;
            } else if (provValue === "negligible") {
              provValue = 0;
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
            // we show the highlighting on that parent node.
            if (variantToNode[provKey] !== undefined) {
              const variantParentNode = variantToNode[provKey];
              if (variantParentNode in highlightGradientMap) {
                highlightGradientMap[variantParentNode] += provValue;
              } else {
                highlightGradientMap[variantParentNode] = provValue;
              }
            }
          }
        }
      }
      setHighlights(highlightGradientMap);
    }
  };

  const inputToNode = getInputToNodes();
  const listOfFilters = [
    {val: "None", text: "None"},
    {val: FILTER_INPUT, text: "Process Input"},
    {val: FILTER_COUNTRY, text: "Supplier Countries"},
    {val: FILTER_ORG, text: "Supplier Companies"},
    {val: FILTER_CONCENTRATION, text: "Show Supplier Concentration"},
  ];
  const filterKeys = [FILTER_CHOOSE, FILTER_INPUT, FILTER_COUNTRY, FILTER_ORG, FILTER_CONCENTRATION];
  const defaultFilterValues = {
    [FILTER_CHOOSE]: "None",
    [FILTER_INPUT]: "All",
    [FILTER_COUNTRY]: ["All"],
    [FILTER_ORG]: ["All"],
    [FILTER_CONCENTRATION]: false,
  };
  const filterToValues = {
    [FILTER_CHOOSE]: listOfFilters,
    [FILTER_INPUT]: inputToNode,
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
      if (MULTI_FILTERS.includes(key) && (val.length > 1)){
        if(filterValues[key].includes("All")){
          updatedFilterValues[key] = val.filter((v) => v !== "All");
        } else {
          // if the user has just added the all value, clear out the rest of the values
          updatedFilterValues[key] = val.includes("All") ? ["All"] : val;
        }
      } else {
        updatedFilterValues[key] = val;
      }
    }
    setFilterValues(updatedFilterValues);
    if (updatedFilterValues[FILTER_INPUT] !== defaultFilterValues[FILTER_INPUT]) {
      setDocumentationPanelToggle(true);
    }
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
  };

  // Functions to interface with ETO dropdown component
  const countryOptions = [{"val": "All", "text": "All"}];
  Object.keys(countryProvision).sort().filter((c) => c !== "Various").map((name) => (
    countryOptions.push({"val": name, "text": name})
  ));

  const inputResourceOptions = [{"val": "All", "text": "All"}];
  Object.keys(inputToNode).sort(
    (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
  ).map((name) => (
    inputResourceOptions.push({"val": name, "text": nodeToMeta[name]["name"]})
  ));

  const organizationOptions = [{"val": "All", "text": "All"}];
  Object.keys(orgProvision).sort(
    (a, b) => ('' + providerMeta[a]["name"]).localeCompare(providerMeta[b]["name"])
  ).map((name) => (
    organizationOptions.push({"val": name, "text": providerMeta[name]["name"]})
  ));

  const dropdownParams = {
    [FILTER_INPUT]: {
      "label": "Choose process input",
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
          filterVal = filterVal.split(",");
        }
        updatedFilterValues[filterKey] = filterVal;
      }
    }
    setFilterValues(updatedFilterValues);
    if (updatedFilterValues[FILTER_INPUT] !== defaultFilterValues[FILTER_INPUT]) {
      setDocumentationPanelToggle(true);
    }
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
  }, []);

  return (<AppWrapper>
    <div style={{margin: "40px 20px 40px 100px", maxWidth: "1200px"}}>
    <AppIntro title={"Supply Chain Explorer"} content={<Typography component={"div"} variant={"body1"}>
      ETO’s Supply Chain Explorer visualizes supply chains in critical and emerging technology.
      This edition of the Explorer covers the essential tools, materials, processes, countries,
      and firms involved in producing advanced logic chips. It’s built to help users who are not
      semiconductor experts get up to speed on how this essential technology is produced, and
      to allow users of all backgrounds to visually explore how different inputs, companies,
      and nations interact in the production process.
    </Typography>}/>
    </div>
    <Paper style={{position: "sticky", top: "0px", zIndex: "10"}}
      className="filter-bar"
      elevation={0}
    >
      <Dropdown
        inputLabel="Choose filter"
        selected={filterValues[FILTER_CHOOSE]}
        setSelected={(evt) => handleChange(evt, FILTER_CHOOSE)}
        options={filterToValues[FILTER_CHOOSE]}
      />
      {(DROPDOWN_FILTERS.includes(filterValues[FILTER_CHOOSE])) &&
        <div key={dropdownParams[filterValues[FILTER_CHOOSE]].label}>
          <Dropdown
            inputLabel={dropdownParams[filterValues[FILTER_CHOOSE]].label}
            selected={filterValues[dropdownParams[filterValues[FILTER_CHOOSE]].key]}
            setSelected={(evt) => handleChange(evt, dropdownParams[filterValues[FILTER_CHOOSE]].key)}
            multiple={MULTI_FILTERS.includes(dropdownParams[filterValues[FILTER_CHOOSE]].key)}
            options={dropdownParams[filterValues[FILTER_CHOOSE]].options}
          />
        </div>
      }
      <Button id="clear-button" variant={"outlined"} onClick={(evt) => handleChange(evt, null)}>
        Clear Filters
      </Button>
      {
        highlighterFilter !== '' && highlighterFilter !== FILTER_INPUT &&
        <GradientLegend type={highlighterFilter} numSelected={Array.isArray(filterValues[highlighterFilter]) ? filterValues[highlighterFilter].length : 1}/>
      }
    </Paper>
    <div style={{display: "inline-block", minWidth: "700px", width: "100%", textAlign: "center"}}>
      <Map highlights={highlights} filterValues={filterValues} defaultFilterValues={defaultFilterValues}
        documentationPanelToggle={documentationPanelToggle} setDocumentationPanelToggle={setDocumentationPanelToggle}
        parentNode={parentNode} selectedNode={selectedNode} updateSelected={updateSelected} />
    </div>
  </AppWrapper>);
};

export default Dashboard;
