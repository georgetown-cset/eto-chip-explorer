import React from "react";
import ReactMarkdown from 'react-markdown'
import Typography from "@mui/material/Typography";
import {
  CorporateFare as CorporateFareIcon,
  Public as PublicIcon,
} from "@mui/icons-material";

import mdxComponents from "../helpers/mdx_style";
import tooltips from "../helpers/tooltips";
import { VariantsList } from "./input_list";
import { nodeToMeta, variants } from "../../data/graph";
import { countryFlags } from "../../data/provision";
import ProviderTable from "./ProviderTable";
import ProviderGraph from "./ProviderGraph";

const InputDetail = (props) => {
  const {
    countries = [],
    description,
    orgs,
    orgMeta,
    parent,
    selectedNode,
    updateSelected=null,
    variantCountries,
    variantOrgs,
  } = props;

  const countryList = countries.map(({ country, value }) => ({
    provider: country,
    flag: countryFlags[country],
    value,
  }));

  const variantCountryList = Object.keys(variantCountries).map((country) => ({
    provider: country,
    flag: countryFlags[country],
    details: variantCountries?.[country].map(e => nodeToMeta[e].name).join(", "),
  }));

  const orgList = Object.entries(orgs ?? {}).map(([orgId, value]) => ({
    provider: orgMeta[orgId].name,
    flag: orgMeta[orgId].hq_flag,
    value,
  }));

  const variantOrgList = Object.keys(variantOrgs)
    .map((org) => ({
      provider: orgMeta[org].name,
      flag: orgMeta[org].hq_flag,
      details: variantOrgs?.[org].map(e => nodeToMeta[e].name).join(", "),
    }))
    .filter(orgObj => !orgObj.provider.startsWith("Various"));

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
        providers={countryList}
        title={<><PublicIcon /> Supplier countries</>}
        tooltip={tooltips.providers.countries}
      />

      <ProviderGraph
        marketShareCaption={nodeToMeta[selectedNode].market_chart_caption}
        marketShareSource={nodeToMeta[selectedNode].market_chart_source}
        providers={orgList}
        title={ <><CorporateFareIcon /> Supplier companies</> }
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
          <ProviderTable
            caption={<><PublicIcon /> Supplier countries</>}
            providers={variantCountryList}
            tooltip={tooltips.providers.countries}
          />
          <ProviderTable
            caption={ <><CorporateFareIcon /> Supplier companies</> }
            providers={variantOrgList}
            tooltip={tooltips.providers.orgs}
          />
        </div>
      }
    </div>
  )
};

export default InputDetail;
