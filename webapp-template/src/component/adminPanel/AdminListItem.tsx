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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  reorderRoutes,
  reparentRoutes,
  updateRouterPath,
  toggleRouteVisibility,
} from "@slices/routeSlice/route";
import { useAppDispatch, useAppSelector } from "@slices/store";
import AddRouteDialogBox from "@component/dialogs/PageDialogBox";
import DeleteDialogBox from "@component/dialogs/DeleteDialogBox";
import { ListItemLinkProps, RouteResponse } from "src/types/types";
import SortableChildItem from "../common/ChildSidebarSortableItem";
import { useLocation } from "react-router-dom";
import {
  Box,
  Collapse,
  Checkbox,
  IconButton,
  ListItem,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import HomeIcon from "@mui/icons-material/Home";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { RootState } from "@slices/store";

interface ExtendedListItemLinkProps extends ListItemLinkProps {
  dragHandle?: React.ReactNode;
  dragListeners?: Record<string, unknown>;
  pathname?: string;
  isDragging?: boolean;
  sidebarWidth?: number;
  level?: number;
  selectedRouteIds: Set<number>;
  anyCheckboxSelected: boolean;
  onSelect: (routeId: number, checked: boolean) => void;
  toggledRouteIds: number[];
  isRouteVisible: number;
  isParentHidden: boolean;
}

const ListItemLink = (props: ExtendedListItemLinkProps) => {
  const {
    primary,
    to,
    theme,
    children,
    routeId,
    label,
    handleCloseDrawer,
    dragHandle,
    dragListeners,
    pathname: propPathname,
    isDragging,
    sidebarWidth = 240,
    level = 1,

    selectedRouteIds,
    anyCheckboxSelected,
    onSelect,
    toggledRouteIds,
    isRouteVisible,
    isParentHidden,
  } = props;

  const MAX_PAGE_NAME_LENGTH = 25;

  const [open, setOpen] = useState(false);
  const [openAddDialogBox, setOpenAddDialogBox] = useState(false);
  const [openDeleteDialogBox, setOpenDeleteDialogBox] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dispatch = useAppDispatch();
  const { pathname: locationPathname } = useLocation();
  const pathname = propPathname || locationPathname;

  const reparentingState = useAppSelector(
    (state: RootState) => state.route.reparentingState
  );
  const isReparenting = reparentingState === "loading";

  const sensors = useSensors(useSensor(PointerSensor));
  const [childrenOrderRoutes, setChildrenOrderRoutes] = useState<
    RouteResponse[]
  >([]);

  useEffect(() => {
    if (children && children.length) {
      setChildrenOrderRoutes(children);
    }
  }, [children]);
  const effectiveIsRouteVisible = useMemo(() => {
    return isRouteVisible === 0 || isParentHidden ? 0 : 1;
  }, [isRouteVisible, isParentHidden]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = childrenOrderRoutes.findIndex(
      (r) => r.routeId === active.id
    );
    const newIdx = childrenOrderRoutes.findIndex((r) => r.routeId === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const newOrder = [...childrenOrderRoutes];
    const [moved] = newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, moved);
    setChildrenOrderRoutes(newOrder);
    dispatch(
      reorderRoutes({
        parentId: routeId,
        reorderRoutes: newOrder.map((r, i) => ({
          routeId: r.routeId,
          routeOrder: i + 1,
          isRouteVisible: Number(r.isRouteVisible),
        })),
      })
    );
  };

  const getAllChildIds = useCallback((r: RouteResponse): number[] => {
    const ids: number[] = [];
    r.children?.forEach((c) => {
      ids.push(c.routeId);
      ids.push(...getAllChildIds(c));
    });
    return ids;
  }, []);

  const isChecked =
    selectedRouteIds.has(routeId) ||
    getAllChildIds({ routeId, children } as RouteResponse).some((id) =>
      selectedRouteIds.has(id)
    );

  const descendantIds = useMemo(
    () => getAllChildIds({ routeId, children } as RouteResponse),
    [routeId, children]
  );
  const checkedDescCount = descendantIds.filter((id) =>
    selectedRouteIds.has(id)
  ).length;
  const isIndeterminate =
    children && children.length > 0
      ? checkedDescCount > 0 && checkedDescCount < descendantIds.length
      : false;

  useEffect(() => {
    if (to !== pathname || isDragging) setOpen(false);
  }, [to, pathname, isDragging]);
  const handleClick = () => {
    if (children && children.length) {
      setOpen((o) => {
        const next = !o;
        if (next) {
          //-------------Update Route Path needs to be change into Update navigation_id----------//
          dispatch(
            updateRouterPath({ routeId, currentPath: to, label, children })
          );
        }
        return next;
      });
    }
  };

  //------------------Dialog Box Functionalities-------------//
  const handleOpenAddDialogBox = () => {
    setOpenAddDialogBox(true);
    handleCloseDrawer();
  };

  const handleOpenDeleteDialogBox = () => {
    setOpenDeleteDialogBox(true);
    handleCloseDrawer();
  };

  const isHome = routeId === 1;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: `calc(${sidebarWidth}px - 48px)`,
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ListItem
        sx={{
          display: "flex",
          py: isHome ? 1.5 : 1.2,
          pl: level !== 1 ? level * 2.1 : 2,
          pr: 2,
          my: 0.5,
          borderRadius: 3,
          background: isDragging
            ? theme.palette.action.hover
            : isHovered
            ? theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.9)"
            : theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.6)",
          border: `2px solid ${
            isChecked ? theme.palette.primary.main : "transparent"
          }`,
          width: "100%",
          boxShadow: isDragging
            ? "0 8px 16px rgba(0,0,0,0.15)"
            : isHovered
            ? theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.08)"
            : theme.palette.mode === "dark"
            ? "0 2px 4px rgba(0,0,0,0.3)"
            : "0 2px 4px rgba(0,0,0,0.04)",
          opacity: isReparenting ? 0.7 : 1,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: isDragging ? "none" : "translateY(-1px)",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: "100%", position: "relative" }}
        >
          {/* Checkbox or Home Icon */}
          {!isHome ? (
            <Checkbox
              size="small"
              sx={{
                p: 0,
                mr: 1.5,
                flexShrink: 0,
                color: theme.palette.grey[400],
                "&.Mui-checked": {
                  color: theme.palette.primary.main,
                },
              }}
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={(e) => onSelect(routeId, e.target.checked)}
            />
          ) : (
            <Box
              sx={{
                mr: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: theme.palette.primary.main,
                borderRadius: 2.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <HomeIcon sx={{ fontSize: 20, color: "white" }} />
            </Box>
          )}

          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              minWidth: 0,
              flex: 1,
              maxWidth: `calc(100% - ${dragHandle ? 200 : 160}px)`,
              cursor: children && children.length ? "pointer" : "default",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {children && children.length > 0 && (
              <KeyboardArrowDownIcon
                sx={{
                  cursor: "pointer",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  flexShrink: 0,
                  fontSize: 20,
                  color: theme.palette.grey[600],
                }}
              />
            )}
            <Tooltip
              title={primary.length > MAX_PAGE_NAME_LENGTH ? primary : ""}
              placement="bottom-start"
              arrow
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "visible",
                  minWidth: 0,
                  maxWidth: "100%",
                  fontWeight: isHome ? 600 : 500,
                  fontSize: isHome ? "0.95rem" : "0.875rem",
                  color:
                    effectiveIsRouteVisible === 0
                      ? theme.palette.text.disabled
                      : theme.palette.mode === "dark"
                      ? "#FFFFFF"
                      : "#000000",
                  fontStyle:
                    effectiveIsRouteVisible === 0 ? "italic" : "normal",
                }}
              >
                {primary}
              </Typography>
            </Tooltip>
          </Stack>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              flexShrink: 0,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            {/* Drag Handle */}
            {dragHandle && (
              <Tooltip title="Drag to reorder">
                {React.cloneElement(dragHandle as React.ReactElement, {
                  ...dragListeners,
                })}
              </Tooltip>
            )}

            {/* Delete Button */}
            <Tooltip title="Delete route">
              <span>
                <IconButton
                  size="small"
                  sx={{
                    display: isHome ? "none" : "flex",
                    border: "1px solid",
                    borderColor: theme.palette.error.light,
                    borderRadius: 2,
                    p: 0.5,
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: theme.palette.error.light,
                      borderColor: theme.palette.error.main,
                      transform: "scale(1.05)",
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteDialogBox();
                  }}
                  disabled={isHome}
                >
                  <DeleteIcon
                    fontSize="small"
                    color="error"
                    sx={{ fontSize: 16 }}
                  />
                </IconButton>
              </span>
            </Tooltip>

            {/* Visibility Toggle */}
            <Tooltip title={isRouteVisible === 1 ? "Hide page" : "Show page"}>
              <span>
                <IconButton
                  size="small"
                  sx={{
                    display: isHome ? "none" : "flex",
                    border: "1px solid",
                    borderColor: theme.palette.warning.light,
                    borderRadius: 2,
                    p: 0.5,
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: theme.palette.warning.light,
                      borderColor: theme.palette.warning.main,
                      transform: "scale(1.05)",
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(
                      toggleRouteVisibility({
                        routeId: routeId,
                        isRouteVisible: isRouteVisible === 1 ? 0 : 1,
                        currentRoutePath: pathname,
                      })
                    );
                  }}
                >
                  {isRouteVisible === 1 ? (
                    <VisibilityIcon
                      fontSize="small"
                      color="warning"
                      sx={{ fontSize: 16 }}
                    />
                  ) : (
                    <VisibilityOffIcon
                      fontSize="small"
                      color="warning"
                      sx={{ fontSize: 16 }}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isReparenting ? "Reparenting in progress..." : "route"}>
              <span>
                <IconButton
                  size="small"
                  disabled={!anyCheckboxSelected || isChecked || isReparenting}
                  sx={{
                    border: "1px solid",
                    borderColor:
                      anyCheckboxSelected && !isChecked && !isReparenting
                        ? theme.palette.info.light
                        : theme.palette.grey[300],
                    borderRadius: 2,
                    p: 0.5,
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover:not(:disabled)": {
                      bgcolor: theme.palette.info.light,
                      borderColor: theme.palette.info.main,
                      transform: "scale(1.05)",
                      "& .MuiSvgIcon-root, & .MuiCircularProgress-root": {
                        color: "white",
                      },
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newParentId = routeId;
                    const routeIds = toggledRouteIds;
                    dispatch(reparentRoutes({ newParentId, routeIds }));
                  }}
                >
                  {isReparenting ? (
                    <CircularProgress
                      size={16}
                      sx={{ color: theme.palette.grey[400] }}
                    />
                  ) : (
                    <AltRouteIcon
                      fontSize="small"
                      sx={{
                        fontSize: 16,
                        color:
                          anyCheckboxSelected && !isChecked && !isReparenting
                            ? theme.palette.info.main
                            : theme.palette.grey[400],
                      }}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="add">
              <span>
                <IconButton
                  size="small"
                  sx={{
                    border: "1px solid",
                    borderColor: theme.palette.success.light,
                    borderRadius: 2,
                    p: 0.5,
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: theme.palette.success.light,
                      borderColor: theme.palette.success.main,
                      transform: "scale(1.05)",
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAddDialogBox();
                  }}
                >
                  <AddIcon
                    fontSize="small"
                    color="success"
                    sx={{ fontSize: 16 }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </ListItem>

      {children && children.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={childrenOrderRoutes.map((c) => c.routeId)}
            strategy={verticalListSortingStrategy}
          >
            <Collapse in={open} unmountOnExit sx={{ pl: 0 }}>
              {childrenOrderRoutes.map((c) => (
                <SortableChildItem
                  key={c.routeId}
                  id={c.routeId}
                  width={`calc(${sidebarWidth}px - 48px)`}
                  dragHandle={dragHandle}
                >
                  <ListItemLink
                    {...props}
                    primary={c.menuItem}
                    to={c.path}
                    routeId={c.routeId}
                    children={c.children}
                    level={level + 1}
                    isRouteVisible={Number(c.isRouteVisible)}
                    isParentHidden={effectiveIsRouteVisible === 0}
                  />
                </SortableChildItem>
              ))}
            </Collapse>
          </SortableContext>
        </DndContext>
      )}

      <AddRouteDialogBox
        type="add"
        open={openAddDialogBox}
        handleClose={() => setOpenAddDialogBox(false)}
        parentId={routeId}
      />
      <DeleteDialogBox
        type="page"
        open={openDeleteDialogBox}
        handleClose={() => setOpenDeleteDialogBox(false)}
        routeId={routeId}
      />
    </Box>
  );
};

export default ListItemLink;
