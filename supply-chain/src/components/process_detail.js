import React from "react";
import ReactMarkdown from 'react-markdown'
import mdxComponents from "../helpers/mdx_style";
import { ProviderListing } from "./input_detail";


const ProcessDetail = (props) => {
  const {selectedNode, descriptions, orgs, orgMeta} = props;

  return (
    <div style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}} className="process-detail">
      <ReactMarkdown components={mdxComponents}>{descriptions.filter(n => n.fields.slug === selectedNode)[0]?.body}</ReactMarkdown>
      <ProviderListing isOrg={true} providers={orgs} providerMeta={orgMeta} variant={false} />
    </div>
  )
};

export default ProcessDetail;
