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
            materialToNode[material] = [];
          }
          materialToNode[material].push(node);
        }
      }
    }
    return materialToNode;
  };

  const theme = useTheme();
  const [filterValues, setFilterValues] = React.useState({
    "material-resource": "All",
    "country": "All"
  });
  const materialToNode = getMaterialToNodes();

  const handleChange = (evt, key) => {
    const updatedFilterValues = {...filterValues};
    updatedFilterValues[key] = evt.target.value;
    setFilterValues(updatedFilterValues);
  };

  const getCurrentHighlights = () => {
    const currMatResource = filterValues["material-resource"];
    if(currMatResource in materialToNode){
      return new Set(materialToNode[currMatResource]);
    }
    return new Set();
  };

  return (<div>
    <Paper style={{"width": "400px", verticalAlign: "top",
          padding: "20px", backgroundColor: "aliceblue", height: "100vh", position: "fixed"}}>
      <Typography component={"p"} variant={"h6"}>Highlight by...</Typography>
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
    </Paper>
    <Map highlights={getCurrentHighlights()}/>
  </div>);
};

export default Dashboard;
