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

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { CustomerTestimonialCardProps } from "../../../types/types";


const CustomerTestimonialCard: React.FC<CustomerTestimonialCardProps> = ({
  testimonial,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete();
  };

  return (
    <Card
      sx={{
        height: "200px",
        maxWidth: "240px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        background: theme.palette.background.paper,
        border: "none",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        opacity: 1,
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: "0 12px 40px rgba(255, 115, 0, 0.15)",
        },
      }}
    >

      {/* Shareable Toggle Button */}
      <Tooltip
        title={testimonial.isShareable ? "Shareable" : "Not Shareable"}
        placement="top"
      >
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            display: "inline-block",
            cursor: "default",
          }}
        >
          <IconButton
            size="small"
            disableRipple
            sx={{
              backgroundColor: testimonial.isShareable
                ? "success.main"
                : "error.main",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
              color: theme.palette.common.white,
              opacity: 1,
              cursor: "default",
              pointerEvents: "none",
              "&:hover": {
                backgroundColor: testimonial.isShareable
                  ? "success.dark"
                  : "error.dark",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            {testimonial.isShareable ? (
              <LockOpenIcon fontSize="small" />
            ) : (
              <LockIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {/* Menu Button  */}
      {isAdmin && (
        <>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: "#ff7300",
                color: "white",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon
                  fontSize="small"
                  sx={{ color: theme.palette.primary.main }}
                />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 0,
          position: "relative",
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        {/* Logo Section with Gradient Overlay */}
        <Box
          sx={{
            position: "relative",
            height: "130px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #fff5f0 0%, #ffe8d9 50%, #ffd4b8 100%)",
            overflow: "hidden",
          }}
        >
          {/* Animated Background Pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 20% 50%, rgba(255, 115, 0, 0.1) 0%, transparent 50%)",

              animation: "float 6s ease-in-out infinite",
            }}
          />

          {/* Logo */}
          {testimonial.logoUrl ? (
            <Box
              component="img"
              src={testimonial.logoUrl}
              alt={testimonial.name}
              sx={{
                maxWidth: "100px",
                maxHeight: "100px",
                width: "auto",
                height: "auto",
                position: "relative",
                zIndex: 1,
                objectFit: "contain",
                transition: "all 0.3s ease",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "70px",
                height: "70px",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(255, 115, 0, 0.15) 0%, rgba(255, 153, 68, 0.08) 100%)",
                fontSize: "4rem",
                fontWeight: 700,
                color: theme.palette.primary.main,
                backdropFilter: "blur(10px)",
              }}
            >
              {testimonial.name}
            </Box>
          )}

          {/* Bottom Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40px",
              background:
                "linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)",
              backdropFilter: "blur(5px)",
            }}
          />
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            px: 1,
            py: 0.5,
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            background: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="700"
            sx={{
              color: theme.palette.text.primary,
              fontSize: "0.9rem",
              lineHeight: 1.3,
              mt: 0,
              mb: 0,
            }}
          >
            {testimonial.name}
          </Typography>

          {testimonial.subTitle && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                lineHeight: 1.4,
                mb: 0.25,
              }}
            >
              {testimonial.subTitle}
            </Typography>
          )}

          {testimonial.websiteUrl && (
            <Box
              component="a"
              href={testimonial.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              sx={{
                color: theme.palette.primary.main,
                fontSize: "0.7rem",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                display: "block",
                mt: 0.25,
                width: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: theme.palette.orange[100],
                },
              }}
              aria-label={testimonial.linkLabel || "Visit website"}
            >
              {testimonial.linkLabel || "Visit Website"}
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                  ml: 0.5,
                  verticalAlign: "middle",
                }}
                aria-hidden="true"
              >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-10px) scale(1.05);
            }
          }
        `}
      </style>
    </Card>
  );
};

export default CustomerTestimonialCard;
