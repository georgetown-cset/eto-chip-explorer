import React, {useEffect} from "react";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import { Header as ETOHeader, Footer, Dropdown } from "@eto/eto-ui-components";

import Header from "./header";
import Map from "./map";
import { nodeToMeta } from "../../data/graph";
import { countryProvision } from "../../data/provision";

const Dashboard = () => {

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

  const getCurrentHighlights = (currFilterValues = filterValues) => {
    let highlighter = "input-resource";
    for(let fv in defaultFilterValues){
      if(defaultFilterValues[fv] !== currFilterValues[fv]){
        highlighter = fv;
      }
    }
    const currMapping = filterToValues[highlighter];
    if(highlighter === "input-resource") {
      const identityMap = {"type": "binary"};  // Use binary on/off shading on nodes
      identityMap[currFilterValues[highlighter]] = 1
      setHighlights(identityMap)
    } else {
      const countryMap = {"type" : "gradient"};  // Use gradient shading on nodes
      for (const countryName of currFilterValues[highlighter]) {
        // If countryName is "All", we ignore it
        if (!(countryName in currMapping)) {
          continue;
        }
        for (const countryProvKey of Object.keys(currMapping[countryName])) {
          let provValue = currMapping[countryName][countryProvKey]
          // We round qualitative "major"/"minor" values to numerical approximations
          if (provValue === "Major") {
            provValue = 80;
          } else if (provValue === "Minor") {
            provValue = 0;
          }
          if (isNaN(provValue)) {
            continue;
          }
          if (countryProvKey in countryMap) {
            countryMap[countryProvKey] += provValue;
          } else {
            countryMap[countryProvKey] = provValue;
          }
        }
      }
      setHighlights(countryMap);
    }
  };

  const inputToNode = getInputToNodes();
  const theme = useTheme();
  const filterKeys = ["input-resource", "country"];
  const defaultFilterValues = {
    "input-resource": "All",
    "country": ["All"],
  };
  const filterToValues = {
    "input-resource": inputToNode,
    "country": countryProvision
  };
  const [filterValues, setFilterValues] = React.useState(defaultFilterValues);
  const [highlights, setHighlights] = React.useState({});
  const [documentationPanelToggle, setDocumentationPanelToggle] = React.useState(false);

  const handleChange = (val, key) => {
    const updatedFilterValues = {...defaultFilterValues};
    if (key !== null) {
      updatedFilterValues[key] = val;
    }
    setFilterValues(updatedFilterValues);
    if (updatedFilterValues["input-resource"] != defaultFilterValues["input-resource"]) {
      setDocumentationPanelToggle(true);
    }
    getCurrentHighlights(updatedFilterValues);
    // Put filter values in URL parameters.
    const urlParams = new URLSearchParams(window.location.search);
    for (const filterKey of filterKeys) {
      const filterVal = updatedFilterValues[filterKey];
      if (filterVal) {
        if (filterVal === defaultFilterValues[filterKey]) {
          urlParams.delete(filterKey);
        } else {
          urlParams.set(filterKey, filterVal);
        }
      }
    }
    window.history.replaceState(null, null, window.location.pathname + "?" + urlParams.toString());
  };

  // Functions to interface with ETO dropdown component
  const handleCountryChange = (val) => {
    handleChange(val, "country");
  };
  const countryOptions = [{"val": "All", "text": "All"}];
  Object.keys(countryProvision).sort().filter((c) => c !== "Other").map((name) => (
    countryOptions.push({"val": name, "text": name})
  ));

  const handleInputResourceChange = (val) => {
    handleChange(val, "input-resource");
  };
  const inputResourceOptions = [{"val": "All", "text": "All"}];
  Object.keys(inputToNode).sort(
    (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
  ).map((name) => (
    inputResourceOptions.push({"val": name, "text": nodeToMeta[name]["name"]})
  ));

  // Sets the state of the app based on the queries in the URL.
  // This will only run once, when the component is initially rendered.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const updatedFilterValues = {...defaultFilterValues};
    for (const filterKey of filterKeys) {
      let filterVal = urlParams.get(filterKey);
      if (filterVal) {
        if (filterKey === "country") {
          // This is a multi-select, so we need to pass in an array
          filterVal = filterVal.split(",");
        }
        updatedFilterValues[filterKey] = filterVal;
      }
    }
    setFilterValues(updatedFilterValues);
    if (updatedFilterValues["input-resource"] != defaultFilterValues["input-resource"]) {
      setDocumentationPanelToggle(true);
    }
    getCurrentHighlights(updatedFilterValues);
  }, []);

  return (<div>
    <ETOHeader/>
    <Header/>
    <Paper style={{paddingBottom: "20px", position: "sticky", top: "0px", width: "100%", zIndex: "10"}}
      className="filter-bar"
      elevation={0}
    >
      <div style={{display: "inline-block"}}>
        <Dropdown
          inputLabel="Countries"
          selected={filterValues["country"]}
          setSelected={handleCountryChange}
          multiple="true"
          options={countryOptions}
        />
      </div>
      <div style={{display: "inline-block"}}>
        <Dropdown
          inputLabel="Inputs"
          selected={filterValues["input-resource"]}
          setSelected={handleInputResourceChange}
          options={inputResourceOptions}
        />
      </div>
      <Button id="clear-button" style={{float: "right", marginRight: "10px"}} onClick={(evt) => handleChange(evt, null)}>
        Clear
      </Button>
    </Paper>
    <div style={{display: "inline-block", minWidth: "700px", width: "100%", textAlign: "center"}}>
      <Map highlights={highlights} filterValues={filterValues} defaultFilterValues={defaultFilterValues}
        documentationPanelToggle={documentationPanelToggle} setDocumentationPanelToggle={setDocumentationPanelToggle} />
    </div>
    <Footer/>
  </div>);
};

export default Dashboard;
