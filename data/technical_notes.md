This readme summarizes analytic decisions made in the process of turning https://cset.georgetown.edu/wp-content/uploads/The-Semiconductor-Supply-Chain-Issue-Brief.pdf into the structured data in this folder.

### Removed/altered companies relative to underlying report

| Company | Action |
| ------- | ------ |
| GuoSheng | deleted; could not be conclusively identified in 2022 company research |
| Zhonghuan |		name correction: Zhonghuan Semiconductor |
| Haute Gas |		name correction: Huate Gas |
| Merck |			name correction: Merck Group (disambiguating from Merck & Co.) |
| Showa Denka |		name correction: Showa Denko |
| Jinhong |			name correction: Jinhong Gas |
| Cabot |			name correction: CMC |
| Eminess |			name correction: Pureon |
| Hualong |			name correction: Ningbo Hualong |
| KDDX |			deleted; could not be conclusively identified in 2022 company research |
| Quik-Pak |		name correction: QP Technologies |
| Y-Bond |			deleted; could not be conclusively identified in 2022 company research |
| Longhill |		name correction: Longhill Industries |
| JIAFENG |			unannotated; could not be conclusively identified in 2022 company research |
| Etching Liquid |	deleted; could not be conclusively identified in 2022 company research |
| Jiangyin Chemical Reagents |	deleted; could not be conclusively identified in 2022 company research |
| Grand Plastic |	name correction: Grand Process |
| EMD Performance Chemicals |	name correction: EMD Electronics |
| Fujifilm |		name correction: Fujifilm Electronic Materials |
| Lanzhou Rapid Equipment Manufacturing |	deleted; could not be conclusively identified in 2022 company research |
| Tianshui |		name correction: Tianshui Huatian Technology |
| ASM Pacific |		Country corrected to Singapore |
| Heraeus |			Country corrected to Germany |
| Synova |			Country corrected to Switzerland |
| Xilinx |			Merged into parent AMD |


### Inputs not incorporated due to negligible global market size (under $25m)

- Wafer marking systems
- Electrical instruments (wafer inspection)
- Structural inspection and review tools (wafer inspection)
- Ion beam lithography
- Imprint lithography
- Misc. etching tools
- Dry stripping
- Ion milling
- Dry cleaning tools

### Inputs not incorporated due to irrelevance to advanced logic chips or similar reasons

- Spin coating tools (incorporated into "Deposition tools"
- Non-IC deposition tools
- Anything relating specifically to memory chips
- CMP tools for packaging (see below)

### Other methodological notes

- A company has "negligible" market share if the country it belongs to has 2% or less (rounded value) of the overall market OR the text of the report explicitly indicates it's a negligible provider (for example, if its capabilities are far behind the state of the art).
- In any case where the text of the report is in tension with the tables and figures, we rely on the tables and figures.
- Certain small percentages were extracted from the working files of the authors of the report, rather than the report itself (generally, when the specific percentage numbers were not included in the report).
- Total market share percentages for specific chip inputs may exceed 100% due to rounding. In particular, market share percentages between 0 and 1% are rounded up to 1% in order to simplify visualization in the Supply Chain Explorer interface.
- Company information may be different from what's in the paper as a result of the 2022 annotation process for companies. See, for example, the table above.
- For simplicity's sake, CMP tools are included only in fabrication, not packaging, since the packaging application of CMP tools is relatively minor.
- Usually, countries have a percentage market share, but in some cases it's missing (like ion implanters, CMP, wafer inspection, photoresists) where there are market share subcategories in the paper that are not meaningful to break out in the map.
