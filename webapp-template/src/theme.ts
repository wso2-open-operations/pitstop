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

import { PaletteMode } from "@mui/material";

// Extend MUI theme types to include custom colors
declare module "@mui/material/styles" {
  interface Palette {
    orange: {
      100: string;
      200: string;
      300: string;
    };
    redAccent: {
      100: string;
      200: string;
    };
  }

  interface PaletteOptions {
    orange?: {
      100: string;
      200: string;
      300: string;
    };
    redAccent?: {
      100: string;
      200: string;
    };
  }
}

// color design tokens export
export const tokens = (mode: PaletteMode) => ({
  ...(mode === "dark"
    ? {
        // Dark mode neutrals 
        grey: {
          100: "#FFFFFF", 
          200: "#D6DBE1", 
          300: "#A9B2C2", 
          400: "#2B333D", 
          500: "#0F1216",
          600: "#1B2128", 
          700: "#757575",
        },
        // Brand orange scale (light → main)
        orange: {
          100: "#e66700",
          200: "#e56700",
          300: "#ff7300", // primary main
        },
        // Error/red accent
        redAccent: {
          100: "#FAD4D6",
          200: "#dc2626",
        },
      }
    : {
        // Light mode neutrals (text → darkest, backgrounds → light)
        grey: {
          100: "#0A0C10",
          200: "#0F1216", 
          300: "#3B4147",
          400: "#b2b4b8ff", 
          500: "#F7F8F9", 
          600: "#FFFFFF",
          700: "#757575",
        },
        // Brand orange scale (tints → main)
        orange: {
          100: "#f7931e",
          200: "#ff811a",
          300: "#ff7300", // primary main
        },
        // Error/red accent
        redAccent: {
          100: "#ff6b35",
          200: "#dc2626",
        },
      }),
});

// mui theme settings
export const themeSettings = (mode: PaletteMode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.orange[300], // primary main
              contrastText: colors.grey[200],
            },
            // For the appBar and the footer
            secondary: {
              dark: colors.grey[400],     
              main: colors.grey[600],     
              light: colors.grey[200],    
              contrastText: colors.grey[100], 
            },
            background: {
              default: colors.grey[500],  
            },
            orange: colors.orange,
            redAccent: colors.redAccent,
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.orange[300],   // primary main
              contrastText: colors.grey[200],
            },
            secondary: {
              light: colors.grey[200],    
              dark: colors.grey[400],     
              main: colors.grey[600],     
              contrastText: colors.grey[100], 
            },
            background: {
              default: colors.grey[500],  
            },
            orange: colors.orange,
            redAccent: colors.redAccent,
          }),
    },
    typography: {
      fontSize: 13,
      fontFamily: ["Inter", "sans-serif"].join(","),
      h1: {
        fontSize: 100,
        "@media (max-width:600px)": {
          fontSize: 50,
        },
      },
      h2: {
        fontSize: 50,
      },
      h3: {
        fontSize: 30,
      },
      h4: {
        fontSize: 20,
      },
      h5: {
        fontSize: 16,
      },
      h6: {
        fontSize: 14,
      },
      body1: {
        fontSize: 12,
      },
      body2: {
        fontSize: 11,
      },
    },
  };
};
