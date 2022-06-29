import React from "react";
import { useTheme } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";

import Map from "./map";
import {nodeToMeta} from "../../data/graph";
import {countryProvision, orgProvision} from "../../data/provision";

function getStyles(name, selectedName, theme) {
  return {
    fontWeight:
      selectedName !== name
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const Dashboard = () => {
  const getMaterialToNodes = () => {
    const materialToNode = {};
    for(let node in nodeToMeta){
      if(nodeToMeta[node]["type"] === "process"){
        for(let material of nodeToMeta[node]["materials"]){
          if(!(material in materialToNode)){
            materialToNode[material] = {};
          }
          materialToNode[material][node] = 1;
        }
      }
    }
    return materialToNode;
  };

  const getCurrentHighlights = (currFilterValues = filterValues) => {
    let highlighter = "material-resource";
    for(let fv in defaultFilterValues){
      if(defaultFilterValues[fv] !== currFilterValues[fv]){
        highlighter = fv;
      }
    }
    const currMapping = filterToValues[highlighter];
    setHighlights(currFilterValues[highlighter] in currMapping ? currMapping[currFilterValues[highlighter]]: {})
  };

  const materialToNode = getMaterialToNodes();
  const theme = useTheme();
  const defaultFilterValues = {
    "material-resource": "All",
    "country": "All",
    "org": "All"
  };
  const filterToValues = {
    "material-resource": materialToNode,
    "country": countryProvision,
    "org": orgProvision
  };
  const [filterValues, setFilterValues] = React.useState(defaultFilterValues);
  const [highlights, setHighlights] = React.useState({});

  const handleChange = (evt, key) => {
    const updatedFilterValues = {...defaultFilterValues};
    updatedFilterValues[key] = evt.target.value;
    setFilterValues(updatedFilterValues);
    getCurrentHighlights(updatedFilterValues);
  };

  return (<div>
    <Paper style={{"width": "400px", verticalAlign: "top",
          padding: "20px", backgroundColor: "aliceblue", height: "100vh", position: "fixed"}}>
      <Typography component={"p"} variant={"h6"}>Highlight by...</Typography>
      <div>
      <FormControl sx={{m: 1}} size={"small"} style={{margin: "15px 0 0 15px", textAlign: "left", minWidth: "150px"}}>
        <InputLabel id="material-select-label">Material component</InputLabel>
        <Select
          labelId="material-select-label"
          id="material-select"
          value={filterValues["material-resource"]}
          onChange={e => handleChange(e, "material-resource")}
          input={<OutlinedInput label={"Material component"}/>}
        >
          <MenuItem
            key={"All"}
            value={"All"}
            style={getStyles("All", filterValues["material-resource"], theme)}
            >
              All
          </MenuItem>
          {Object.keys(materialToNode).sort((a, b) => nodeToMeta[a]["name"] > nodeToMeta[b]["name"]).map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, filterValues["material-resource"], theme)}
            >
              {nodeToMeta[name]["name"]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
      <div>
      <FormControl sx={{m: 1}} size={"small"} style={{margin: "15px 0 0 15px", textAlign: "left", minWidth: "150px"}}>
        <InputLabel id="country-select-label">Country provision share</InputLabel>
        <Select
          labelId="country-select-label"
          id="country-select"
          value={filterValues["country"]}
          onChange={e => handleChange(e, "country")}
          input={<OutlinedInput label={"Country provision share"}/>}
        >
          <MenuItem
            key={"All"}
            value={"All"}
            style={getStyles("All", filterValues["country"], theme)}
            >
              All
          </MenuItem>
          {Object.keys(countryProvision).sort().map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, filterValues["country"], theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
      <div>
      <FormControl sx={{m: 1}} size={"small"} style={{margin: "15px 0 0 15px", textAlign: "left", minWidth: "150px"}}>
        <InputLabel id="org-select-label">Organization provision share</InputLabel>
        <Select
          labelId="org-select-label"
          id="org-select"
          value={filterValues["org"]}
          onChange={e => handleChange(e, "org")}
          input={<OutlinedInput label={"Organization provision share"}/>}
        >
          <MenuItem
            key={"All"}
            value={"All"}
            style={getStyles("All", filterValues["org"], theme)}
            >
              All
          </MenuItem>
          {Object.keys(orgProvision).sort().map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, filterValues["org"], theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
    </Paper>
    <Map highlights={highlights}/>
  </div>);
};

export default Dashboard;
