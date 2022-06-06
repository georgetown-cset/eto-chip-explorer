import React from "react";
import Typography from "@mui/material/Typography";

import "core-js/features/url";
import "core-js/features/url-search-params";


const Header = () => {
  return (
    <div style={{padding: "20px"}}>
      <Typography component={"p"} variant={"h4"}>Semiconductor Supply Chain Mapper</Typography>
    </div>
  )
};

export default Header;
