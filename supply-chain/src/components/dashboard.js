import React from "react";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";

import Header from "./header";
import Map from "./map";
import { nodeToMeta } from "../../data/graph";
import { countryProvision } from "../../data/provision";

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
    if(highlighter === "material-resource") {
      const identityMap = {}
      identityMap[currFilterValues[highlighter]] = 1
      setHighlights(identityMap)
    } else {
      setHighlights(currMapping[currFilterValues[highlighter]]);
    }
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
    "country": countryProvision
  };
  const [filterValues, setFilterValues] = React.useState(defaultFilterValues);
  const [highlights, setHighlights] = React.useState({});

  const handleChange = (evt, key) => {
    const updatedFilterValues = {...defaultFilterValues};
    if (key !== null) {
      updatedFilterValues[key] = evt.target.value;
    }
    setFilterValues(updatedFilterValues);
    getCurrentHighlights(updatedFilterValues);
  };

  return (<div>
    <Paper style={{paddingBottom: "20px", marginBottom: "5px", position: "sticky", top: "0px", width: "100%", zIndex: "10"}}>
      <Header/>
      <div style={{display: "inline-block", verticalAlign: "bottom", paddingLeft: "20px"}}><Typography component={"p"} variant={"h6"}>Highlight by...</Typography></div>
      <div style={{display: "inline-block"}}>
      <FormControl sx={{m: 1}} size={"small"} style={{margin: "15px 0 0 15px", textAlign: "left", minWidth: "200px"}}>
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
      <div style={{display: "inline-block"}}>
      <FormControl sx={{m: 1}} size={"small"} style={{margin: "15px 0 0 15px", textAlign: "left", minWidth: "200px"}}>
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
          {Object.keys(countryProvision).sort().filter((c) => c !== "Other").map((name) => (
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
      <Button style={{display: "inline-block", verticalAlign: "bottom"}} onClick={(evt) => handleChange(evt, null)}>
        Clear
      </Button>
    </Paper>
    <Typography component={"p"} variant={"body2"}>
      ETO’s Supply Chain Explorer visualizes supply chains in critical and emerging technology. This edition of the Explorer covers the essential tools, materials, processes, countries, and firms involved in producing advanced logic chips. It’s built to help users who are not semiconductor experts get up to speed on how this essential technology is produced, and to allow users of all backgrounds to visually explore how different inputs, companies, and nations interact in the production process.
    </Typography>
    <div style={{display: "inline-block", minWidth: "700px", textAlign: "center"}}>
      <Map highlights={highlights} />
    </div>
  </div>);
};

export default Dashboard;
