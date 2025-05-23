import React from "react";
import ReactMarkdown from 'react-markdown'
import mdxComponents from "../helpers/mdx_style";
import ProviderTable from "./ProviderTable";
import tooltips from "../helpers/tooltips";

export interface ProcessDetailProps {
  description: string;
  orgs: Record<string, number|string>;
  orgMeta: Record<string, {
    name: string;
    type: string;
    hq_flag: string;
    hq_country: string;
  }>;
}

const ProcessDetail = ({
  description,
  orgs = {},
  orgMeta,
}: ProcessDetailProps) => {
  const orgList = Object.keys(orgs).map(org => ({
    provider: orgMeta[org].name,
    flag: orgMeta[org].hq_flag,
  }));

  return (
    <div
      style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}
      className="process-detail"
    >
      <ReactMarkdown components={mdxComponents}>{description}</ReactMarkdown>
      <ProviderTable
        caption="Notable supplier companies"
        providers={orgList}
        tooltip={tooltips.providers.orgs}
      />
    </div>
  )
};

export default ProcessDetail;
