// Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { setUserAuthData, loadPrivileges } from "@slices/authSlice";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import StatusWithAction from "@component/ui/StatusWithAction";
import PreLoader from "@component/common/PreLoader";
import { getEmployeeInfo } from "@slices/employeeSlice/employee";
import { getRoutesInfo, getRouteContents } from "@slices/routeSlice/route";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ApiService } from "@utils/apiService";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useAuthContext, SecureApp } from "@asgardeo/auth-react";

interface AuthContextType {
  appSignIn: () => void;
  appSignOut: () => void;
}

type AppState = "logout" | "active" | "loading";
const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

const AppAuthProvider = (props: { children: React.ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>("loading");

  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: RootState) => state.auth);
  const employeeInfo = useAppSelector((state: RootState) => state.employee);

  const {
    signIn,
    signOut,
    getDecodedIDToken,
    getBasicUserInfo,
    refreshAccessToken,
    isAuthenticated,
    getIDToken,
    state,
  } = useAuthContext();

  useEffect(() => {
    const appStatus = localStorage.getItem("hris-app-state");

    if (!localStorage.getItem("hris-app-redirect-url")) {
      localStorage.setItem(
        "hris-app-redirect-url",
        window.location.href.replace(window.location.origin, "")
      );
    }

    if (appStatus && appStatus === "logout") {
      setAppState("logout");
    } else {
      setAppState("active");
    }
  }, []);

  useEffect(() => {
    const isSignInInitiated =
      localStorage.getItem("signInInitiated") === "true";
    if (state.isAuthenticated) {
      Promise.all([getBasicUserInfo(), getIDToken(), getDecodedIDToken()]).then(
        async ([userInfo, idToken, decodedIdToken]) => {
          dispatch(
            setUserAuthData({
              userInfo: userInfo,
              idToken: idToken,
              decodedIdToken: decodedIdToken,
            })
          );

          new ApiService(idToken, refreshToken);
          await dispatch(loadPrivileges());
          await dispatch(getRouteContents());
          await dispatch(getRoutesInfo(window.location.pathname));
          localStorage.setItem("signInInitiated", "false");
        }
      );
    } else if (!isSignInInitiated) {
      localStorage.setItem("signInInitiated", "true");
      signIn();
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (appState === "active") {
      if (state.isAuthenticated) {
        if (auth.userInfo?.email && employeeInfo.state !== "loading") {
          dispatch(
            getEmployeeInfo(auth.userInfo?.email ? auth.userInfo?.email : "")
          );
        }
      } else {
        signIn();
      }
    }
  }, [auth.userInfo]);

  const refreshToken = () => {
    return new Promise<{ idToken: string }>((resolve) => {
      isAuthenticated().then((userIsAuthenticated) => {
        if (userIsAuthenticated) {
          getIDToken().then((idToken) => {
            resolve({ idToken });
          });
        } else {
          refreshAccessToken()
            .then(async () => {
              const idToken = await getIDToken();
              resolve({ idToken: idToken });
            })
            .catch(() => {
              appSignOut();
            });
        }
      });
    });
  };

  const appSignOut = async () => {
    setAppState("loading");
    localStorage.setItem("hris-app-state", "logout");
    await signOut();
    setAppState("logout");
  };

  const appSignIn = async () => {
    setAppState("active");
    localStorage.setItem("hris-app-state", "active");
  };

  const authContext: AuthContextType = {
    appSignIn: appSignIn,
    appSignOut: appSignOut,
  };

  return (
    <>
      {state.isLoading ? (
        <PreLoader isLoading={true} />
      ) : (
        <>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you still there?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                It looks like you've been inactive for a while. Would you like
                to continue?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Continue</Button>
              <Button onClick={() => appSignOut()}>Logout</Button>
            </DialogActions>
          </Dialog>
          {appState === "active" ? (
            <AuthContext.Provider value={authContext}>
              <SecureApp>{props.children}</SecureApp>
            </AuthContext.Provider>
          ) : (
            <StatusWithAction action={() => appSignIn()} />
          )}
        </>
      )}
    </>
  );
};

const useAppAuthContext = (): AuthContextType => useContext(AuthContext);
// eslint-disable-next-line react-refresh/only-export-components
export { useAppAuthContext };
export default AppAuthProvider;
