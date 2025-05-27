import React, { ReactNode } from 'react';
import { MoreHoriz as MoreHorizIcon } from "@mui/icons-material";

import { HelpTooltip } from '@eto/eto-ui-components';

import "./ProviderTable.css";


export interface ProvidersEntry {
  details?: ReactNode;
  flag: string;
  provider: string;
}
export interface ProviderTableProps {
  caption: string;
  providers: Array<ProvidersEntry>;
  tooltip?: ReactNode;
}

const ProviderTable = ({
  caption,
  providers = [],
  tooltip,
}: ProviderTableProps) => {
  if ( providers.length === 0 ) {
    return null;
  }

  const sortedProviders = providers.toSorted((a, b) => a.provider.localeCompare(b.provider));
  const numRows = Math.round(providers?.length / 2);
  const rows: Array<Array<ProvidersEntry>> = Array(numRows).fill([]).map((e, ix) => ([
    sortedProviders?.[ix],
    sortedProviders?.[numRows + ix],
  ]));

  return (
    <div className="provider-table">
      <h5>
        {caption}
        {/* @ts-ignore - TODO: HelpTooltip needs to have `children` be optional */}
        { tooltip && <HelpTooltip smallIcon text={tooltip} /> }
      </h5>
      <table>
        <tbody>
          {rows.map(([entry1, entry2]) => (
            <tr key={entry1.provider + (entry2?.provider ?? "")}>
              <td>
                {entry1.flag} {entry1.provider} {
                  // @ts-ignore - TODO: `Icon` prop not recognized
                  entry1?.details && <HelpTooltip text={entry1.details} Icon={MoreHorizIcon} />
                }
              </td>
              <td>
                {entry2?.flag} {entry2?.provider} {
                  // @ts-ignore - TODO: `Icon` prop not recognized
                  entry2?.details && <HelpTooltip text={entry2.details} Icon={MoreHorizIcon} />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderTable;
