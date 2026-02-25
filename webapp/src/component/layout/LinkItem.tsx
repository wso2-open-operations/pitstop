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
import { RouteResponse } from "@/types/types";
import ListLinkItem from "@component/layout/LinkItem";
import React, { useEffect, useRef, useState } from "react";
import { Theme } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { NavLink, LinkProps as RouterLinkProps, useLocation, matchPath } from "react-router-dom";
import { Box } from "@mui/material";

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((itemProps, ref) => {
  return <NavLink ref={ref} {...itemProps} />;
});

const ListItemLink = (props: ListItemLinkProps) => {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { primary, to, theme, isActive, children, routeId, level, label, handleSideBar} = props;
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const isTopLevel = level === 1;

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

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
  <Box
      ref={navRef}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      sx={{
        position: "relative",
        display: "inline-block",
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
        {children && children.length > 0 && (
          <ExpandMore
            sx={{
              color: theme.palette.primary.contrastText,
              ...(isActive &&
                !isTopLevel && { color: theme.palette.primary.main }),
            }}
          />
        )}
        <ListItemText
          sx={{
            "& .MuiListItemText-primary": {
              color: theme.palette.primary.contrastText,
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
        <Box
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          sx={{
            position: "absolute",
            top: level === 1 ? "calc(100% + 2px)" : "0",
            left: level === 1 ? "0" : "100%",
            ml: level > 1 ? "4px" : 0,
            display: open ? "inline-block" : "none",
            background: theme.palette.secondary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: theme.spacing(0.5),
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            zIndex: 1300,
            width: "auto",
            minWidth: "180px",
            padding: "8px 4px",
            whiteSpace: "nowrap",
          }}
        >
          {children.map((component) => (
            <Box
              key={component.routeId}
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
                routeId={component.routeId}
                theme={props.theme}
                to={component.path}
                label={component.menuItem}
                primary={component.menuItem}
                handleSideBar={handleSideBar}
                isActive={matchPath(component.path, pathname) !== null}
                children={component.children}
                level={level + 1}
                isRouteVisible={0}
              />
            </Box>
          ))}
        </Box>
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
  isRouteVisible: number;
}
