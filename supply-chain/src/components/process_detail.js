import React from "react";
import Typography from "@mui/material/Typography";
import {nodeToMeta} from "../../data/graph";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";

const ProcessDetail = (props) => {
  const {selectedNode, descriptions} = props;

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      {"materials" in nodeToMeta[selectedNode] && (nodeToMeta[selectedNode]["materials"].length > 0) &&
      <div>
        <Typography component={"p"} variant={"h6"}>Material Components</Typography>
        {nodeToMeta[selectedNode]["materials"].map((node) =>
          <div>
            <MDXProvider>
              <MDXRenderer>{descriptions.filter(n => n.slug === node)[0].body}</MDXRenderer>
            </MDXProvider>
          </div>
        )}
      </div>}
      {"tools" in nodeToMeta[selectedNode] && (nodeToMeta[selectedNode]["tools"].length > 0) &&
      <div>
        <Typography component={"p"} variant={"h6"}>Tools</Typography>
        {nodeToMeta[selectedNode]["tools"].map((node) =>
          <div>
            <MDXProvider>
              <MDXRenderer>{descriptions.filter(n => n.slug === node)[0].body}</MDXRenderer>
            </MDXProvider>
          </div>
        )}
      </div>}
    </div>
  )
};

export default ProcessDetail;
