import React, {useEffect, memo} from "react";
import Typography from "@mui/material/Typography"

const mdxComponents = {
  p: (() => {
    return memo(props =>
      <Typography {...props} component={"p"} variant={"body1"} style={{marginBottom: "20px"}}/>);
  })(),
  h4: (() => {
    return memo(props =>
      <Typography {...props} component={"h4"} variant={"h4"} style={{margin: "20px 0px 20px 0px"}}/>
    );
  })(),
  h5: (() => {
    return memo(props =>
      <Typography {...props} component={"h5"} variant={"h5"} style={{margin: "20px 0px 10px 0px"}}/>
    );
  })(),
  h6: (() => {
    return memo(props =>
      <Typography {...props} component={"h6"} variant={"h6"} style={{margin: "10px 0px 10px 0px"}}/>);
  })(),
  li: (() => {
    return memo(props =>
      <Typography {...props} component={"li"}/>);
  })(),
  hr: (() => {
    return memo(props =>
      <hr style={{margin: "50px 0px 30px 0px"}}/>);
  })(),
};

export default mdxComponents;
