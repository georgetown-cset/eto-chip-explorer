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
    <div>
    <Plot style={{height: "450px", width: "100%"}}
      data={data}
      layout={{
        autosize: true,
        margin: {t: 30, r: 30, b: 35, l: 120, pad: 4},
        xaxis: {
          title: "Share of global market"
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

export const OrgListing = (props) => {
  const {orgs, orgMeta} = props;

  const mkOrgTableRows = () => {
    const orgNames = orgs === undefined ? [] : Object.keys(orgs);
    const filteredOrgNames = orgNames.filter(org => org in orgMeta);
    filteredOrgNames.sort((a, b) => ('' + orgMeta[a]["name"].toLowerCase()).localeCompare(orgMeta[b]["name"].toLowerCase()));
    const numRows = Math.ceil(filteredOrgNames.length/2);
    const rows = [];
    for(let idx = 0; idx < numRows; idx += 1){
      const rowOrgs = [filteredOrgNames[idx]];
      if(numRows + idx < filteredOrgNames.length){
        rowOrgs.push(filteredOrgNames[numRows + idx])
      }
      rows.push(
        <tr key={rowOrgs.join("-")}>
          {rowOrgs.map((org) => (
          <td key={org}>
            <Typography component="p">
              {orgMeta[org]["hq_flag"] && <HelpTooltip text={orgMeta[org]["hq_country"]}><span className="flag">{orgMeta[org]["hq_flag"]}</span></HelpTooltip>}
              {orgMeta[org]["name"]}
              {orgs[org] !== "Major" && <span> ({orgs[org]} market share)</span>}
            </Typography>
          </td>
          ))}
        </tr>
      )
    }
    return rows;
  };

  return (
    <div>
    {(orgs !== undefined) &&
      <div>
        <Typography component={"p"} variant={"h6"} className="provision-heading" style={{marginBottom: "10px"}}>
         Notable supplier companies
        </Typography>
        <table>
          <tbody>
            {mkOrgTableRows()}
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
  const orgNames = orgs === undefined ? [] : Object.keys(orgs);

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

  const mkCountryTableRows = () => {
    const rows = [];
    for (let idx = 0; idx < undefinedProvisionCountries.length; idx += 2){
      const rowCountryInfos = [undefinedProvisionCountries[idx]];
      if(idx+1 < undefinedProvisionCountries.length){
        rowCountryInfos.push(undefinedProvisionCountries[idx+1])
      }
      rows.push(
        <tr key={idx}>
          {rowCountryInfos.map((countryInfo) => (
            <td key={countryInfo.country}>
              <Typography component="p">
                {countryFlags[countryInfo.country] && <span className="flag">{countryFlags[countryInfo.country]}</span>}
                {countryInfo.country}{countryInfo.value !== "Major" && <span> ({countryInfo.value})</span>}
              </Typography>
            </td>
          ))}
        </tr>
      )
    }
    return rows;
  };

  const mkVariantCountryTableRows = () => {
    const rows = [];
    const variantCountryNames = Object.keys(variantCountries).sort();
    for (let idx = 0; idx < variantCountryNames.length; idx += 2){
      const rowCountryInfos = [variantCountryNames[idx]];
      if(idx+1 < variantCountryNames.length){
        rowCountryInfos.push(variantCountryNames[idx+1])
      }
      rows.push(
        <tr key={idx}>
          {rowCountryInfos.map((country) => (
            <td key={country}>
              <Typography component="p">
                {countryFlags[country] && <span className="flag">{countryFlags[country]}</span>}
                {country} &nbsp;
                <HelpTooltip iconType="more-info" text={"Provides: " + variantCountries[country].map(e => nodeToMeta[e].name).join(", ")} />
              </Typography>
            </td>
          ))}
        </tr>
      )
    }
    return rows;
  }

  const mkVariantOrgTableRows = () => {
    const rows = [];
    const variantOrgNames = Object.keys(variantOrgs).sort(
      (a, b) => ('' + orgMeta[a]["name"].toLowerCase()).localeCompare(orgMeta[b]["name"].toLowerCase()));
    for (let idx = 0; idx < variantOrgNames.length; idx += 2){
      const rowOrgs = [variantOrgNames[idx]];
      if(idx+1 < variantOrgNames.length){
        rowOrgs.push(variantOrgNames[idx+1])
      }
      rows.push(
        <tr key={idx}>
          {rowOrgs.map((org) => (
            <td key={org}>
              <Typography component="p">
                {orgMeta[org]["hq_flag"] && <HelpTooltip text={orgMeta[org]["hq_country"]}><span className="flag">{orgMeta[org]["hq_flag"]}</span></HelpTooltip>}
                {orgMeta[org].name} &nbsp;
                <HelpTooltip iconType="more-info" text={"Provides: " + variantOrgs[org].map(e => nodeToMeta[e].name).join(", ")} />
              </Typography>
            </td>
          ))}
        </tr>
      )
    }
    return rows;
  }

  return (
    <div className="input-detail" style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0]?.body}</MDXRenderer>
      </MDXProvider>
      {nodeToMeta[selectedNode].total_market_size &&
        <Typography component="p">
          Global market size: {nodeToMeta[selectedNode].total_market_size}.
        </Typography>
      }
      {variants[selectedNode] &&
        <div>
          <VariantsList node={selectedNode} currSelectedNode={selectedNode} inputType={nodeToMeta[selectedNode].type}
            updateSelected={updateSelected} parent={parent} />
          {Object.keys(variantCountries).length > 0 &&
            <div>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Country Provision (Variants)
              </Typography>
              <table>
                <tbody>
                  {mkVariantCountryTableRows()}
                </tbody>
              </table>
            </div>
          }
          {Object.keys(variantOrgs).length > 0 &&
            <div>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Notable supplier companies (Variants)
              </Typography>
              <table>
                <tbody>
                  {mkVariantOrgTableRows()}
                </tbody>
              </table>
            </div>
          }
        </div>
      }
      {hasCountries &&
        <div>
          {(graphCountries.length > 0 || undefinedProvisionCountries.length > 0) &&
            <Typography component={"p"} variant={"h6"} className="provision-heading" style={{marginBottom: "10px"}}>
              Supplier countries
            </Typography>
          }
          {graphCountries.length > 0 &&
            <div>
              <BarGraph countries={graphCountries}/>
              {nodeToMeta[selectedNode].market_chart_caption &&
                <span className="caption"> <b>Note: </b> {nodeToMeta[selectedNode].market_chart_caption}</span>
              }
              {nodeToMeta[selectedNode].market_chart_source &&
                <span className="caption"> <b>Source: </b>
                  <span dangerouslySetInnerHTML={{__html: nodeToMeta[selectedNode].market_chart_source}} />
                </span>
              }
            </div>
          }
          {graphCountries.length > 0 && undefinedProvisionCountries.length > 0 &&
            <Typography component={"p"} variant={"body2"} style={{marginTop: "20px"}}>
              Minor providers (not pictured): {undefinedProvisionCountries.map(c => c.country).join(", ")}
            </Typography>
          }
          {graphCountries.length === 0 && undefinedProvisionCountries.length > 0 &&
            <table>
              <tbody>
                {mkCountryTableRows()}
              </tbody>
            </table>
          }
        </div>
      }
      <OrgListing orgs={orgs} orgMeta={orgMeta} />
    </div>
  )
};

export default InputDetail;
