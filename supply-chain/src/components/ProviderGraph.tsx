import React, { ReactNode, Suspense, lazy } from 'react';
import Typography from '@mui/material/Typography';

import { HelpTooltip, PlotlyDefaults } from '@eto/eto-ui-components';

import { countryFlags } from "../../data/provision";
import ProviderTable from "./ProviderTable";
import "./ProviderTable.css";

const Plot = lazy(() => import('react-plotly.js'));

interface ProviderWithProvisionValue {
  country: string;
  value: number;
}
interface ProviderWithoutProvisionValue {
  country: string;
  value: string;
}
type Provider = ProviderWithProvisionValue | ProviderWithoutProvisionValue;

export interface ProviderGraphProps {
  marketShareCaption?: string;
  marketShareSource?: string; // TODO: Make this a ReactNode, or something safer?
  providers: Array<Provider>;
  title: string;
  tooltip?: ReactNode;
}

const ProviderGraph = (props: ProviderGraphProps) => {
  const {
    marketShareCaption,
    marketShareSource,
    providers,
    title,
    tooltip,
  } = props;

  const graphProviders: Array<ProviderWithProvisionValue> = [];
  const minorProviders: Array<ProviderWithoutProvisionValue> = [];
  const hasCountries = (providers !== null) && (providers !== undefined) && (providers.length > 0);

  if ( hasCountries ) {
    for (let i = 0; i < providers.length; i++) {
      if (typeof providers[i].value !== "number") {
        minorProviders.push(providers[i] as ProviderWithoutProvisionValue);
      } else {
        graphProviders.push(providers[i] as ProviderWithProvisionValue);
      }
    }
  } else {
    // Don't display the graph component if we have no data.
    return null;
  }

  graphProviders.sort((a, b) => {
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
  });

  const minorProviderList = minorProviders.map(({ country }) => ({
    provider: country,
    flag: countryFlags[country],
  }));

  const data = [
    {
      x: graphProviders.map(e => e.value),
      y: graphProviders.map(e => e.country),
      type: "bar",
      orientation: "h",
      hovertemplate: '%{x}%<extra></extra>',
    },
  ];

  const plotlyDefaults = PlotlyDefaults();
  plotlyDefaults.layout.margin = {t: 25, r: 30, b: 40, l: 120, pad: 4};
  plotlyDefaults.layout.xaxis.title = "Share of global market";

  return (
    <div className="provider-graph">
      {graphProviders.length > 0 &&
        <>
          <h5>
            {title}
            {/* @ts-ignore - `smallIcon` prop */}
            {tooltip && <HelpTooltip smallIcon text={tooltip} iconStyle={{verticalAlign: "middle"}} /> }
          </h5>
          <div className="graph-wrapper">
            <Suspense fallback={<div>Loading graph...</div>}>
              <Plot
                data={data}
                layout={plotlyDefaults.layout}
                config={plotlyDefaults.config}
              />
            </Suspense>
          </div>
          {marketShareCaption &&
            <div className="caption"> <b>Note: </b> {marketShareCaption}</div>
          }
          {marketShareSource &&
            <div className="caption"> <b>Source: </b>
              <span dangerouslySetInnerHTML={{__html: marketShareSource}} />
            </div>
          }
        </>
      }
      {graphProviders.length > 0 && minorProviders.length > 0 &&
        <Typography component={"p"} variant={"body2"} style={{marginTop: "20px"}}>
          Minor providers (not pictured): {minorProviders.map(c => c.country).join(", ")}
        </Typography>
      }
      {graphProviders.length === 0 && minorProviders.length > 0 &&
        <ProviderTable
          caption={title}
          providers={minorProviderList}
          tooltip={tooltip}
        />
      }
    </div>
  );
};

export default ProviderGraph;
