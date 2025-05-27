import React, { ReactNode, Suspense, lazy } from 'react';
import Typography from '@mui/material/Typography';

import { HelpTooltip, PlotlyDefaults } from '@eto/eto-ui-components';

import ProviderTable from "./ProviderTable";
import "./ProviderTable.css";

const Plot = lazy(() => import('react-plotly.js'));

interface ProviderWithProvisionValue {
  flag?: string;
  provider: string;
  value: number;
}
interface ProviderWithoutProvisionValue {
  flag?: string;
  provider: string;
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

const ProviderGraph = ({
  marketShareCaption,
  marketShareSource,
  providers,
  title,
  tooltip,
}: ProviderGraphProps) => {
  const hasProviders = (providers !== null) && (providers !== undefined) && (providers.length > 0);

  if ( ! hasProviders ) {
    // Don't display the graph component if we have no data.
    return null;
  }

  const graphProviders = providers
    .filter(provider => typeof provider.value === "number")
    .map(provider => provider as ProviderWithProvisionValue)
    .toSorted((a, b) => {
      // Nodes for "Various" always go last
      if ( a.provider.startsWith("Various") ) {
        return -1;
      } else if ( b.provider.startsWith("Various") ) {
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

  const minorProviders = providers
    .filter(provider => typeof provider.value !== "number")
    .map(provider => provider as ProviderWithoutProvisionValue);

  const data = [
    {
      x: graphProviders.map(e => e.value),
      y: graphProviders.map(e => e?.flag ? `${e.provider} ${e?.flag}` : e.provider),
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
          Minor providers (not pictured): {minorProviders.map(c => c.provider).join(", ")}
        </Typography>
      }
      {graphProviders.length === 0 && minorProviders.length > 0 &&
        <ProviderTable
          caption={title}
          providers={minorProviders}
          tooltip={tooltip}
        />
      }
    </div>
  );
};

export default ProviderGraph;
