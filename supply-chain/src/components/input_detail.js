import React, { useEffect } from "react";
import Loadable from "react-loadable";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import mdxComponents from "../helpers/mdx_style";
import getIcon from "../helpers/shared";
import GraphNode from "./graph_node";
import {nodeToMeta} from "../../data/graph";

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
    x: countries,
    y: values,
    type: "bar"
  }];

  return (
    <div>
    <Plot style={{height: "450px", width: "100%"}}
      data={data}
      layout={{autosize: true, margin: {t: 50, r: 50, b: 100, l: 50, pad: 4}, title: "Country Provision"}}
      config={{responsive: true}}
    />
    </div>
  );
};

const InputDetail = (props) => {
  const {selectedNode, descriptions, countries, countryValues, orgs, orgMeta, variants, variantOf, setSelectedNode} = props;
  const orgNames = orgs === undefined ? [] : Object.keys(orgs);
  const iconStyle={verticalAlign: "middle", margin: "2px 5px"};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const graphCountries = [];
  const graphCountryValues = [];
  const undefinedProvisionCountries = [];
  const hasCountries = (countries !== null) && (countryValues !== null);
  if(hasCountries) {
    for (let i = 0; i < countries.length; i++) {
      if (typeof countryValues[i] !== "number") {
        undefinedProvisionCountries.push(countries[i]+" ("+countryValues[i]+")");
      } else {
        graphCountries.push(countries[i]);
        graphCountryValues.push(countryValues[i]);
      }
    }
  }

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      {(variants !== undefined) && (
        <div style={{marginBottom: "20px"}}>
          <Typography component={"p"} variant={"h6"} style={{marginBottom: "10px"}}>Variants</Typography>
          {variants.map((node) =>
            <GraphNode node={node} currSelectedNode={selectedNode} setSelected={setSelectedNode} wide={true} key={node}
                content={<p style={{textAlign: "left"}}>{getIcon(nodeToMeta[node]["type"], iconStyle)}{nodeToMeta[node]["name"]}</p>}/>)}
        </div>
      )}
      {(variantOf !== undefined) && (
        <div style={{marginBottom: "20px"}}>
          <Typography component={"p"} variant={"h6"} style={{marginBottom: "10px"}}>Variant of</Typography>
          <GraphNode node={variantOf} currSelectedNode={selectedNode} setSelected={setSelectedNode} wide={true}
              content={<p style={{textAlign: "left"}}>{getIcon(nodeToMeta[variantOf]["type"], iconStyle)}{nodeToMeta[variantOf]["name"]}</p>}/>
        </div>
      )}
      {(orgs !== undefined) &&
        <div>
          <Typography component={"p"} variant={"h6"} style={{marginBottom: "10px"}}>Provider Organizations</Typography>
          {orgNames.map(org => (orgMeta[org] !== undefined) &&
          <div key={org}>
            {orgMeta[org]["hq"]} <Link target={"_blank"} rel={"noopener"} href={orgMeta[org]["url"]}>
              {orgMeta[org]["name"]}
            </Link>: {orgs[org]}
          </div>
        )
        }</div>
      }
      {hasCountries &&
        <div>
          {graphCountries.length > 0 &&
            <BarGraph countries={graphCountries} values={graphCountryValues}/>
          }
          {undefinedProvisionCountries.length > 0 &&
            <Typography component={"p"} variant={"body2"} style={{marginTop: "20px"}}>
              Countries with unknown provision share: {undefinedProvisionCountries.join(", ")}
            </Typography>
          }
        </div>
      }
    </div>
  )
};

export default InputDetail;
