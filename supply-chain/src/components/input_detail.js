import React, { Suspense, lazy } from "react";
import ReactMarkdown from 'react-markdown'
import Typography from "@mui/material/Typography";

import {HelpTooltip, PlotlyDefaults} from "@eto/eto-ui-components";

import mdxComponents from "../helpers/mdx_style";
import tooltips from "../helpers/tooltips";
import { VariantsList } from "./input_list";
import { nodeToMeta, variants } from "../../data/graph";
import { countryFlags } from "../../data/provision";
import ProviderListing from "./ProviderListing";
import ProviderTable from "./ProviderTable";

const Plot = lazy(() => import('react-plotly.js'));

const BarGraph = (props) => {
  const {countries} = props;

  countries.sort((a, b) => {
    // Country nodes for "Various" always go last
    if (a.country === "Various") {
      return -1;
    } else if (b.country === "Various") {
      return 1;
    // Otherwise, sort by value in descending order
    } else if (a.value > b.value) {
      return 1;
    } else if (b.value > a.value) {
      return -1;
    } else {
      return 0;
    }
  })

  const data = [{
    x: countries.map(e => e.value),
    y: countries.map(e => e.country),
    type: "bar",
    orientation: "h",
    hovertemplate: '%{x}%<extra></extra>',
  }];

  const plotlyDefaults = PlotlyDefaults();
  plotlyDefaults["layout"]["margin"] = {t: 25, r: 30, b: 40, l: 120, pad: 4};
  plotlyDefaults["layout"]["xaxis"]["title"] = "Share of global market";

  return (
    <div style={{paddingBottom: "10px"}}>
      <Suspense fallback={<div>Loading graph...</div>}>
        <Plot style={{height: "450px", width: "100%"}}
          data={data}
          layout={plotlyDefaults.layout}
          config={plotlyDefaults.config}
        />
      </Suspense>
    </div>
  );
};


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

  const graphCountries = [];
  const undefinedProvisionCountries = [];
  const hasCountries = (countries !== null) && (countries !== undefined) && (countries.length > 0);
  if (hasCountries) {
    for (let i = 0; i < countries.length; i++) {
      if (typeof countries[i].value !== "number") {
        undefinedProvisionCountries.push({
          country: countries[i].country,
          value: countries[i].value
        });
      } else {
        graphCountries.push(countries[i]);
      }
    }
  }

  const countryList = undefinedProvisionCountries.map(({country}) => ({
    provider: country,
    flag: countryFlags[country],
  }));

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
      {hasCountries &&
        <div className="country-graph-wrapper">
          {graphCountries.length > 0 &&
            <>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Supplier countries
                <HelpTooltip smallIcon text={tooltips.providers.countries} iconStyle={{verticalAlign: "middle"}} />
              </Typography>
              <BarGraph countries={graphCountries}/>
              {nodeToMeta[selectedNode].market_chart_caption &&
                <div className="caption"> <b>Note: </b> {nodeToMeta[selectedNode].market_chart_caption}</div>
              }
              {nodeToMeta[selectedNode].market_chart_source &&
                <div className="caption"> <b>Source: </b>
                  <span dangerouslySetInnerHTML={{__html: nodeToMeta[selectedNode].market_chart_source}} />
                </div>
              }
            </>
          }
          {graphCountries.length > 0 && undefinedProvisionCountries.length > 0 &&
            <Typography component={"p"} variant={"body2"} style={{marginTop: "20px"}}>
              Minor providers (not pictured): {undefinedProvisionCountries.map(c => c.country).join(", ")}
            </Typography>
          }
          {graphCountries.length === 0 && undefinedProvisionCountries.length > 0 && <>
            <ProviderListing isOrg={false} providers={undefinedProvisionCountries} variantProviders={undefined} providerMeta={undefined} variant={false} />
            <ProviderTable
              caption="Supplier Countries (NEW A)"
              providers={countryList}
              tooltip={tooltips.providers.countries}
            />
            </>
          }
        </div>
      }
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
