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

import { Box, Button, IconButton, Menu, MenuItem, alpha } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector, RootState, useAppDispatch } from "@slices/store";
import { useNavigate } from "react-router-dom";
import {
  updateRouterPath,
  updateRouteContent,
  createRouteContent,
} from "@slices/routeSlice/route";
import { getPageData } from "@slices/pageSlice/page";
import { RouteResponse, RouteContentItem } from "../../../types/types";
import { Role } from "@utils/types";
import { useState } from "react";
import RouteContentDialogBox from "@component/dialogs/RouteContentDialogBox";
import DeleteContentDialogBox from "@component/dialogs/DeleteDialogBox";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";


const ButtonSection = () => {
  const {
    childrenRoutes,
    routeContents,
    routeId: currentRouteId,
  } = useAppSelector((state: RootState) => state.route);
  const authorizedRoles = useAppSelector(
    (state: RootState) => state.auth.roles
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContent, setSelectedContent] =
    useState<RouteContentItem | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    content: RouteContentItem
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedContent(content);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateToRoute = (route: RouteResponse) => {

    if ((route.isRouteVisible === false || route.isRouteVisible === undefined) && !authorizedRoles.includes(Role.SALES_ADMIN)) {
      dispatch(
        enqueueSnackbarMessage({
          message: "This page is currently hidden.",
          type: "warning",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        })
      );
      return;    
    }
    navigate(route.path);
    dispatch(
      updateRouterPath({
        routeId: route.routeId,
        currentPath: route.path,
        label: route.menuItem,
        children: route.children ?? [],
      })
    );
    dispatch(getPageData(route.path));
  };

  const openContent = (content: RouteContentItem) => {
    if (content.contentLink) {
      window.open(content.contentLink, "_blank");
    }
  };

  const combinedItems = [
    ...childrenRoutes.map((r) => ({ ...r, type: "route" })),
    ...routeContents
      .filter((c) => c.routeId === currentRouteId)
      .map((c) => ({ ...c, type: "content" })),
  ];

  return (
    <>
      <Box
        sx={(theme) => ({
          paddingX: 4,
          paddingY: 2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          background:
            theme.palette.mode === "dark"
              ? alpha(
                  theme.palette.primary.main,
                  theme.palette.action.hoverOpacity
                )
              : alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
        })}
      >
        {combinedItems.map((item, index) => {
          const isContent = item.type === "content";
          const label =
            "menuItem" in item ? item.menuItem : item.description ?? "Unnamed";

          return (
            <Button
              key={index}
              variant="outlined"
              onClick={() =>
                isContent
                  ? openContent(item as RouteContentItem)
                  : navigateToRoute(item as RouteResponse)
              }
              sx={(theme) => ({
                borderRadius: 3,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                fontWeight: 600,
              })}
              endIcon={
                isContent && authorizedRoles.includes(Role.SALES_ADMIN) ? (
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, item as RouteContentItem)}
                    sx={{ padding: 0, color: "inherit" }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                ) : undefined
              }
            >
              {label}
            </Button>
          );
        })}

        {authorizedRoles.includes(Role.SALES_ADMIN) && (
          <Button
            variant="contained"
            sx={{ borderRadius: 3, textTransform: "uppercase" }}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            + Add
          </Button>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setIsUpdateDialogOpen(true);
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" /> Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsDeleteDialogOpen(true);
            handleMenuClose();
          }}
        >
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {selectedContent && (
        <RouteContentDialogBox
          isOpen={isUpdateDialogOpen}
          handleClose={() => setIsUpdateDialogOpen(false)}
          mode="update"
          contentId={selectedContent.contentId}
          description={selectedContent.description}
          contentLink={selectedContent.contentLink}
          onUpdate={(payload) =>
            dispatch(
              updateRouteContent({ content: payload, routeId: currentRouteId })
            )
          }
        />
      )}

      <RouteContentDialogBox
        isOpen={isCreateDialogOpen}
        handleClose={() => setIsCreateDialogOpen(false)}
        mode="create"
        routeId={currentRouteId}
        onCreate={(payload) =>
          dispatch(
            createRouteContent({ content: payload, routeId: payload.routeId })
          )
        }
      />

      {selectedContent && (
        <DeleteContentDialogBox
          open={isDeleteDialogOpen}
          handleClose={() => setIsDeleteDialogOpen(false)}
          type="route_content"
          contentId={selectedContent.contentId}
          routeId={currentRouteId}
        />
      )}
    </>
  );
};

export default ButtonSection;
