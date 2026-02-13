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
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import TitleIcon from "@mui/icons-material/Title";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, IconButton, Stack, Switch, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";

import React, { useState } from "react";

import StylePicker from "@component/common/StylePicker";
import { createNewRoute, updateRoute } from "@slices/routeSlice/route";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";

import { CustomStylingInfo, PageDialogBoxProps, validationPageSchema } from "../../types/types";

const PageDialogBox = ({
  open,
  type,
  handleClose,
  initialValues,
  parentId,
}: PageDialogBoxProps) => {
  const formData = useAppSelector((state: RootState) => state.route);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [isTitleSelected, setIsTitleSelected] = useState(false);
  const [isDescriptionSelected, setIsDescriptionSelected] = useState(false);
  const [titleDefaultStyleConfigs, setTitleDefaultStyleConfigs] = useState<
    CustomStylingInfo | undefined
  >(initialValues?.customPageTheme?.title);
  const [descriptionDefaultStyleConfigs, setDescriptionDefaultStyleConfigs] = useState<
    CustomStylingInfo | undefined
  >(initialValues?.customPageTheme?.description);

  const dialogBoxType = () => (type === "add" ? "Add New Page" : "Update Page");
  const dialogSubtitle = () =>
    type === "add" ? "Create a new page for sales pitstop" : "Update page details";

  const formik = useFormik({
    initialValues: {
      routeId: initialValues?.routeId ? initialValues.routeId : 0,
      label: initialValues?.label ? initialValues.label : "",
      title: initialValues?.title ? initialValues.title : "",
      description: initialValues?.description ? initialValues.description : "",
      isVisible: !!initialValues?.isVisible,
    },
    validationSchema: validationPageSchema,
    onSubmit: (values) => {
      switch (type) {
        case "add":
          dispatch(
            createNewRoute({
              newContent: {
                label: values.label,
                title: values.title,
                description: values.description !== "" ? values.description : undefined,
                parentId,
                customPageTheme: {
                  title: titleDefaultStyleConfigs,
                  description: descriptionDefaultStyleConfigs,
                },
                isVisible: values.isVisible,
              },
              routePath: window.location.pathname,
            }),
          );
          break;
        case "update":
          dispatch(
            updateRoute({
              page: {
                routeId: values.routeId,
                title: values.title,
                description: values.description,
                menuItem: values.label,
                customPageTheme: {
                  title: titleDefaultStyleConfigs,
                  description: descriptionDefaultStyleConfigs,
                },
                isVisible: values.isVisible,
              },
              routePath: window.location.pathname,
            }),
          );
          break;
      }

      handleClose();
      formik.resetForm();
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    handleClose();
  };

  return (
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
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.orange[100]} 100%)`,
          color: theme.palette.common.white,
          py: 2.5,
          pb: 3,
          position: "relative",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 0.5 }}>
          {dialogBoxType()}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
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

      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Stack spacing={3}>
          {/* Menu Name */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <DescriptionIcon
                sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22, mt: 2 }}
              />
              <Typography variant="h6" fontWeight="600" mt={2}>
                Menu Name
              </Typography>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              name="label"
              placeholder="Enter menu display name"
              size="medium"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.label && Boolean(formik.errors.label)}
              helperText={formik.touched.label && formik.errors.label}
              value={formik.values.label}
            />
          </Box>

          {/* Page Title */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TitleIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="600">
                Page Title
              </Typography>
            </Box>
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                variant="outlined"
                name="title"
                placeholder="Enter a compelling page title"
                size="medium"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onClick={() => {
                  setIsTitleSelected(true);
                  setIsDescriptionSelected(false);
                }}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                value={formik.values.title}
                inputProps={{
                  style: {
                    ...(titleDefaultStyleConfigs || {}),
                  },
                }}
              />
              {isTitleSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    mt: 1,
                    zIndex: 10,
                  }}
                >
                  <StylePicker
                    defaultStyleConfigs={titleDefaultStyleConfigs}
                    setDefaultStyleConfigs={setTitleDefaultStyleConfigs}
                    handleCancel={() => setIsTitleSelected(false)}
                    type="content"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Page Description */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <DescriptionIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="600">
                Page Description
              </Typography>
            </Box>
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="description"
                placeholder="Describe the purpose and content of this page..."
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onClick={() => {
                  setIsDescriptionSelected(true);
                  setIsTitleSelected(false);
                }}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                value={formik.values.description}
                inputProps={{
                  style: {
                    fontSize: 14,
                    ...(descriptionDefaultStyleConfigs || {}),
                  },
                }}
              />
              {isDescriptionSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    mt: 1,
                    zIndex: 10,
                  }}
                >
                  <StylePicker
                    defaultStyleConfigs={descriptionDefaultStyleConfigs}
                    setDefaultStyleConfigs={setDescriptionDefaultStyleConfigs}
                    handleCancel={() => setIsDescriptionSelected(false)}
                    type="content"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Visibility toggle */}
          {formData.label !== "home" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                backgroundColor:
                  theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[50],
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <VisibilityOffIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[400]
                        : theme.palette.grey[600],
                    mr: 1.5,
                    fontSize: 20,
                  }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      color: theme.palette.mode === "dark" ? theme.palette.common.white : "inherit",
                    }}
                  >
                    {formik.values.isVisible ? "Hide Subpage Cards" : "Show Subpage Cards"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? theme.palette.grey[400] : "text.secondary",
                    }}
                  >
                    Toggle visibility of the sub-page cards and the Add Content card on this page
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={formik.values.isVisible}
                onChange={(e) => {
                  formik.setFieldValue("isVisible", e.target.checked);
                }}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
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
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            formik.handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
          }}
        >
          {type === "add" ? "Add Page" : "Update Page"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default PageDialogBox;
