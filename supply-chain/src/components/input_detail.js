import React, { useEffect } from "react";
import Loadable from "react-loadable";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import mdxComponents from "../helpers/mdx_style";

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
  }]

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
  const {selectedNode, descriptions, countries, countryValues, orgs, orgMeta} = props;
  const orgNames = Object.keys(orgs);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider components={mdxComponents}>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      <Typography component={"p"} variant={"h6"} style={{marginBottom: "10px"}}>Provider Organizations</Typography>
      {(orgs !== undefined) &&
        orgNames.map(org =>
          (orgMeta[org] !== undefined) &&
          <div>
            {orgMeta[org]["hq"]} <Link target={"_blank"} rel={"noopener"} href={orgMeta[org]["url"]}>
              {orgMeta[org]["name"]}
            </Link>: {orgs[org]}
          </div>
        )
      }
      {(countries !== null) && (countryValues !== null) &&
        <BarGraph countries={countries} values={countryValues}/>
      }
    </div>
  )
};

export default InputDetail;
