import React from "react";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import mdxComponents from "../helpers/mdx_style";


const ProcessDetail = (props) => {
  const {selectedNode, descriptions} = props;

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
    </div>
  )
};

export default ProcessDetail;
