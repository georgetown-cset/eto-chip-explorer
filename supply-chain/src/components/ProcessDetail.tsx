import React from "react";
import Typography from "@mui/material/Typography";
import ReactMarkdown from 'react-markdown'

import { nodeToMeta } from "../../data/graph";
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
  selectedNode: string;
}

const ProcessDetail = ({
  description,
  orgs = {},
  orgMeta,
  selectedNode,
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
      {nodeToMeta[selectedNode]?.total_market_size &&
        <Typography component="p">
          <span className="bold">Global market size: </span> {nodeToMeta[selectedNode].total_market_size}
        </Typography>
      }
      <ProviderTable
        caption="Notable supplier companies"
        providers={orgList}
        tooltip={tooltips.providers.orgs}
      />
    </div>
  )
};

export default ProcessDetail;
