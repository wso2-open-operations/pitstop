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

import SectionDialogBox from "@component/dialogs/SectionDialogBox";
import UpdatePageDialogBox from "@component/dialogs/PageDialogBox";
import { RootState, useAppSelector } from "@slices/store";
import { Role } from "@utils/types";
import { ActionButtonProps } from "src/types/types";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useRef, useState } from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const ActionButton: React.FC<ActionButtonProps> = () => {
  const authorizedRoles: Role[] = useAppSelector((state: RootState) => state.auth.roles);
  const route = useAppSelector((state: RootState) => state.route);
  const page = useAppSelector((state: RootState) => state.page);
  const initialRender = useRef(true);
  const [updatePageData, setUpdatePageData] = useState({
    routeId: 0,
    label: "",
    path: "",
    title: "",
    description: "",
    thumbnail: "",
    customPageTheme: {},
    isVisible: true,
  });

  useEffect(() => {
    if (initialRender.current) {
      setUpdatePageData({
        routeId: route.routeId,
        label: route.label,
        path: route.currentPath,
        title: page.pageData.title ? page.pageData.title : "",
        description: page.pageData.description ? page.pageData.description : "",
        thumbnail: page.pageData.thumbnail ? page.pageData.thumbnail : "",
        customPageTheme: page.pageData.customPageTheme ? page.pageData.customPageTheme : {},
        isVisible: !!page.pageData.isVisible,
      });
      initialRender.current = false;
    }
  }, [route, page.pageData]);

  const [openAddSectionDialogBox, setOpenAddSectionDialogBox] = useState(false);
  const [openUpdatePageDialogBox, setOpenUpdatePageDialogBox] = useState(false);

  const addNewSectionHandler = () => {
    setOpenAddSectionDialogBox(true);
  };

  const updatePageHandler = () => {
    setOpenUpdatePageDialogBox(true);
  };

  const theme = useTheme();

  const actions = [
    {
      icon: <AddIcon />,
      name: "Add new section",
      action: addNewSectionHandler,
      color: theme.palette.success.main,
    },
    {
      icon: <EditIcon />,
      name: "Edit the page",
      action: updatePageHandler,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box
      sx={{
        transform: "translateZ(0px)",
        right: 32,
        position: "absolute",
        bottom: 32,
      }}
    >
      {/* -------------------Admin Actions--------------- */}
      {authorizedRoles.includes(Role.SALES_ADMIN) && (
        <>
            <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.2,
              borderRadius: 8,
              bgcolor: theme.palette.background.paper, 
              border: "1px solid rgba(255,255,255,0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            >
            {actions.map((action, idx) => (
              <Tooltip title={action.name} key={idx} arrow>
              <IconButton
              size="medium"
              aria-label={action.name}
              onClick={action.action}
              sx={{
              width: 40,
              height: 40,
              borderRadius: 6,
              bgcolor: "transparent",
              color: theme.palette.mode === "dark" ? "#cc5800" : "#ff7300",
              "& svg": {
                fontSize: 22,
              },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.14)",
              },
              }}
              >
              {action.icon}
              </IconButton>
              </Tooltip>
            ))}
            </Box>

          <SectionDialogBox
            open={openAddSectionDialogBox}
            handleClose={() => setOpenAddSectionDialogBox(false)}
            type="add"
          />
        </>
      )}
      {/* ---------------------------------------------- */}

      {/* -------------------------------- UpdateDialogBox -------------------------------------------*/}
      {updatePageData.routeId != 0 && (
        <UpdatePageDialogBox
          type="update"
          parentId={route.routeId}
          open={openUpdatePageDialogBox}
          handleClose={() => setOpenUpdatePageDialogBox(false)}
          initialValues={updatePageData}
        />
      )}
    </Box>
  );
};

export default ActionButton;
