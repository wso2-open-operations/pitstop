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

import { useAppDispatch } from "@slices/store";
import { updateRouteId, updateRouterPath } from "@slices/routeSlice/route";
import { RouteResponse } from "../../types/types";
import ListLinkItem from "@component/layout/LinkItem";
import React, { useEffect, useRef, useState } from "react";
import { Theme } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { NavLink, LinkProps as RouterLinkProps, useLocation, matchPath } from "react-router-dom";
import { Box, Collapse } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((itemProps, ref) => {
  return <NavLink ref={ref} {...itemProps} />;
});

const ListItemLink = (props: ListItemLinkProps) => {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { primary, to, theme, isActive, children, routeId, level, label, handleSideBar, isRoutevisible } = props;
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const isTopLevel = level === 1;

  // Remove the click handler - let React Router handle navigation
  // The Redux state will update via the useEffect below

  useEffect(() => {
    if (matchPath(to, pathname) !== null) {
      dispatch(updateRouteId(routeId));
      dispatch(updateRouterPath({ routeId, currentPath: to, label, children: children || [] }));
    }
  }, [pathname, to, routeId, dispatch, label, children]);

  const handleMouseOver = () => {
    if (children && children.length > 0) {
      setOpen(true);
    }
  };

  const handleMouseOut = () => {
    setOpen(false);
  };

  const adjustDropdownPosition = () => {
    if (dropdownRef.current && navRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (level > 1 && navRect.right + dropdownRect.width > viewportWidth) {
        dropdownRef.current.style.right = "100%";
        dropdownRef.current.style.left = "auto";
      } else {
        dropdownRef.current.style.left = level === 1 ? "0" : "100%";
        dropdownRef.current.style.right = "auto";
      }
    }
  };
  
  useEffect(() => {
    if (open && dropdownRef.current) {
      adjustDropdownPosition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (isRoutevisible == 0) {
    return null;
  }

  return (
  <Box
      ref={navRef}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      sx={{
        position: "relative",
        display: "block",
        margin: 0,
      }}
    >
      <ListItem
        component={routeId !== -1 ? Link : "div"}
        to={routeId !== -1 ? to : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          height: "38px",
          width: "100%",
          pl: level > 2 ? level * 1.5 : 1,
          pr: routeId === -1 ? 3 : 0,
          borderRadius: theme.spacing(0.5),
          margin: 0,
          padding: "0 8px",
          position: "relative",
          "&:hover": {
            background: !isTopLevel ? theme.palette.secondary.dark : "inherit",
          },
          ...(isTopLevel && {
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: isActive ? "90%" : "0%",
              height: "5px",
              backgroundColor: theme.palette.primary.main,
              transition: "width 0.3s ease",
            },
          }),
        }}
      >
        <CssBaseline />
        {children && children.length > 0 && (
          <ExpandMore
            sx={{
              color: theme.palette.primary.contrastText,
              // keep orange only for nested active items if you want
              ...(isActive &&
                !isTopLevel && { color: theme.palette.primary.main }),
            }}
          />
        )}
        <ListItemText
          sx={{
            "& .MuiListItemText-primary": {
              color: theme.palette.primary.contrastText,
              // again, only change color for nested active items
              ...(isActive &&
                !isTopLevel && { color: theme.palette.primary.main }),
              fontSize: "14px",
              fontWeight: 500,
              margin: 0,
              padding: "0 4px",
            },
          }}
          primary={primary}
        />
      </ListItem>

      {/* Dropdown Menu */}
      {children && children.length > 0 && (
        <Collapse
          in={open}
          timeout={300}
          unmountOnExit
          ref={dropdownRef}
          sx={{
            position: "absolute",
            top: level === 1 ? "100%" : "0",
            left: level === 1 ? "0" : "100%",
            display: "inline-block",
            background: theme.palette.secondary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: theme.spacing(0.5),
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            zIndex: 1300,
            width: "auto",
            minWidth: "120px",
            padding: "4px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {children.map((component, idx) => {
            const items = [component];

            return items.map((item, i) => (
              <Box
                key={`${idx}-${i}`}
                sx={{
                  display: "block",
                  width: "100%",
                  borderRadius: "8px",
                  "&:hover": {
                    background: theme.palette.secondary.dark,
                  },
                  color: theme.palette.primary.contrastText,
                  cursor: "pointer",
                }}
              >
                <ListLinkItem
                  routeId={item.routeId}
                  theme={props.theme}
                  to={item.path}
                  label={item.menuItem}
                  primary={item.menuItem}
                  handleSideBar={handleSideBar}
                  isActive={matchPath(item.path, pathname) !== null}
                  children={item.children}
                  level={level + 1}
                />
              </Box>
            ));
          })}
        </Collapse>
      )}
    </Box>
  );
};

export default ListItemLink;

interface ListItemLinkProps {
  routeId: number;
  primary: string;
  to: string;
  label: string;
  isActive: boolean;
  theme: Theme;
  children?: RouteResponse[];
  level: number;
  handleSideBar: () => void;
  isRoutevisible?: number;
}
