import React, { useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {nodeToMeta} from "../../data/graph";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import mdxComponents from "../helpers/mdx_style";
import getIcon from "../helpers/shared";
import GraphNode from "./graph_node";


const ProcessDetail = (props) => {
  const {selectedNode, descriptions, highlights, setSelectedNode} = props;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const inputStyle={padding: "5px", margin: "5px 0px"};
  const iconStyle={verticalAlign: "middle", margin: "2px 5px"}
  const hasMaterials = ("materials" in nodeToMeta[selectedNode]) && (nodeToMeta[selectedNode]["materials"].length > 0);
  const hasTools = ("tools" in nodeToMeta[selectedNode]) && (nodeToMeta[selectedNode]["tools"].length > 0);

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      {hasMaterials && hasTools && <Typography component={"div"} variant={"h5"}>Inputs</Typography>}
      {hasMaterials &&
      <div>
        {nodeToMeta[selectedNode]["materials"].map((node) =>
          <GraphNode node={node} highlights={highlights} currSelectedNode={selectedNode} setSelected={setSelectedNode}
              nodeToMeta={nodeToMeta} wide={true} key={node}
              content={<p style={{textAlign: "left"}}>{getIcon("materials", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
        )}
      </div>}
      {hasTools &&
      <div>
        {nodeToMeta[selectedNode]["tools"].map((node) =>
          <GraphNode node={node} highlights={highlights} currSelectedNode={selectedNode} setSelected={setSelectedNode}
              nodeToMeta={nodeToMeta} wide={true} key={node}
              content={<p style={{textAlign: "left"}}>{getIcon("tools", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
        )}
      </div>}
    </div>
  )
};

export default ProcessDetail;
