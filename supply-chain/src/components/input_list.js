import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { nodeToMeta, variants } from "../../data/graph";
import { allSubVariantsList, getBackgroundGradient, getIcon } from "../helpers/shared";

export const NODE_TYPE_PARENT = "parent";
const NODE_TYPE_INPUT = "input"; // can be tools or materials

const getInputList = (node) => {
  // Construct combined list of all tools and materials
  const allList = [];
  if (nodeToMeta[node]?.tools) {
    allList.push(...nodeToMeta[node].tools);
  }
  if (nodeToMeta[node]?.materials) {
    allList.push(...nodeToMeta[node].materials);
  }
  allList.sort(
    (a, b) => ('' + nodeToMeta[a].name).localeCompare(nodeToMeta[b].name)
  );
  return allList;
};

export const VariantsList = (props) => {
  // Recursive component to construct variants tree
  const {node, currSelectedNode, inputType, updateSelected, parent, depth, ancestorSelected=false, highlight=0, highlights={}} = props;
  const thisNodeAncestorSelected = ancestorSelected || (node === currSelectedNode);
  return (
    <div>
      {variants[node] && (currSelectedNode === node || allSubVariantsList[node].includes(currSelectedNode)) &&
        <div>
          <Typography
            className={"variants-heading" + (thisNodeAncestorSelected ? " selected-node-child" : "")}
            component={"p"}
            style={{paddingLeft: `${depth * 14}px`}}>Variants</Typography>
          {variants[node].sort(
            (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
          ).map((variant) =>
            <SubNode nodeType={inputType}
              name={nodeToMeta[variant]["name"]}
              key={nodeToMeta[variant]["name"]}
              nodeId={variant}
              metadata={nodeToMeta}
              highlight={variant in highlights ? highlights[variant] : 0}
              updateSelected={updateSelected}
              parent={parent}
              highlights={highlights}
              depth={depth}
              currSelectedNode={currSelectedNode}
              ancestorSelected={thisNodeAncestorSelected}
            >
              <VariantsList node={variant} currSelectedNode={currSelectedNode} inputType={inputType} updateSelected={updateSelected}
                parent={parent} depth={depth+2} ancestorSelected={thisNodeAncestorSelected} highlight={highlight} highlights={highlights} />
            </SubNode>
          )}
        </div>
      }
    </div>
  )
}

export const SubNode = (props) => {
  // Recursive component to show inputs and sub-inputs
  const {nodeType, name, parent, showParent=false, highlight, highlights, nodeId, updateSelected, currSelectedNode, depth=0, ancestorSelected=false} = props;

  return (
    <div>
      {(nodeId !== parent || showParent === true) &&
        <Paper elevation={0} id={nodeId}
          className={"graph-sub-node" + (highlight !== 0 ? " highlighted " + getBackgroundGradient(highlight, highlights) :
          (highlights && Object.keys(highlights).length > 0 ? " unhighlighted" : ""))}
          onClick={(evt) => updateSelected(evt, nodeId, parent)}>
          <NodeHeading nodeType={nodeType} nodeId={nodeId} currSelectedNode={currSelectedNode} name={name} depth={depth}
            ancestorSelected={ancestorSelected} />
        </Paper>
      }
      <Typography component={"div"} variant={"body2"}>
        {getInputList(nodeId).map((node) =>
          <div key={nodeId + node}>
            <SubNode nodeType={NODE_TYPE_INPUT}
              name={nodeToMeta[node]["name"]}
              key={nodeToMeta[node]["name"]}
              nodeId={node}
              highlight={node in highlights ? highlights[node] : 0}
              updateSelected={updateSelected}
              parent={parent}
              highlights={highlights}
              depth={nodeId === parent ? 0 : depth + 1}
              currSelectedNode={currSelectedNode}
              ancestorSelected={node === currSelectedNode}
            />
          </div>
        )}
        {props.children}
        {!props.children &&
          <VariantsList node={nodeId} currSelectedNode={currSelectedNode} inputType={nodeToMeta[nodeId]["type"]}
            updateSelected={updateSelected} parent={parent} depth={depth + 2} highlight={highlight} highlights={highlights} />
        }
      </Typography>
    </div>
  );
};

export const NodeHeading = (props) => {
  // Text for each graph node, including a gear icon, the node name, and optional variants dropdown icon
  const {nodeType, nodeId, currSelectedNode, name, depth=0, ancestorSelected=false} = props;
  const icon = getIcon(nodeType, {fontSize: "20px"}, nodeId === currSelectedNode);
  return (
    <Typography component="p"
      className={
        "node-heading" +
        ((nodeId === currSelectedNode) ? " selected-documentation-link" : "") +
        ((ancestorSelected) ? " selected-node-child" : "")
      }
    >
      <span style={{marginLeft: 10*depth+"px"}} className="graph-node-icon">{icon}</span>
      <span>{name}</span>
      {variants[nodeId] &&
        <span className="variants-dropdown"><ArrowDropDownIcon /></span>
      }
    </Typography>
  )
}

export const InputList = (props) => {
  // List of tools, materials, and variants used in graph node and documentation node
  const {currSelectedNode, parent, highlights, updateSelected, inDocumentation=false} = props;

  return (
    <div>
      <SubNode nodeType={NODE_TYPE_PARENT}
        name={nodeToMeta[parent]["name"]}
        key={nodeToMeta[parent]["name"]}
        nodeId={parent}
        highlight={inDocumentation === false && parent in highlights ? highlights[parent] : 0}
        updateSelected={updateSelected}
        parent={parent}
        showParent={inDocumentation}
        highlights={highlights}
        depth={0}
        currSelectedNode={currSelectedNode}
        ancestorSelected={false}
      />
    </div>
  )
}

export default InputList;
