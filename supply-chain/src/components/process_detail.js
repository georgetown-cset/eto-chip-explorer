import React from "react";
import Typography from "@mui/material/Typography";
import {nodeToMeta} from "../../data/graph";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import GraphNode from "./graph_node";


const ProcessDetail = (props) => {
  const {selectedNode, descriptions} = props;

  /*const mkNodeGraph = () => {
    return <div>
      <div style={{width: "33%", display: "inline-block", verticalAlign: "middle"}}>
        {nodeToMeta[selectedNode]["materials"].map((node) =>
          <GraphNode node={node} meta={nodeToMeta[node]}
                   unattached={false} description={data.allMdx.nodes.filter(n => n.slug === node)[0].body}
                   setSelected={setSelectedNode}/>
        )}
      </div>
      <div style={{width: "33%", display: "inline-block", verticalAlign: "middle"}}>
        <GraphNode node={selectedNode} meta={nodeToMeta[selectedNode]} expanded={true}
                   unattached={false} description={data.allMdx.nodes.filter(n => n.slug === selectedNode)[0].body}
                   setSelected={setSelectedNode} />
      </div>
      <div style={{width: "33%", display: "inline-block", verticalAlign: "middle"}}>
        {nodeToMeta[selectedNode]["tools"].map((node) =>
          <GraphNode node={node} meta={nodeToMeta[node]}
                   unattached={false} description={data.allMdx.nodes.filter(n => n.slug === node)[0].body}
                   setSelected={setSelectedNode}/>
        )}
      </div>
    </div>
  }*/

  return (
    <div style={{width: "49%", display: "inline-block"}}>
      <MDXProvider>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
    </div>
  )
};

export default ProcessDetail;
