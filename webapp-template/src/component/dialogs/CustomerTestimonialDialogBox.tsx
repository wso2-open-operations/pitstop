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

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import DescriptionIcon from "@mui/icons-material/Description";
import LabelIcon from "@mui/icons-material/Label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@slices/store";
import {
  createCustomerTestimonial,
  updateCustomerTestimonial,
  fetchCustomerTestimonials,
} from "@slices/customerTestimonialSlice/customerTestimonial";
import {
  CustomerTestimonialDialogBoxProps,
  CustomerTestimonialCreatePayload,
  CustomerTestimonialUpdatePayload,
} from "../../types/types";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long"),
  logoUrl: Yup.string()
    .required("Logo URL is required")
    .url("Please enter a valid URL"),
  subTitle: Yup.string().max(200, "Subtitle is too long"),
  websiteUrl: Yup.string()
    .required("Website URL is required")
    .url("Please enter a valid URL"),
  linkLabel: Yup.string().required("Link label is required"),
});

const CustomerTestimonialDialogBox: React.FC<
  CustomerTestimonialDialogBoxProps
> = ({ open, onClose, mode, initialData }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const dialogBoxTitle = () => {
    if (mode === "create") {
      return "Add Customer Testimonial";
    } else {
      return "Edit Customer Testimonial";
    }
  };

  const dialogSubtitle = () => {
    if (mode === "create") {
      return "Add a new customer success story";
    } else {
      return "Update customer testimonial details";
    }
  };

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      logoUrl: initialData?.logoUrl || "",
      subTitle: initialData?.subTitle || "",
      websiteUrl: initialData?.websiteUrl || "",
      linkLabel: initialData?.linkLabel || "",
      isShareable: initialData?.isShareable ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (mode === "create") {
          const payload: CustomerTestimonialCreatePayload = {
            name: values.name.trim(),
            logoUrl: values.logoUrl.trim(),
            subTitle: values.subTitle.trim() || null,
            websiteUrl: values.websiteUrl.trim(),
            linkLabel: values.linkLabel.trim(),
            isShareable: values.isShareable,
          };
          await dispatch(createCustomerTestimonial({ payload })).unwrap();
        } else if (mode === "edit" && initialData) {
          const payload: CustomerTestimonialUpdatePayload = {
            name: values.name.trim(),
            logoUrl: values.logoUrl.trim(),
            subTitle: values.subTitle.trim() || null,
            websiteUrl: values.websiteUrl.trim(),
            linkLabel: values.linkLabel.trim(),
            isShareable: values.isShareable,
          };
          await dispatch(
            updateCustomerTestimonial({
              id: initialData.id,
              payload,
            })
          ).unwrap();
        }

        dispatch(fetchCustomerTestimonials());
        onClose();
        formik.resetForm();
      } catch (error) {
        console.error("Failed to save testimonial:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDialogClose = () => {
    onClose();
    formik.resetForm();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      {/* Header - Orange Gradient */}
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
          {dialogBoxTitle()}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          {dialogSubtitle()}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: theme.palette.common.white,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 4 }}>
        <Stack spacing={3}>
          {/* Company Name */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <BusinessIcon
                sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22, mt: 2 }}
              />
              <Typography variant="h6" fontWeight="700" mt={2}>
                Company Name
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="name"
              placeholder="Enter company name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              required
            />
          </Box>

          {/* Logo URL */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <ImageIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="body1" fontWeight="700">
                Logo URL
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="logoUrl"
              placeholder="https://example.com/logo.png"
              value={formik.values.logoUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.logoUrl && Boolean(formik.errors.logoUrl)}
              helperText={formik.touched.logoUrl && formik.errors.logoUrl}
              required
            />
          </Box>

          {/* Subtitle */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <DescriptionIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="body1" fontWeight="700">
                Subtitle (Optional)
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="subTitle"
              placeholder="Brief description or tagline"
              value={formik.values.subTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.subTitle && Boolean(formik.errors.subTitle)}
              helperText={formik.touched.subTitle && formik.errors.subTitle}
              multiline
              rows={2}
            />
          </Box>

          {/* Link Label */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <LabelIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="body1" fontWeight="700">
                Link Label
              </Typography>
            </Box>
            <FormControl fullWidth required>
              <InputLabel id="link-label-select">Select link label</InputLabel>
              <Select
                labelId="link-label-select"
                name="linkLabel"
                value={formik.values.linkLabel}
                label="Select link label"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.linkLabel && Boolean(formik.errors.linkLabel)}
              >
                <MenuItem value="Visit the Customer Spotlight Playlist">
                  Visit the Customer Spotlight Playlist
                </MenuItem>
                <MenuItem value="Visit the Customer Story Slide">
                  Visit the Customer Story Slide
                </MenuItem>
                <MenuItem value="Read the Customer Case Study">
                  Read the Customer Case Study
                </MenuItem>
                <MenuItem value="Explore the Case study and Customer Spotlight story">
                  Explore the Case study and Customer Spotlight story
                </MenuItem>
              </Select>
              {formik.touched.linkLabel && formik.errors.linkLabel && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {formik.errors.linkLabel}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Website URL */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <LinkIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="body1" fontWeight="700">
                Website URL
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="websiteUrl"
              placeholder="https://company-website.com"
              value={formik.values.websiteUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.websiteUrl && Boolean(formik.errors.websiteUrl)}
              helperText={formik.touched.websiteUrl && formik.errors.websiteUrl}
              required
            />
          </Box>

          {/* Shareable Checkbox */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  name="isShareable"
                  checked={formik.values.isShareable}
                  onChange={formik.handleChange}
                  sx={{
                    color: theme.palette.primary.main,
                    "&.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight="700">
                  Allow this testimonial to be shared externally
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleDialogClose}
          disabled={formik.isSubmitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            "&:hover": {
              borderColor: theme.palette.action.hover,
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={!formik.isValid || formik.isSubmitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            color: theme.palette.common.white,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.orange[100]} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.orange[200]} 100%)`,
            },
          }}
        >
          {formik.isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Add Testimonial"
            : "Update Testimonial"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerTestimonialDialogBox;
