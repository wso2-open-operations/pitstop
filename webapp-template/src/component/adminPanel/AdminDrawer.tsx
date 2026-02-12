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

import React, { useCallback, useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import { RouteResponse, SidebarProps } from "src/types/types";
import ListLinkItem from "./AdminListItem";
import SidebarSortableItem from "../common/SidebarSortableItem";
import { useLocation, matchPath } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  List,
  Drawer,
  Divider,
  IconButton,
  useTheme,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
import { Role } from "@utils/types";
import { reorderRoutes } from "@slices/routeSlice/route";

const INITIAL_SIDEBAR_WIDTH = 450;

const AdminPanelSideBar = (props: SidebarProps) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { pathname } = useLocation();

  const routes = useAppSelector((s: RootState) => s.route.routes);
  const authorizedRoles: Role[] = useAppSelector(
    (s: RootState) => s.auth.roles
  );
  const homeRoute = routes.find((r) => r.routeId === 1);

  const sensors = useSensors(useSensor(PointerSensor));
  const [isAnyItemDragging, setIsAnyItemDragging] = useState(false);
  const [orderRoutes, setOrderRoutes] = useState<RouteResponse[]>([]);
  useEffect(() => { 
    const filteredAndSortableRoutes = routes.filter(
      (r) => r.routeId !== 1 && r.routeId !== -5
    );
    setOrderRoutes(filteredAndSortableRoutes);
  }, [routes]);
  const handleDragStart = () => setIsAnyItemDragging(true);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsAnyItemDragging(false);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = orderRoutes.findIndex((r) => r.routeId === active.id);
      const newIdx = orderRoutes.findIndex((r) => r.routeId === over.id);
      if (oldIdx < 0 || newIdx < 0) return;
      const newOrder = [...orderRoutes];
      const [moved] = newOrder.splice(oldIdx, 1);
      newOrder.splice(newIdx, 0, moved);
      setOrderRoutes(newOrder);
      dispatch(
        reorderRoutes({
          parentId: null,
          reorderRoutes: newOrder.map((r, i) => ({
            routeId: r.routeId,
            routeOrder: i + 1,
            isRouteVisible: Number(r.isRouteVisible ?? 1), 
          })),
        })
      );
    },
    [orderRoutes, dispatch]
  );

  const [sidebarWidth, setSidebarWidth] = useState(INITIAL_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };
  const handleMouseUp = () => setIsResizing(false);
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newW = window.innerWidth - e.clientX;
      if (newW >= INITIAL_SIDEBAR_WIDTH && newW <= 1800) {
        setSidebarWidth(newW);
      }
    },
    [isResizing]
  );
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove]);

  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<number>>(
    new Set()
  );
  const [toggledRouteIds, setToggledRouteIds] = useState<number[]>([]);

  const findRouteById = useCallback(
    (nodes: RouteResponse[], id: number): RouteResponse | undefined => {
      for (const n of nodes) {
        if (n.routeId === id) return n;
        if (n.children) {
          const found = findRouteById(n.children, id);
          if (found) return found;
        }
      }
      return undefined;
    },
    []
  );
  const getAllChildIds = useCallback((r: RouteResponse): number[] => {
    const ids: number[] = [];
    r.children?.forEach((c) => {
      ids.push(c.routeId);
      ids.push(...getAllChildIds(c));
    });
    return ids;
  }, []);

  const handleSelect = useCallback(
    (id: number, checked: boolean) => {
      setToggledRouteIds((prev) => {
        const next = checked
          ? [...prev.filter((x) => x !== id), id]
          : prev.filter((x) => x !== id);
        return next;
      });

      const route = findRouteById(routes, id);
      if (!route) return;
      const childIds = getAllChildIds(route);
      setSelectedRouteIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(id);
          childIds.forEach((i) => next.add(i));
        } else {
          next.delete(id);
          childIds.forEach((i) => next.delete(i));
        }
        return next;
      });
    },
    [routes, findRouteById, getAllChildIds]
  );
  const anyCheckboxSelected = selectedRouteIds.size > 0;
  //---------------------------------------------------------------------------------------//

  //----------------------For the Drawer creating the tree structure-----------------------//
  const dragHandle = (
    <IconButton
      size="small"
      sx={{
        border: "1px solid",
        borderColor: "grey.500",
        borderRadius: 2,
        p: 0.3,
        bgcolor: "background.paper",
        "&:hover": { bgcolor: theme.palette.action.hover },
      }}
    >
      <DragIndicatorIcon fontSize="small" sx={{ cursor: "grab", fontSize: 14 }} />
    </IconButton>
  );

  const reparentingState = useAppSelector((s: RootState) => s.route.reparentingState);
  const isReparenting = reparentingState === "loading";

  const drawer = (
    <Box sx={{ position: "relative" }}>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: 10003,
          position: 'absolute',
          backdropFilter: 'blur(2px)',
          borderRadius: 1,
        }}
        open={isReparenting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Box>
            Reparenting routes...
          </Box>
        </Box>
      </Backdrop>

      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "8px",
          height: "100%",
          cursor: isReparenting ? "not-allowed" : "col-resize",
          zIndex: 10002,
          backgroundColor: "transparent",
          "&:hover": { backgroundColor: isReparenting ? "transparent" : theme.palette.grey[200] },
          pointerEvents: isReparenting ? "none" : "auto",
        }}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderRoutes.map((r) => r.routeId)}
          strategy={verticalListSortingStrategy}
        >
          <List
            sx={{
              ml: 5,
              mr: 1,
              py: 2,
              width: `calc(${sidebarWidth}px - 48px)`,
            }}
          >
            {homeRoute && (
              <ListLinkItem
                key={homeRoute.routeId}
                label={homeRoute.menuItem}
                handleCloseDrawer={props.handleDrawer}
                routeId={homeRoute.routeId}
                primary={homeRoute.menuItem}
                to={homeRoute.path}
                children={homeRoute.children}
                isActive={matchPath(pathname, homeRoute.path) !== null}
                isDragging={isAnyItemDragging}
                sidebarWidth={sidebarWidth}
                selectedRouteIds={selectedRouteIds}
                anyCheckboxSelected={anyCheckboxSelected}
                onSelect={handleSelect}
                toggledRouteIds={toggledRouteIds}
                theme={theme}
                isRouteVisible={Number(homeRoute.isRouteVisible ?? 1)}
                isParentHidden={false} 
              />
            )}
            {orderRoutes.map((route, idx) => (
              <SidebarSortableItem
                key={route.routeId}
                id={route.routeId}
                index={idx}
                width={`calc(${sidebarWidth}px - 48px)`}
                disabled={
                  !authorizedRoles.includes(Role.SALES_ADMIN) ||
                  route.routeId === 1
                }
                dragHandle={dragHandle}
                isAnyItemDragging={isAnyItemDragging}
              >
                <ListLinkItem
                  label={route.menuItem}
                  handleCloseDrawer={props.handleDrawer}
                  routeId={route.routeId}
                  primary={route.menuItem}
                  to={route.path}
                  children={route.children}
                  isActive={matchPath(pathname, route.path) !== null}
                  isDragging={isAnyItemDragging}
                  sidebarWidth={sidebarWidth}
                  selectedRouteIds={selectedRouteIds}
                  anyCheckboxSelected={anyCheckboxSelected}
                  onSelect={handleSelect}
                  toggledRouteIds={toggledRouteIds}
                  theme={theme}
                  isRouteVisible={Number(route.isRouteVisible ?? 1)}
                  isParentHidden={false} 
                />
              </SidebarSortableItem>
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </Box>
  );

  return (
    <Box sx={{ position: "relative" }}>
      <Drawer
        variant="temporary"
        anchor="right"
        open={props.open}
        ModalProps={{ keepMounted: true }}
        onClose={isReparenting ?  () => {} : props.handleDrawer} 
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: sidebarWidth,
            background: theme.palette.secondary.main,
          },
          backdropFilter: "blur(10px)",
          zIndex: 10000,
        }}
      >
        <DrawerHeader>
          <IconButton
            onClick={props.handleDrawer}
            disabled={isReparenting}
            sx={{ 
              color: isReparenting ? theme.palette.grey[500] : theme.palette.primary.contrastText 
            }}
          >
            <CloseIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminPanelSideBar;

export const DrawerFooter = styled("div")(({ theme }) => ({
  position: "relative",
  bottom: 0,
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
export const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingLeft: theme.spacing(1),
  ...theme.mixins.toolbar,
}));
