import React from "react";
import ReactMarkdown from 'react-markdown'
import mdxComponents from "../helpers/mdx_style";
import ProviderListing from "./ProviderListing";


const ProcessDetail = (props) => {
  const {
    description,
    orgs,
    orgMeta,
  } = props;

  return (
    <div style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}} className="process-detail">
      <ReactMarkdown components={mdxComponents}>{description}</ReactMarkdown>
      <ProviderListing isOrg={true} providers={orgs} providerMeta={orgMeta} variant={false} />
    </div>
  )
};

export default ProcessDetail;
