import React, {useEffect} from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Header from "../components/header";

/* Set the body margin and padding to 0 here */
import "../styles/styles.css";
const Dashboard = React.lazy(() => import("../components/dashboard"));

const IndexPage = () => {
  useEffect(() => {
    document.title = "Semiconductor Supply Chain Mapper";
    document.documentElement.lang = "en";
  }, []);

  return (
    <div>
      <Header/>
      {(typeof window !== "undefined") &&
        <React.Suspense fallback={<div style={{textAlign: "center"}}><CircularProgress/></div>}>
          <Dashboard/>
        </React.Suspense>
      }
    </div>
  )
};

export default IndexPage;
