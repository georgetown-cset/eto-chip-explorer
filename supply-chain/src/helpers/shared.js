import React from "react";
import ConstructionIcon from "@mui/icons-material/Construction";
import InputIcon from "@mui/icons-material/Input";

const getIcon = (nodeType, style) => {
 return nodeType === "tools" ? <ConstructionIcon style={style}/> : <InputIcon style={style}/>;
};

export default getIcon;
