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
  const {countries, values} = props;

  const data = [{
    x: values,
    y: countries,
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
        yaxis: {
          categoryorder: "total ascending"
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

const InputDetail = (props) => {
  const {selectedNode, descriptions, countries, countryValues, orgs, orgMeta, updateSelected=null, parent,
    variantCountries, variantOrgs} = props;
  const orgNames = orgs === undefined ? [] : Object.keys(orgs);

  const graphCountries = [];
  const graphCountryValues = [];
  const undefinedProvisionCountries = [];
  const hasCountries = (countries !== null) && (countryValues !== null) &&
    (countries !== undefined) && (countryValues !== undefined);
  if (hasCountries) {
    for (let i = 0; i < countries.length; i++) {
      if (typeof countryValues[i] !== "number") {
        undefinedProvisionCountries.push({
          country: countries[i],
          countryValue: countryValues[i]
        });
      } else {
        graphCountries.push(countries[i]);
        graphCountryValues.push(countryValues[i]);
      }
    }
  }

  const mkOrgTableRows = () => {
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
                {countryInfo.country}{countryInfo.countryValue !== "Major" && <span> ({countryInfo.countryValue})</span>}
              </Typography>
            </td>
          ))}
        </tr>
      )
    }
    return rows;
  };

  return (
    <div className="input-detail" style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      {variants[selectedNode] &&
        <div>
          <VariantsList node={selectedNode} currSelectedNode={selectedNode} inputType={nodeToMeta[selectedNode].type}
            updateSelected={updateSelected} parent={parent} />
          {Object.keys(variantCountries).length > 0 &&
            <div>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Country Provision
              </Typography>
                {Object.entries(variantCountries).map(([country, countryVariants]) =>
                  <Typography component="p">
                    {countryFlags[country] && <span className="flag">{countryFlags[country]}</span>}
                    {country} ({countryVariants.map(e => nodeToMeta[e].name).join(", ")})
                  </Typography>
                )}
            </div>
          }
          {Object.keys(variantOrgs).length > 0 &&
            <div>
              <Typography component={"p"} variant={"h6"} className="provision-heading">
                Notable supplier companies
              </Typography>
              {Object.entries(variantOrgs).map(([org, orgVariants]) =>
                <Typography component="p">
                  <span className="flag">{orgMeta[org]["hq_flag"]}</span>
                  {orgMeta[org].name} ({orgVariants.map(e => nodeToMeta[e].name).join(", ")})
                </Typography>
              )}
            </div>
          }
        </div>
      }
      {hasCountries &&
        <div>
          {(graphCountries.length > 0 || undefinedProvisionCountries.length > 0) &&
            <Typography component={"p"} variant={"h6"} className="provision-heading" style={{marginBottom: "10px"}}>
              Country Provision
            </Typography>
          }
          {graphCountries.length > 0 &&
            <BarGraph countries={graphCountries} values={graphCountryValues}/>
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
};

export default InputDetail;
