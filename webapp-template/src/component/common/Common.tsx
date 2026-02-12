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

import { Box as MuiBox, styled, IconButton as MuiIconButton } from "@mui/material";

export const IconButton = styled(MuiIconButton)(({ theme }) => ({
  background: theme.palette.info.dark,
  color: theme.palette.info.light,
  "&:hover": {
    background: theme.palette.info.light,
    color: theme.palette.info.dark,
  },
}));

export const CustomBox = styled(MuiBox)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  "& video": {
    width: "100%",
    height: "60vh",
    objectFit: "cover",
  },
  "& img": {
    width: "100%",
    height: "50vh",
    objectFit: "cover",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(to bottom, rgba(0, 0, 0, 1) 5% , rgba(0, 0, 0, .1))"
        : "linear-gradient(to bottom, rgb(17, 17, 17, 70%) 6% , rgb(17, 17, 17 , .1))",
  },
}));

export const EditIconButton = styled(MuiIconButton)(({ theme }) => ({
  size: "small",
  position: "absolute",
  right: -3,
  top: -30,
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.primary.main,
  elevation: 3,
  padding: theme.spacing(0.3),
}));
