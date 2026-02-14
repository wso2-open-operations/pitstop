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

import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import notFoundImage from "@assets/images/not-found.svg";

const clickHandler = (navigate: ReturnType<typeof useNavigate>) => () => {
  navigate("/");
};

export default function Error() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#141414",
      }}
    >
      <img src={notFoundImage} alt="404" height={200} />
      <Typography sx={{ mt: 5, fontWeight: "bold" }} variant="h4" style={{ color: "gray" }}>
        404 - Not Found
      </Typography>
      <Typography variant="h6" style={{ color: "gray" }}>
        The page you’re looking for doesn’t exist.
      </Typography>
      <Button sx={{ mt: 5 }} variant="contained" onClick={clickHandler(navigate)}>
        Back Home
      </Button>
    </Box>
  );
}
