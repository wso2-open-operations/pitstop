// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { CURRENT_YEAR } from "@config/constant";
import Header from "./header";
import ConfirmationModalContextProvider from "@context/DialogContext";
import { selectUserInfo } from "@slices/authSlice";
import pJson from "../../package.json";
import { RootState, useAppSelector } from "@slices/store";
import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate, matchRoutes } from "react-router-dom";
import { useSnackbar } from "notistack";
import ConsentHandler from "@component/common/ConsentHandler";
import MatomoTracker from "../analytics/MatomoTracker";

export default function Layout() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const common = useAppSelector((state: RootState) => state.common);

  useEffect(() => {
    if (common.timestamp != null) {
      enqueueSnackbar(common.message, {
        variant: common.type,
        preventDuplicate: true,
        anchorOrigin: common.anchorOrigin,
      });
    }
  }, [common.timestamp]);

  useEffect(() => {
    if (localStorage.getItem("hris-app-redirect-url")) {
      navigate(localStorage.getItem("hris-app-redirect-url") as string);
      localStorage.removeItem("hris-app-redirect-url");
    }
  }, []);

  const route = useAppSelector((state: RootState) => state.route);
  const location = useLocation();
  const matches = matchRoutes(route.routes, location.pathname);
  const theme = useTheme();
  const userInfo = useSelector(selectUserInfo);

  //----------------TO:DO-------------------------------------------//
  const [userConsent, setUserConsent] = useState<boolean>(true);

  const getAppBarTitle = (): string => {
    let title: string = "";
    matches?.forEach((obj) => {
      if (location.pathname === obj.pathname) {
        title = obj.route.menuItem;
      }
    });

    return title;
  };

  return (
    <ConfirmationModalContextProvider>
      <Box sx={{ display: "flex", overflowX: "hidden" }}>
        <CssBaseline />
        {userConsent ? (
          <>
            <MatomoTracker />
            <Header theme={theme} title={getAppBarTitle()} currentPath={location.pathname} email={userInfo?.email} />
            <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 6, overflowX: "hidden" }}>
              <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
              </Suspense>
              <Box
                className="layout-note"
                component="footer"
                sx={{
                  background: theme.palette.mode === "light" ? "#eeeeee" : "black",
                  height: "35px",
                  position: "fixed",
                  pt: 1,
                  bottom: 0,
                  width: "100%",
                  zIndex: 1000,
                }}
              >
                <Typography variant="h6" sx={{ color: "#919090", pl: 2 }}>
                  v {pJson.version} | © {CURRENT_YEAR} WSO2 LLC
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <ConsentHandler setUserConsent={setUserConsent} />
        )}
      </Box>
    </ConfirmationModalContextProvider>
  );
}
