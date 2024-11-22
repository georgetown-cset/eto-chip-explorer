import React, { Suspense, lazy } from "react";
import ReactMarkdown from 'react-markdown'
import Typography from "@mui/material/Typography";
import { MoreHoriz as MoreHorzIcon } from "@mui/icons-material";

import {HelpTooltip, PlotlyDefaults} from "@eto/eto-ui-components";

import mdxComponents from "../helpers/mdx_style";
import { VariantsList } from "./input_list";
import { nodeToMeta, variants } from "../../data/graph";
import { countryFlags } from "../../data/provision";

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

export const ProviderListing = (props) => {
  const {isOrg, providers, variantProviders=undefined, providerMeta, variant} = props;

  // Order table rows so items show up
  // alphabetically vertically
  const _mkOrderedTableRows = (items) => {
    const numRows = Math.ceil(items.length/2);
    const rows = [];
    for(let idx = 0; idx < numRows; idx += 1){
      const rowItems = [items[idx]];
      if(numRows + idx < items.length){
        rowItems.push(items[numRows + idx])
      }
      rows.push(rowItems);
    }
    return rows
  }

  const mkOrgTableRows = () => {
    let orgNodes;
    // Get correct list of org nodes
    if (variant === true) {
      orgNodes = Object.keys(variantProviders);
    } else {
      orgNodes = providers === undefined ? [] : Object.keys(providers);
    }
    // Filter and reorder the list of orgs
    const filteredOrgNodes = orgNodes.filter(org => org in providerMeta);
    filteredOrgNodes.sort((a, b) => ('' + providerMeta[a]["name"].toLowerCase()).localeCompare(providerMeta[b]["name"].toLowerCase()));
    const orderedTableRows = _mkOrderedTableRows(filteredOrgNodes);
    // Construct the table
    const rows = [];
    orderedTableRows.forEach(rowOrgs => {
      rows.push(
        <tr key={rowOrgs.join("-")}>
          {rowOrgs.map((org) => (
          <td key={org}>
            <Typography component="p">
              {providerMeta[org]["hq_flag"] &&
                <HelpTooltip text={providerMeta[org]["hq_country"]}><span className="flag">{providerMeta[org]["hq_flag"]}</span></HelpTooltip>}
              {providerMeta[org]["name"]}
              {!variant && providers[org] !== "Major" && <span> ({providers[org]} market share)</span>}
              {variant &&
                <HelpTooltip
                  text={"Provides: " + variantProviders[org].map(e => nodeToMeta[e].name).join(", ")}
                  Icon={MoreHorzIcon}
                />
              }
            </Typography>
          </td>
          ))}
        </tr>
      )
    });
    return rows;
  };

  const mkCountryTableRows = () => {
    let countryNodes;
    // Get correct, sorted list of country nodes
    if (variant === true) {
      countryNodes = Object.keys(variantProviders).sort();
    } else {
      countryNodes = providers.sort(
        (a, b) => (a.country.toLowerCase()).localeCompare(b.country.toLowerCase())
      );
    }
    const orderedTableRows = _mkOrderedTableRows(countryNodes);
    const rows = [];
    orderedTableRows.forEach(rowCountries => {
      rows.push(
        <tr key={JSON.stringify(rowCountries)}>
          {rowCountries.map((countryInfo) => {
            const countryName = variant ? countryInfo : countryInfo.country;
            return (
              <td key={countryName}>
                <Typography component="p" className="whereisthis">
                  {countryFlags[countryName] && <span className="flag">{countryFlags[countryName]}</span>}
                  {countryName}
                  {!variant && countryInfo.value !== "Major" && <span> ({countryInfo.value})</span>}
                  {variant &&
                    <HelpTooltip
                      text={"Provides: " + variantProviders[countryName].map(e => nodeToMeta[e].name).join(", ")}
                      Icon={MoreHorzIcon}
                    />
                  }
                </Typography>
              </td>
            )
          })}
        </tr>
      )
    })
    return rows;
  };

  const title = (isOrg ? "Notable supplier companies" : "Supplier Countries") + (variant ? " (Variants)" : "");
  const helpText = (
    <HelpTooltip
      smallIcon
      text={isOrg ?
        "Global companies with significant market share or otherwise notable capabilities." :
        "Countries with significant global market share."
      }
      iconStyle={{verticalAlign: "middle"}}
    />
  );

  const showTable = () => {
    return (variant === true) ? Object.keys(variantProviders).length > 0 : providers !== undefined
  }

  return (
    <div>
    {showTable() &&
      <div>
        <Typography component={"p"} variant={"h6"} className="provision-heading">
         {title}
         {helpText}
        </Typography>
        <table>
          <tbody>
            {isOrg ? mkOrgTableRows() : mkCountryTableRows()}
          </tbody>
        </table>
      </div>
    }
    </div>
  )
}

const InputDetail = (props) => {
  const {selectedNode, descriptions, countries, orgs, orgMeta, updateSelected=null, parent,
    variantCountries, variantOrgs} = props;

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

  return (
    <div className="input-detail" style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <ReactMarkdown components={mdxComponents}>{descriptions.filter(n => n.fields.slug === selectedNode)[0]?.body}</ReactMarkdown>
      {nodeToMeta[selectedNode].total_market_size &&
        <Typography component="p">
          <span className="bold">Global market size: </span> {nodeToMeta[selectedNode].total_market_size}
        </Typography>
      }
      {hasCountries &&
        <div>
          {graphCountries.length > 0 &&
            <div>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Supplier countries
                <HelpTooltip smallIcon text={"Countries with significant global market share."} iconStyle={{verticalAlign: "middle"}} />
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
            </div>
          }
          {graphCountries.length > 0 && undefinedProvisionCountries.length > 0 &&
            <Typography component={"p"} variant={"body2"} style={{marginTop: "20px"}}>
              Minor providers (not pictured): {undefinedProvisionCountries.map(c => c.country).join(", ")}
            </Typography>
          }
          {graphCountries.length === 0 && undefinedProvisionCountries.length > 0 &&
            <ProviderListing isOrg={false} providers={undefinedProvisionCountries} variantProviders={undefined} providerMeta={undefined} variant={false} />
          }
        </div>
      }
      <ProviderListing isOrg={true} providers={orgs} providerMeta={orgMeta} variant={false} />
      {variants[selectedNode] &&
        <div>
          <VariantsList node={selectedNode} currSelectedNode={selectedNode} inputType={nodeToMeta[selectedNode].type}
            updateSelected={updateSelected} parent={parent} depth={0} />
          <ProviderListing isOrg={false} providers={countries} variantProviders={variantCountries} providerMeta={undefined} variant={true} />
          <ProviderListing isOrg={true} providers={orgs} variantProviders={variantOrgs} providerMeta={orgMeta} variant={true} />
        </div>
      }
    </div>
  )
};

export default InputDetail;
