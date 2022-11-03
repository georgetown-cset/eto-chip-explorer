import React from "react";
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import SvgIcon from '@mui/material/SvgIcon';
import { variants } from "../../data/graph";
import { NODE_TYPE_PARENT } from "../components/input_list";

// List of all subvariants a parent variant has
const getAllSubVariantsList = () => {
  let subVariantsList = {...variants};
  for (const nodeWithVariants in subVariantsList) {
    // Deep copy
    subVariantsList[nodeWithVariants] = [...subVariantsList[nodeWithVariants]];
    for (const nodeVariant of subVariantsList[nodeWithVariants]) {
      if (nodeVariant in subVariantsList) {
        subVariantsList[nodeWithVariants].push(...subVariantsList[nodeVariant]);
      }
    }
  }
  return subVariantsList;
};
const allSubVariantsList = getAllSubVariantsList();

export const getBackgroundGradient = (highlight, highlights) => {
  let backgroundGradient = "gradient-100";
  if (highlights && highlights.type === "gradient") {
    if (highlight <= 20) {backgroundGradient = "gradient-20"}
    else if (highlight <= 40) {backgroundGradient = "gradient-40"}
    else if (highlight <= 60) {backgroundGradient = "gradient-60"}
    else if (highlight <= 80) {backgroundGradient = "gradient-80"}
    else {backgroundGradient = "gradient-100"}
  }
  return backgroundGradient;
}

const CogIcon = (props) => {
  return (
    <SvgIcon {...props} style={{fillRule: "evenodd", margin: "-8px 0px"}}>
      <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
      <path className="b" d="M13.75,29.7c-.2,.11-.46,.04-.57-.16l-2.12-3.68c-.11-.2-.05-.46,.15-.58l1.88-1.15c.2-.12,.36-.4,.36-.64v-3c0-.23-.16-.52-.36-.64l-1.88-1.15c-.2-.12-.26-.38-.15-.58l2.12-3.68c.11-.2,.38-.27,.57-.16l1.94,1.05c.2,.11,.53,.11,.73,0l2.6-1.5c.2-.12,.37-.4,.37-.63l.06-2.21c0-.23,.2-.42,.43-.42h4.24c.23,0,.42,.19,.43,.41l.06,2.21c0,.23,.17,.51,.37,.63l2.6,1.5c.2,.12,.53,.12,.73,0l1.94-1.06c.2-.11,.46-.04,.57,.16l2.12,3.68c.11,.2,.05,.46-.15,.58l-1.88,1.15c-.2,.12-.36,.4-.36,.64v3c0,.23,.16,.52,.36,.64l1.88,1.15c.2,.12,.26,.38,.15,.58l-2.12,3.68c-.11,.2-.38,.27-.57,.16l-1.94-1.05c-.2-.11-.53-.11-.73,0l-2.6,1.5c-.2,.12-.37,.4-.37,.63l-.06,2.21c0,.23-.2,.42-.43,.42h-4.24c-.23,0-.42-.19-.43-.41l-.06-2.21c0-.23-.17-.51-.37-.63l-2.6-1.5c-.2-.12-.53-.12-.73,0l-1.94,1.06Zm5.74-3.37c2.4,1.38,5.46,.56,6.84-1.83,1.38-2.4,.56-5.46-1.83-6.84-2.4-1.38-5.46-.56-6.84,1.83-1.38,2.4-.56,5.46,1.83,6.84Z"/>
      </svg>
    </SvgIcon>
  );
}

const getIcon = (nodeType, style, selected=false) => {
  if (nodeType === NODE_TYPE_PARENT) {
    if (selected) {
      return <CircleIcon style={{...style, fontSize: "0.6rem", margin: "0px 0.4rem"}}/>;
    } else {
      return <CircleOutlinedIcon style={{...style, fontSize: "0.6rem", margin: "0px 0.4rem"}}/>;
    }
  } else {
    return <CogIcon style={style}/>;
  }
};

const FILTER_INPUT = "input-resource";
const FILTER_COUNTRY = "country";
const FILTER_CONCENTRATION = "concentration";
const FILTER_ORG = "organization";

export {allSubVariantsList, getIcon, FILTER_ORG, FILTER_COUNTRY, FILTER_INPUT, FILTER_CONCENTRATION};
