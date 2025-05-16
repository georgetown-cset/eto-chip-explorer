import React from 'react';
import type { ReactNode } from 'react';
import Typography from "@mui/material/Typography";
import { MoreHoriz as MoreHorzIcon } from "@mui/icons-material";

import { HelpTooltip } from "@eto/eto-ui-components";

import { nodeToMeta } from "../../data/graph";
import { countryFlags } from "../../data/provision";

export interface ProviderListingProps {
  isOrg: boolean;
  providers: Record<string, "Major"|"negligible"|number>;
  providerMeta: Record<string, {
    hq_country: string;
    hq_flag: string;
    name: string;
    type: string;
  }>;
  variant: boolean;
  variantProviders?: Record<string, Array<string>>;
}

const ProviderListing = (props: ProviderListingProps) => {
  const {
    isOrg,
    providers,
    providerMeta,
    variant,
    variantProviders={},
  } = props;

  // Order table rows so items show up
  // alphabetically vertically
  const _mkOrderedTableRows = (items: Array<string>): Array<Array<string>> => {
    const numRows = Math.ceil(items.length/2);
    const rows: Array<Array<string>> = [];
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
    let orgNodes: Array<string>;
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
    const rows: Array<ReactNode> = [];
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
                <HelpTooltip
                  text={"Provides: " + variantProviders[org].map(e => nodeToMeta[e].name).join(", ")}
                  // @ts-ignore
                  Icon={MoreHorzIcon}
                />
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
    let countryNodes: Array<string>;
    // Get correct, sorted list of country nodes
    if (variant === true) {
      countryNodes = Object.keys(variantProviders).sort();
    } else {
      countryNodes = providers.sort(
        (a, b) => (a.country.toLowerCase()).localeCompare(b.country.toLowerCase())
      );
    }
    const orderedTableRows = _mkOrderedTableRows(countryNodes);
    const rows: Array<ReactNode> = [];
    orderedTableRows.forEach(rowCountries => {
      rows.push(
        <tr key={JSON.stringify(rowCountries)}>
          {rowCountries.map((countryInfo) => {
            const countryName = variant ? countryInfo : countryInfo.country;
            return (
              <td key={countryName}>
                <Typography component="p" className="whereisthis">
                  {countryFlags[countryName] && <span className="flag">{countryFlags[countryName]}</span>}
                  {countryName}
                  {!variant && countryInfo.value !== "Major" && <span> ({countryInfo.value})</span>}
                  {variant &&
                    <HelpTooltip
                      text={"Provides: " + variantProviders[countryName].map(e => nodeToMeta[e].name).join(", ")}
                      // @ts-ignore
                      Icon={MoreHorzIcon}
                    />
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
  const helpText = (
    <HelpTooltip
      // @ts-ignore
      smallIcon
      text={isOrg ?
        "Global companies with significant market share or otherwise notable capabilities." :
        "Countries with significant global market share."
      }
      iconStyle={{verticalAlign: "middle"}}
    />
  );

  const showTable = () => {
    return (variant === true) ? Object.keys(variantProviders).length > 0 : providers !== undefined
  }

  return (
    <div className="provider-listing">
    {showTable() &&
      <div>
        <Typography component={"p"} variant={"h6"} className="provision-heading">
         {title}
         {helpText}
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

export default ProviderListing;
