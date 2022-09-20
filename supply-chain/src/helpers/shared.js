import React from "react";
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import SvgIcon from '@mui/material/SvgIcon';
import { variants } from "../../data/graph";

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

const CogIcon = (props) => {
  return (
    <SvgIcon {...props} style={{fillRule: "evenodd", margin: "-8px 0px"}}>
      <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
      <path className="b" d="M13.75,29.7c-.2,.11-.46,.04-.57-.16l-2.12-3.68c-.11-.2-.05-.46,.15-.58l1.88-1.15c.2-.12,.36-.4,.36-.64v-3c0-.23-.16-.52-.36-.64l-1.88-1.15c-.2-.12-.26-.38-.15-.58l2.12-3.68c.11-.2,.38-.27,.57-.16l1.94,1.05c.2,.11,.53,.11,.73,0l2.6-1.5c.2-.12,.37-.4,.37-.63l.06-2.21c0-.23,.2-.42,.43-.42h4.24c.23,0,.42,.19,.43,.41l.06,2.21c0,.23,.17,.51,.37,.63l2.6,1.5c.2,.12,.53,.12,.73,0l1.94-1.06c.2-.11,.46-.04,.57,.16l2.12,3.68c.11,.2,.05,.46-.15,.58l-1.88,1.15c-.2,.12-.36,.4-.36,.64v3c0,.23,.16,.52,.36,.64l1.88,1.15c.2,.12,.26,.38,.15,.58l-2.12,3.68c-.11,.2-.38,.27-.57,.16l-1.94-1.05c-.2-.11-.53-.11-.73,0l-2.6,1.5c-.2,.12-.37,.4-.37,.63l-.06,2.21c0,.23-.2,.42-.43,.42h-4.24c-.23,0-.42-.19-.43-.41l-.06-2.21c0-.23-.17-.51-.37-.63l-2.6-1.5c-.2-.12-.53-.12-.73,0l-1.94,1.06Zm5.74-3.37c2.4,1.38,5.46,.56,6.84-1.83,1.38-2.4,.56-5.46-1.83-6.84-2.4-1.38-5.46-.56-6.84,1.83-1.38,2.4-.56,5.46,1.83,6.84Z"/>
      </svg>
    </SvgIcon>
  );
}

const BeakerIcon = (props) => {
  return (
    <SvgIcon {...props} style={{margin: "-8px 0px"}}>
      <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
        <path className="b" d="M31.94,10.08H15.23c-1.02,0-2.43,.23-3.39,1.32-.62,.7-.84,1.54-.84,2.09,0,.21,.07,.4,.21,.56,.13,.15,.32,.26,.52,.28,1.58,.22,1.81,.32,1.81,1.28v14.04c0,1.13,.45,2.21,1.24,3.01,.79,.8,1.87,1.25,2.99,1.25h10.15c1.12,0,2.2-.45,2.99-1.25,.79-.8,1.24-1.88,1.24-3.01V13.49c0-.67,.39-1.45,.53-1.67h0s.03-.05,.04-.07c.11-.15,.27-.37,.27-.69,0-.57-.48-.98-1.06-.98Zm-19.03,2.72c.28-.47,.91-1.01,2.34-1.01h15.57c-.19,.47-.36,1.07-.36,1.7v3.4H15.23v-1.28c0-1.99-1.13-2.56-2.32-2.82Z"/>
      </svg>
    </SvgIcon>
  );
}

const getIcon = (nodeType, style, selected=false) => {
  if (nodeType === "parent") {
    if (selected) {
      return <CircleIcon style={{...style, fontSize: "0.6rem", margin: "0px 0.4rem"}}/>;
    } else {
      return <CircleOutlinedIcon style={{...style, fontSize: "0.6rem", margin: "0px 0.4rem"}}/>;
    }
  } else if (nodeType === "tools") {
    return <CogIcon style={style}/>;
  } else {
    return <BeakerIcon style={style}/>;
  }
};

const FILTER_INPUT = "input-resource";
const FILTER_COUNTRY = "country";
const FILTER_CONCENTRATION = "concentration";
const FILTER_ORG = "organization";

export {allSubVariantsList, getIcon, FILTER_ORG, FILTER_COUNTRY, FILTER_INPUT, FILTER_CONCENTRATION};
