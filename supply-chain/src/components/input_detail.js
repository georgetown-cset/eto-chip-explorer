import React from "react";
import Loadable from "react-loadable";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import HelpTooltip from "@eto/eto-ui-components/dist/components/HelpTooltip";
import Typography from "@mui/material/Typography";
import mdxComponents from "../helpers/mdx_style";
import { VariantsList } from "./documentation_node";
import { nodeToMeta, variants } from "../../data/graph";
import { countryFlags } from "../../data/provision";

const Plot = Loadable({
  loader: () => import("react-plotly.js"),
  loading: ({ timedOut }) =>
    timedOut ? (
      <blockquote>Error: Loading Plotly timed out.</blockquote>
    ) : (
      <div></div>
    ),
  timeout: 10000,
});

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

  return (
    <div style={{paddingBottom: "10px"}}>
    <Plot style={{height: "450px", width: "100%"}}
      data={data}
      layout={{
        autosize: true,
        margin: {t: 25, r: 30, b: 40, l: 120, pad: 4},
        xaxis: {
          fixedrange: true,
          title: "Share of global market"
        },
        yaxis: {
          fixedrange: true,
        },
        font: {
          family: "GTZirkonRegular, Arial"
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      }}
      config={{
        displayModeBar: false,
        responsive: true
      }}
    />
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
                <HelpTooltip iconType="more-info" text={"Provides: " + variantProviders[org].map(e => nodeToMeta[e].name).join(", ")} />
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
                <Typography component="p">
                  {countryFlags[countryName] && <span className="flag">{countryFlags[countryName]}</span>}
                  {countryName}
                  {!variant && countryInfo.value !== "Major" && <span> ({countryInfo.value})</span>}
                  {variant &&
                    <HelpTooltip iconType="more-info" text={"Provides: " + variantProviders[countryName].map(e => nodeToMeta[e].name).join(", ")} />
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

  const showTable = () => {
    return (variant === true) ? Object.keys(variantProviders).length > 0 : providers !== undefined
  }

  return (
    <div>
    {showTable() &&
      <div>
        <Typography component={"p"} variant={"h6"} className="provision-heading">
         {title}
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
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0]?.body}</MDXRenderer>
      </MDXProvider>
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
            updateSelected={updateSelected} parent={parent} />
          <ProviderListing isOrg={false} providers={countries} variantProviders={variantCountries} providerMeta={undefined} variant={true} />
          <ProviderListing isOrg={true} providers={orgs} variantProviders={variantOrgs} providerMeta={orgMeta} variant={true} />
        </div>
      }
    </div>
  )
};

export default InputDetail;
