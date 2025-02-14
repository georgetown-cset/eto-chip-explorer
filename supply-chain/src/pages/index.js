import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider, createTheme } from '@mui/material';

import { AppWrapper, ErrorBoundary } from "@eto/eto-ui-components";

import MetaTagsWrapper from "../components/MetaTagsWrapper";
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
  return (
    <AppWrapper>
      <ThemeProvider theme={theme}>
        {(typeof window !== "undefined") &&
          <React.Suspense fallback={<div style={{textAlign: "center"}}><CircularProgress/></div>}>
            <ErrorBoundary>
              <Dashboard/>
            </ErrorBoundary>
          </React.Suspense>
        }
      </ThemeProvider>
    </AppWrapper>
  );
};

export default IndexPage;

export const Head = () => (
  <MetaTagsWrapper />
);
