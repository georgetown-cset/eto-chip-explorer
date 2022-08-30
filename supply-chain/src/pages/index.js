import React, {useEffect} from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { createTheme } from '@mui/material';
/* Set the body margin and padding to 0 here */
import "../styles/styles.scss";

const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Disable the default material ripple effect globally
      },
    },
  },
});


const Dashboard = React.lazy(() => import("../components/dashboard"));

const IndexPage = () => {
  useEffect(() => {
    document.title = "Semiconductor Supply Chain Mapper";
    document.documentElement.lang = "en";
  }, []);

  return (
    <div>
      {(typeof window !== "undefined") &&
        <React.Suspense fallback={<div style={{textAlign: "center"}}><CircularProgress/></div>}>
          <Dashboard/>
        </React.Suspense>
      }
    </div>
  )
};

export default IndexPage;
