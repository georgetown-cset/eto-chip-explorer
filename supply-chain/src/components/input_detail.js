import React, { useEffect } from "react";
import Loadable from "react-loadable";
import Typography from "@mui/material/Typography";
import {nodeToMeta} from "../../data/graph";
import {MDXProvider} from "@mdx-js/react";
import {MDXRenderer} from "gatsby-plugin-mdx";

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
      layout={{autosize: true, margin: {t: 50, r: 50, b: 50, l: 50, pad: 4}, title: "Country Provision"}}
      config={{responsive: true}}
    />
    </div>
  );
};

const InputDetail = (props) => {
  const {selectedNode, descriptions, countries, values} = props;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div style={{display: "inline-block", padding: "0px 40px"}}>
      <MDXProvider>
        <MDXRenderer>{descriptions.filter(n => n.slug === selectedNode)[0].body}</MDXRenderer>
      </MDXProvider>
      <BarGraph countries={countries} values={values}/>
    </div>
  )
};

export default InputDetail;
