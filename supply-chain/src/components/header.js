import React from "react";
import Typography from "@mui/material/Typography";

import "core-js/features/url";
import "core-js/features/url-search-params";


const Header = () => {
  return (
    <div style={{padding: "20px"}}>
      <Typography component={"p"} variant={"h4"}>Semiconductor Supply Chain Mapper</Typography>
      <Typography component={"p"} variant={"body2"}>
      ETO’s Supply Chain Explorer visualizes supply chains in critical and emerging technology.
      This edition of the Explorer covers the essential tools, materials, processes, countries,
      and firms involved in producing advanced logic chips. It’s built to help users who are not
      semiconductor experts get up to speed on how this essential technology is produced, and
      to allow users of all backgrounds to visually explore how different inputs, companies,
      and nations interact in the production process.
    </Typography>
    </div>
  )
};

export default Header;
