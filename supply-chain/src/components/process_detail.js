import React from "react";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import mdxComponents from "../helpers/mdx_style";
import { OrgListing } from "./input_detail";


const ProcessDetail = (props) => {
  const {selectedNode, descriptions, orgs, orgMeta} = props;

  return (
    <div style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      <OrgListing orgs={orgs} orgMeta={orgMeta} />
    </div>
  )
};

export default ProcessDetail;
