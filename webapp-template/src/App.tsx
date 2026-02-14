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

import { createContext, useState, useMemo } from "react";
import { store } from "./slices/store";
import { ThemeMode } from "@utils/types";
import { AsgardioConfig } from "./config/config";
import AppHandler from "@app/AppHandler";
import { themeSettings } from "./theme";
import "./App.scss";
import { Provider } from "react-redux";
import AppAuthProvider from "@context/AuthContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "@asgardeo/auth-react";
import { SnackbarProvider } from "notistack";
import { PITSTOP_APP_THEME } from "./config/constant";

// eslint-disable-next-line react-refresh/only-export-components
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const processLocalThemeMode = (): ThemeMode => {
    const storedTheme = localStorage.getItem(PITSTOP_APP_THEME) as ThemeMode;
    if (storedTheme === ThemeMode.Dark) {
      return ThemeMode.Dark;
    }
    localStorage.setItem(PITSTOP_APP_THEME, ThemeMode.Light);
    return ThemeMode.Light;
  };

  const [mode, setMode] = useState<ThemeMode>(processLocalThemeMode());

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light;
          localStorage.setItem(PITSTOP_APP_THEME, newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <SnackbarProvider maxSnack={3} preventDuplicate>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <AuthProvider config={AsgardioConfig}>
              <AppAuthProvider>
                <AppHandler />
              </AppAuthProvider>
            </AuthProvider>
          </Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
