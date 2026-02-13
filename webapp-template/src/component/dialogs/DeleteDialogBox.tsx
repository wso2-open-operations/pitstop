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

import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import { deleteContent } from "@slices/pageSlice/page";
import { deleteSection } from "@slices/sectionSlice/section";
import { deleteRoute, deleteRouteContent } from "@slices/routeSlice/route";
import { DeleteDialogBoxProps } from "../../types/types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { deleteCustomerTestimonial } from "@slices/customerTestimonialSlice/customerTestimonial";

const DeleteContentDialogBox = ({
  type,
  contentId,
  sectionId,
  routeId,
  testimonialId,
  open,
  handleClose,
}: DeleteDialogBoxProps) => {
  const route = useAppSelector((state: RootState) => state.route);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const dialogBoxTitle = () => {
    switch (type) {
      case "content":
        return "Delete Content";
      case "section":
        return "Delete Section";
      case "page":
        return "Delete Page";
      case "route_content":
        return "Delete Route Content";
      case "testimonial":
        return "Delete Testimonial";
      default:
        return "Delete";
    }
  };

  const dialogSubtitle = () => {
    return "This action cannot be undone";
  };

  const getDialogMessage = () => {
    switch (type) {
      case "content":
        return "If you delete this file, you won't be able to recover it. All associated data will be permanently removed.";
      case "section":
        return "This action cannot be undone. All the contents associated with this section will be permanently lost.";
      case "page":
        return "This action cannot be undone. All the contents and pages associated with this page will be permanently lost.";
      case "route_content":
        return "If you delete this content, you won't be able to recover it. Do you want to proceed?";
      case "testimonial":
        return "If you delete this testimonial, you won't be able to recover it. Do you want to proceed?";
      default:
        return "Are you sure you want to delete this item?";
    }
  };

  const dialogBoxHandler = () => {
    switch (type) {
      case "content":
        if(contentId == null || sectionId == null) return;
        handleClose();
        dispatch(
          deleteContent({
            routeId: route.routeId,
            contentId,
            sectionId,
          }),
        );
        break;
      case "section":
        if(sectionId == null) return;
        handleClose();
        dispatch(
          deleteSection({
            routeId: route.routeId,
            sectionId,
            routePath: window.location.pathname,
          }),
        );
        break;
      case "page":
        if(routeId == null) return;
        handleClose();
        dispatch(
          deleteRoute({
            routeId,
            routePath: window.location.pathname,
          }),
        );
        break;
      case "route_content":
        if(contentId == null) return;
        handleClose();
        dispatch(
          deleteRouteContent({
            routeId: route.routeId,
            contentId,
          }),
        );
        break;
      case "testimonial":
        if(testimonialId == null) return;
        handleClose();
        dispatch(
          deleteCustomerTestimonial({
            id: testimonialId,
          }),
        );
        break;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `${theme.palette.redAccent[200]}`,
            color: "white",
            py: 2.5,
            pb: 3,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold">
              {dialogBoxTitle()}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.95, ml: 5 }}>
            {dialogSubtitle()}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
          <Box
            sx={{
              p: 3,
              backgroundColor:
                theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[50],
            }}
          >
            <Typography variant="body1" sx={{ lineHeight: 1.6 }} mt={2}>
              {getDialogMessage()}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              color: theme.palette.grey[700],
              borderColor: theme.palette.grey[300],
              "&:hover": {
                borderColor: theme.palette.grey[400],
                backgroundColor: theme.palette.grey[50],
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={dialogBoxHandler}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              backgroundColor: theme.palette.redAccent[200],
              "&:hover": {
                backgroundColor: theme.palette.redAccent[100],
              },
              color: theme.palette.common.white,
            }}
          >
            Delete{" "}
            {type === "content" || type === "route_content"
              ? "Content"
              : type === "section"
                ? "Section"
                : type === "page"
                  ? "Page"
                  : "Testimonial"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteContentDialogBox;
