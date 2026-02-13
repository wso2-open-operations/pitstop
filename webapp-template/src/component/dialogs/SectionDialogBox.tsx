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
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import TitleIcon from "@mui/icons-material/Title";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import Cropper, { Area, Point } from "react-easy-crop";

import { useEffect,useRef, useState } from "react";

import RichTextEditor from "@component/common/RichTextEditor";
import { SkeletonCard } from "@component/ui/content/SkeletonCard";
import { getAllTags } from "@slices/pageSlice/page";
import { createNewSection, updateSection } from "@slices/sectionSlice/section";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import { SectionType } from "@utils/types";

import {
  CropSizingInfo,
  CustomStylingInfo,
  SectionDialogBoxProps,
  validationSectionSchema,
} from "../../types/types";

const SectionDialogBox = ({
  type,
  open,
  sectionId,
  handleClose,
  initialValues,
}: SectionDialogBoxProps) => {
  const routeId = useAppSelector((state: RootState) => state.route.routeId);
  const dispatch = useAppDispatch();

  const tagData = useAppSelector((state: RootState) => state.page.tagData);
  
  const theme = useTheme();
  const orange100 = (theme.palette as any).orange?.[100] ?? theme.palette.secondary.main;

  const normalizeQuillHtml = (html: string) => {
    const v = (html ?? "").trim();

    if (v === "" || v === "<p><br></p>" || v === "<p></p>") return "";

    return v;
  };

  const [isImageSelected, setIsImageSelected] = useState(
    initialValues?.sectionType === SectionType.Image,
  );

  const [useTitleRichText] = useState(initialValues?.customSectionTheme?.title?.richText || false);
  const [useDescriptionRichText] = useState(
    initialValues?.customSectionTheme?.description?.richText || false,
  );

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropWidth, setCropWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [titleDefaultStyleConfigs, setTitleDefaultStyleConfigs] = useState<
    CustomStylingInfo | undefined
  >(initialValues?.customSectionTheme?.title);

  const [descriptionDefaultStyleConfigs, setDescriptionDefaultStyleConfigs] = useState<
    CustomStylingInfo | undefined
  >(initialValues?.customSectionTheme?.description);

  const [croppedImageDefaultSizing, setCroppedImageDefaultSizing] = useState<
    CropSizingInfo | undefined
  >(initialValues?.customSectionTheme?.cropSizing);

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedImageDefaultSizing(croppedAreaPixels);
  };

  const onMediaLoad = () => {
    if (containerRef.current) {
      setCropWidth(containerRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    if (!tagData || tagData.length === 0) {
      dispatch(getAllTags());
    }
  }, [dispatch, tagData]);

  const cropSize = {
    height: 200,
    width: cropWidth,
  };

  const dialogBoxTitle = () => {
    if (type === "add") {
      return `Add New Section`;
    }
    return `Update Section`;
  };

  const dialogSubtitle = () => {
    if (type === "add") {
      return `Create a new section for your page`;
    }
    return `Update section details and settings`;
  };

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title ? initialValues.title : "",
      description: initialValues?.description ? initialValues.description : "",
      sectionType: initialValues?.sectionType ? initialValues.sectionType : "",
      imageUrl: initialValues?.imageUrl ? initialValues.imageUrl : undefined,
      redirectUrl: initialValues?.redirectUrl ? initialValues.redirectUrl : undefined,
      tags: initialValues?.tags ? initialValues.tags : "",
    },
    enableReinitialize: true,
    validationSchema: validationSectionSchema,
    onSubmit: (values) => {
      switch (type) {
        case "add":
          dispatch(
            createNewSection({
              section: {
                ...values,
                routeId,
                customSectionTheme: {
                  title: titleDefaultStyleConfigs,
                  description: descriptionDefaultStyleConfigs,
                  cropSizing: croppedImageDefaultSizing,
                },
              },
              routePath: window.location.pathname,
            }),
          );
          break;

        case "update": {
          const updatedSection = {
            ...values,
          };
          dispatch(
            updateSection({
              section: {
                sectionId: sectionId ? sectionId : 0,
                title: updatedSection.title,
                description: updatedSection.description,
                sectionType: updatedSection.sectionType,
                imageUrl: updatedSection.imageUrl,
                redirectUrl: updatedSection.redirectUrl,
                tags: updatedSection.tags,
                customSectionTheme: {
                  title: titleDefaultStyleConfigs,
                  description: descriptionDefaultStyleConfigs,
                  cropSizing: croppedImageDefaultSizing,
                },
              },
              routePath: window.location.pathname,
            }),
          );
          break;
        }
      }
      handleClose();
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (useTitleRichText && formik.values.title && !titleDefaultStyleConfigs?.htmlContent) {
      setTitleDefaultStyleConfigs((prev) => ({
        ...prev,
        richText: true,
        htmlContent: formik.values.title,
      }));
    }
  }, [useTitleRichText, formik.values.title, titleDefaultStyleConfigs?.htmlContent]);

  useEffect(() => {
    if (
      useDescriptionRichText &&
      formik.values.description &&
      !descriptionDefaultStyleConfigs?.htmlContent
    ) {
      setDescriptionDefaultStyleConfigs((prev) => ({
        ...prev,
        richText: true,
        htmlContent: formik.values.description,
      }));
    }
  }, [
    useDescriptionRichText,
    formik.values.description,
    descriptionDefaultStyleConfigs?.htmlContent,
  ]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          overflow: "visible",
          minHeight: "600px",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${orange100} 100%)`,
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
          {/* Section Type */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <DescriptionIcon
                sx={{
                  color: theme.palette.primary.main,
                  mr: 1,
                  fontSize: 22,
                  mt: 2,
                }}
              />
              <Typography variant="h6" fontWeight="700" mt={2}>
                Section Type
              </Typography>
            </Box>
            <FormControl fullWidth>
              <Select
                fullWidth
                value={formik.values.sectionType}
                onChange={(event) => {
                  formik.setFieldValue("sectionType", event.target.value);
                  setIsImageSelected(event.target.value === SectionType.Image);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.sectionType && Boolean(formik.errors.sectionType)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select section type
                </MenuItem>
                {Object.values(SectionType).map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.sectionType && formik.errors.sectionType && (
                <FormHelperText error>{formik.errors.sectionType}</FormHelperText>
              )}
            </FormControl>
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <CategoryIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="h6" fontWeight="700">
                Redirection URL (Optional)
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="redirectUrl"
              placeholder="https://example.com/redirect"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.redirectUrl && Boolean(formik.errors.redirectUrl)}
              helperText={formik.touched.redirectUrl && formik.errors.redirectUrl}
              value={formik.values.redirectUrl}
            />
          </Box>
          {/* Conditional Content Based on Section Type */}
          {isImageSelected ? (
            <>
              {/* Image Title */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <LinkIcon
                    sx={{
                      color: theme.palette.primary.main,
                      mr: 1,
                      fontSize: 22,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700">
                    Image Title
                  </Typography>
                </Box>
                <Box sx={{ position: "relative" }}>
                  <RichTextEditor
                    value={titleDefaultStyleConfigs?.htmlContent || formik.values.title}
                    onChange={(rawHtml) => {
                      const html = normalizeQuillHtml(rawHtml);

                      setTitleDefaultStyleConfigs({
                        ...titleDefaultStyleConfigs,
                        richText: true,
                        htmlContent: html,
                      });

                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = html;

                      formik.setFieldValue(
                        "title",
                        (tempDiv.textContent || tempDiv.innerText || "").trim(),
                      );
                    }}
                    placeholder="Enter image title"
                    height="120px"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {formik.errors.title}
                    </FormHelperText>
                  )}
                </Box>
              </Box>

              {/* Image URL */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <LinkIcon
                    sx={{
                      color: theme.palette.primary.main,
                      mr: 1,
                      fontSize: 22,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700">
                    Image URL
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                  helperText={formik.touched.imageUrl && formik.errors.imageUrl}
                  value={formik.values.imageUrl}
                />
              </Box>

              {/* Image Cropper Preview */}
              {formik.values.imageUrl && (
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight="700"
                    sx={{ mb: 2, color: theme.palette.text.primary }}
                  >
                    Image Preview &amp; Crop
                  </Typography>
                  <Box
                    ref={containerRef}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 400,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                      mb: 2,
                    }}
                  >
                    <Cropper
                      image={formik.values.imageUrl}
                      crop={crop}
                      zoom={zoom}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      zoomWithScroll={false}
                      onMediaLoaded={onMediaLoad}
                      cropSize={cropSize}
                      objectFit="horizontal-cover"
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" fontWeight="600" sx={{ minWidth: 60 }}>
                      Zoom
                    </Typography>
                    <Slider
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(_e, zoomVal) => setZoom(Number(zoomVal))}
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <>
              {/* Section Title */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <TitleIcon
                    sx={{
                      color: theme.palette.primary.main,
                      mr: 1,
                      fontSize: 22,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700">
                    Section Title
                  </Typography>
                </Box>
                <Box sx={{ position: "relative" }}>
                  <RichTextEditor
                    value={titleDefaultStyleConfigs?.htmlContent || formik.values.title}
                    onChange={(rawHtml) => {
                      const html = normalizeQuillHtml(rawHtml);

                      setTitleDefaultStyleConfigs({
                        ...titleDefaultStyleConfigs,
                        richText: true,
                        htmlContent: html,
                      });

                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = html;

                      formik.setFieldValue(
                        "title",
                        (tempDiv.textContent || tempDiv.innerText || "").trim(),
                      );
                    }}
                    placeholder="Enter section title (select text to format specific words)"
                    height="120px"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {formik.errors.title}
                    </FormHelperText>
                  )}
                </Box>
              </Box>

              {/* Description */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <DescriptionIcon
                    sx={{
                      color: theme.palette.primary.main,
                      mr: 1,
                      fontSize: 22,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700">
                    Description
                  </Typography>
                </Box>
                <Box sx={{ position: "relative" }}>
                  <RichTextEditor
                    value={descriptionDefaultStyleConfigs?.htmlContent || formik.values.description}
                    onChange={(rawHtml) => {
                      const html = normalizeQuillHtml(rawHtml);

                      setDescriptionDefaultStyleConfigs({
                        ...descriptionDefaultStyleConfigs,
                        richText: true,
                        htmlContent: html,
                      });

                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = html;

                      formik.setFieldValue(
                        "description",
                        (tempDiv.textContent || tempDiv.innerText || "").trim(),
                      );
                    }}
                    placeholder="Describe the purpose and content of this section..."
                    height="150px"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {formik.errors.description}
                    </FormHelperText>
                  )}
                </Box>
              </Box>

              {/* Preview Section */}
              {formik.values.sectionType && (
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight="700"
                    sx={{ mb: 2, color: theme.palette.text.primary }}
                  >
                    Preview
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      maxHeight: 450,
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      {titleDefaultStyleConfigs?.htmlContent ? (
                        <Box
                          sx={{
                            mb: 0.5,
                            fontWeight: "bold",
                            fontSize: theme.typography.h6.fontSize,
                            lineHeight: theme.typography.h6.lineHeight,
                            "& p": { margin: 0 },
                            "& p + p": { marginTop: 1 },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: titleDefaultStyleConfigs.htmlContent || "",
                          }}
                        />
                      ) : (
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {formik.values.title || "Section Title"}
                        </Typography>
                      )}

                      {descriptionDefaultStyleConfigs?.htmlContent ? (
                        <Box
                          sx={{
                            mb: 2,
                            color: theme.palette.text.secondary,
                            fontSize: theme.typography.body2.fontSize,
                            lineHeight: theme.typography.body2.lineHeight,
                            "& p": { margin: 0 },
                            "& p + p": { marginTop: 1 },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: descriptionDefaultStyleConfigs.htmlContent || "",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {formik.values.description || "Section description will appear here"}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {[...Array(3)].map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: "0 0 calc(33.333% - 16px)",
                            minWidth: "200px",
                          }}
                        >
                          <Box
                            sx={{
                              transform: "scale(0.6)",
                              transformOrigin: "top left",
                              width: "166.67%",
                            }}
                          >
                            <SkeletonCard />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Stack>
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
          onClick={() => formik.handleSubmit()}
          disabled={!formik.isValid}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
          }}
        >
          {type === "add" ? "Add" : "Update"} {"Section"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default SectionDialogBox;
