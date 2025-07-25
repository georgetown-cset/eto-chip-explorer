import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import StarIcon from '@mui/icons-material/Star';
import {graph, graphReverse, nodeToMeta} from "../../data/graph";
import {processNodesWithOrgProvision} from "../../data/provision";

import { allSubVariantsList, FILTER_CONCENTRATION, FILTER_COUNTRY, FILTER_ORG, getBackgroundGradient } from "../helpers/shared";
import DocumentationNode from "./documentation_node";
import InputList from "./input_list";

const GraphNode = (props) => {
  const {node, highlights = {}, currSelectedNode, parent, updateSelected, pdfs, wide=false, content=null, inDocumentation=false,
    descriptions=null, images=null, highlighterFilter} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

  const getHighlightClass = () => {
    if (node in highlights && highlights[node] !== 0) {
      return " highlighted " + getBackgroundGradient(highlights[node], highlights);
    } else if ((highlighterFilter === FILTER_CONCENTRATION) || (highlighterFilter === FILTER_COUNTRY)) {
      return " not-applicable";
    } else if (highlighterFilter === FILTER_ORG && !processNodesWithOrgProvision.includes(node)) {
      return " not-applicable";
    } else if (Object.keys(highlights).length > 0) {
      return " unhighlighted";
    } else {
      return "";
    }
  }

  return (
    <div className="graph-node-wrapper">
      <Paper id={node} className={"graph-node" + getHighlightClass()}
        style={{
          margin: wide ? "" : "20px 25px",
          marginBottom: node === currSelectedNode ? "0px" : (wide ? "" : "20px"),
          display: "inline-block",
          width: wide ? "": "320px",
        }}
        elevation={0}
      >
        <div style={{textAlign: "left"}}>
          <div onClick={(evt) => updateSelected(evt, node, inDocumentation ? parent : node)}>
            {content !== null && content}
            {content === null &&
              <Typography component="h3">
                {meta["name"]}
              </Typography>
            }
          </div>
          {!inDocumentation &&
            <div className="graph-node-connections-text">
              {graphReverse[node] &&
                <div className="connection-text">
                  <span className="bold">
                    Input processes:
                  </span>
                  <span>
                    {graphReverse[node].map((n) => nodeToMeta[n].name).join(", ")}
                  </span>
                </div>
              }
              {graph[node] &&
                <div className="connection-text">
                  <span className="bold">
                    Dependent processes:
                  </span>
                  <span>
                    {graph[node].map((n) => nodeToMeta[n].name).join(", ")}
                  </span>
                </div>
              }
            </div>
          }
          <InputList
            currSelectedNode={currSelectedNode}
            parent={node}
            highlights={highlights}
            updateSelected={updateSelected}
            inDocumentation={false}
          />
        </div>
      </Paper>
      {!inDocumentation && node === parent &&
        <div>
          <ArrowDropDownIcon
            style={{
              display: "block",
              marginTop: node === currSelectedNode ? "-17px" : "-37px",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "40px",
              zIndex: "5",
            }}
          />
          <div className="documentation-node-mobile">
            <DocumentationNode
              currSelectedNode={currSelectedNode}
              description={descriptions.filter(n => n.fields.slug === currSelectedNode)[0]?.body}
              images={images}
              isStage={false}
              node={currSelectedNode}
              parent={parent}
              pdfs={pdfs}
              updateSelected={updateSelected}
            />
          </div>
        </div>
      }
    </div>
  )
};

export const MiniGraphNode = (props) => {
  const {node, currSelectedNode, parent, standalone=false} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

  let isVariant = false;
  for (const inputNode of meta["materials"]) {
    if (allSubVariantsList[inputNode]?.includes(currSelectedNode)) {
      isVariant = true;
      break;
    }
  }
  for (const inputNode of meta["tools"]) {
    if (isVariant === true) {
      break;
    } else if (allSubVariantsList[inputNode]?.includes(currSelectedNode)) {
      isVariant = true;
      break;
    }
  }

  return (
    <div id={`${node}-minimap` + (standalone ? "-standalone" : "") } className={`graph-node ${node === parent ? "minimap-dark" : "minimap-light"}`}
      style={{
        margin: "5px",
        display: "inline-block",
        height: "10px",
        width: "20px",
        verticalAlign: "middle"
      }}
    >
      {(meta["materials"]?.includes(currSelectedNode) ||
          meta["tools"]?.includes(currSelectedNode) ||
          isVariant ||
          (node === parent && node !== currSelectedNode)) &&
        <span className="star-icon">
          <StarIcon
            style={{
              display: "inline-block",
              fontSize: "10px",
              verticalAlign: "top"
            }}
          />
        </span>
      }
    </div>
  )
};

export default GraphNode;
