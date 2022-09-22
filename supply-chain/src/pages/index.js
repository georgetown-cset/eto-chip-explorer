import React, {useEffect} from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider, createTheme } from '@mui/material';
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
    document.title = "Supply Chain Explorer: Advanced Chips";
    document.documentElement.lang = "en";
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {(typeof window !== "undefined") &&
        <React.Suspense fallback={<div style={{textAlign: "center"}}><CircularProgress/></div>}>
          <Dashboard/>
        </React.Suspense>
      }
    </ThemeProvider>
  )
};

export default IndexPage;
