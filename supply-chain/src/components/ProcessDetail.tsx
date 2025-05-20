import React from "react";
import ReactMarkdown from 'react-markdown'
import mdxComponents from "../helpers/mdx_style";
import ProviderListing from "./ProviderListing";
import ProviderTable from "./ProviderTable";
import tooltips from "../helpers/tooltips";


const ProcessDetail = (props) => {
  const {
    description,
    orgs,
    orgMeta,
  } = props;

  const orgList = Object.keys(orgs ?? {}).map(org => ({
    provider: orgMeta[org].name,
    flag: orgMeta[org].hq_flag,
  }));

  return (
    <div style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}} className="process-detail">
      <ReactMarkdown components={mdxComponents}>{description}</ReactMarkdown>
      <ProviderListing isOrg={true} providers={orgs} providerMeta={orgMeta} variant={false} />
      <ProviderTable
        caption="Notable supplier companies (NEW)"
        providers={orgList}
        tooltip={tooltips.providers.orgs}
      />
    </div>
  )
};

export default ProcessDetail;
