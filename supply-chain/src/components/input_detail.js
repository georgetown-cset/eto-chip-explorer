import React from "react";
import Loadable from "react-loadable";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import mdxComponents from "../helpers/mdx_style";
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
    orientation: "h"
  }];

  return (
    <div>
    <Plot style={{height: "450px", width: "100%"}}
      data={data}
      layout={{
        autosize: true,
        margin: {t: 30, r: 30, b: 30, l: 120, pad: 4},
        font: {
          family: "GTZirkonRegular, Arial"
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      }}
      config={{responsive: true}}
    />
    </div>
  );
};

const InputDetail = (props) => {
  const {selectedNode, descriptions, countries, countryValues, orgs, orgMeta} = props;
  const orgNames = orgs === undefined ? [] : Object.keys(orgs);

  const graphCountries = [];
  const graphCountryValues = [];
  const undefinedProvisionCountries = [];
  const hasCountries = (countries !== null) && (countryValues !== null) &&
    (countries !== undefined) && (countryValues !== undefined);
  if(hasCountries) {
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
    filteredOrgNames.sort((a, b) => {
      const a_fmt = orgMeta[a]["hq"] ? orgMeta[a]["hq"] + orgMeta[a]["name"] : orgMeta[a]["name"];
      const b_fmt = orgMeta[b]["hq"] ? orgMeta[b]["hq"] + orgMeta[b]["name"] : orgMeta[b]["name"];
      if(a_fmt > b_fmt){
        return 1;
      } else if(b_fmt > a_fmt){
        return -1;
      }
      return 0;
    });
    const rows = [];
    for(let idx = 0; idx < filteredOrgNames.length; idx += 2){
      const rowOrgs = [filteredOrgNames[idx]];
      if(idx+1 < filteredOrgNames.length){
        rowOrgs.push(filteredOrgNames[idx+1])
      }
      rows.push(
        <tr key={rowOrgs.join("-")}>
          {rowOrgs.map((org) => (
          <td key={org}>
            <Typography component="p">
              {orgMeta[org]["hq"] && <span className="flag">{orgMeta[org]["hq"]}</span>}
              <Link target={"_blank"} rel={"noopener"} href={orgMeta[org]["url"]}>
                {orgMeta[org]["name"]}
              </Link>{orgs[org] !== "Major" && <span> ({orgs[org]} provider)</span>}
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
    <div style={{display: "inline-block", padding: "0px 40px", textAlign: "left"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      {(orgs !== undefined) &&
        <div>
          <Typography component={"p"} variant={"h6"} className="provision-heading" style={{marginBottom: "10px"}}>
            Provider Organizations
          </Typography>
          <table>
            <tbody>
              {mkOrgTableRows()}
            </tbody>
          </table>
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
    </div>
  )
};

export default InputDetail;
