import React from "react";
import ReactMarkdown from 'react-markdown'
import Typography from "@mui/material/Typography";

import mdxComponents from "../helpers/mdx_style";
import tooltips from "../helpers/tooltips";
import { VariantsList } from "./input_list";
import { nodeToMeta, variants } from "../../data/graph";
import { countryFlags } from "../../data/provision";
import ProviderListing from "./ProviderListing";
import ProviderTable from "./ProviderTable";
import ProviderGraph from "./ProviderGraph";

const InputDetail = (props) => {
  const {
    countries,
    description,
    orgs,
    orgMeta,
    parent,
    selectedNode,
    updateSelected=null,
    variantCountries,
    variantOrgs,
  } = props;

  const variantCountryList = Object.keys(variantCountries).map((country) => ({
    provider: country,
    flag: countryFlags[country],
    details: "Provides: " + variantCountries?.[country].map(e => nodeToMeta[e].name).join(", "),
  }));

  const orgList = Object.keys(orgs ?? {}).map(e => ({
    provider: orgMeta[e].name,
    flag: orgMeta[e].hq_flag,
  }));

  const variantOrgList = Object.keys(variantOrgs).map((org) => ({
    provider: orgMeta[org].name,
    flag: orgMeta[org].hq_flag,
    details: "Provides: " + variantOrgs?.[org].map(e => nodeToMeta[e].name).join(", "),
  }));

  return (
    <div className="input-detail" style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <ReactMarkdown components={mdxComponents}>{description}</ReactMarkdown>
      {nodeToMeta[selectedNode].total_market_size &&
        <Typography component="p">
          <span className="bold">Global market size: </span> {nodeToMeta[selectedNode].total_market_size}
        </Typography>
      }
      <ProviderGraph
        marketShareCaption={nodeToMeta[selectedNode].market_chart_caption}
        marketShareSource={nodeToMeta[selectedNode].market_chart_source}
        providers={countries}
        title="Supplier countries"
        tooltip={tooltips.providers.countries}
      />

      <ProviderListing isOrg={true} providers={orgs} providerMeta={orgMeta} variant={false} />
      <ProviderTable
        caption="Notable supplier companies (NEW B)"
        providers={orgList}
        tooltip={tooltips.providers.orgs}
      />
      {variants[selectedNode] &&
        <div>
          <VariantsList
            currSelectedNode={selectedNode}
            depth={0}
            inputType={nodeToMeta[selectedNode].type}
            node={selectedNode}
            parent={parent}
            updateSelected={updateSelected}
          />
          <ProviderListing isOrg={false} providers={countries} variantProviders={variantCountries} providerMeta={undefined} variant={true} />
          <ProviderTable
            caption="Supplier Countries (Variants) (NEW C)"
            providers={variantCountryList}
            tooltip={tooltips.providers.countries}
          />
          <ProviderListing isOrg={true} providers={orgs} variantProviders={variantOrgs} providerMeta={orgMeta} variant={true} />
          <ProviderTable
            caption="Notable supplier companies (Variants) (NEW D)"
            providers={variantOrgList}
            tooltip={tooltips.providers.orgs}
          />
        </div>
      }
    </div>
  )
};

export default InputDetail;
