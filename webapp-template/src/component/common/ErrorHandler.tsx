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

import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import { ErrorHandlerProps } from "../../types/types";
import warningImage from "@assets/images/warning.svg";

const ErrorHandler = (props: ErrorHandlerProps) => {
  return (
    <Box
      sx={{
        background: "background.paper",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Card sx={{ borderRadius: "0px", p: 15, height: "100vh" }} variant="outlined">
        <CardContent>
          <Stack direction="column" justifyContent="center" alignItems="center" spacing={5}>
            <Box>
              <img alt="logo" width="300" height="auto" src={warningImage}></img>
            </Box>
            <Box>
              <Typography variant="h3">{props.message}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorHandler;
