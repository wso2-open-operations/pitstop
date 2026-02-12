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

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@slices/store";
import { FILETYPE, Role, CONTENT_SUBTYPE } from "../../../utils/types";
import IframeViewerDialogBox from "../../../component/dialogs/IframeViewerDialogBox";
import UpdateContentDialogBox from "../../dialogs/ContentDialogBox";
import ExpandedContentCard from "./ExpandedContent";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import wso2LogoWhite from "@assets/images/wso2-logo-white.png";
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grow,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
  CardMedia,
  Chip,
  Button,
  Modal,
  Fade
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import UpdateIcon from "@mui/icons-material/Update";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArticleIcon from "@mui/icons-material/Article";
import dayjs from "dayjs";
import { CustomTheme, CustomButton } from "src/types/types";
import {
  getAllComments,
  likeContent,
  updateContent,
  pinContent,
  unpinContent,
} from "../../../slices/pageSlice/page";
import {
  getCustomButtons,
  createCustomButton,
  updateCustomButton,
  deleteCustomButton,
} from "../../../slices/customButtonSlice/customButton";
import { enqueueSnackbarMessage } from "../../../slices/commonSlice/common";
import { getGoogleDocsDownloadUrl, getEmbedUrl } from "../../../utils/utils";
import DeleteDialogBox from "../../../component/dialogs/DeleteDialogBox";
import CustomButtonConfigDialog from "../../dialogs/CustomButtonConfigDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { safeParseHtml } from "@utils/safeHtml";
import { GOOGLE_DRIVE_DOMAIN, GOOGLE_DOCS_DOMAIN } from "@config/constant";

interface ComponentCardProps {
  contentId: number;
  contentLink: string;
  contentType: string;
  contentSubtype?: CONTENT_SUBTYPE;
  description: string;
  thumbnail?: string;
  note?: string;
  customContentTheme?: CustomTheme;
  contentOrder: number;
  likesCount: number;
  sectionId: number;
  status?: boolean;
  commentCount: number;
  isExpanded?: boolean;
  createdOn: string;
  contentIndex?: number;
  tags: string[];
  customButtons?: CustomButton[];
  isInPinnedSection?: boolean;
  onContentUnpinned?: (contentId: number) => void;
  isVisible?: boolean;
  isReused?: boolean;
}

export declare let _paq: unknown[];
if (typeof window !== "undefined" && typeof _paq === "undefined") {
  (window as unknown as { _paq: unknown[] })._paq = [];
}

const PREVIEW_W = 323;
const PREVIEW_H = 161;
const CARD_W = 399;
const CARD_H = 424;

const ComponentCard = ({
  contentId,
  contentLink,
  contentType,
  contentSubtype,
  description,
  likesCount: initialLikesCount,
  sectionId,
  status,
  thumbnail,
  note,
  customContentTheme,
  contentOrder,
  commentCount,
  isExpanded,
  createdOn,
  contentIndex,
  tags,
  customButtons = [],
  isVisible = true,
  isReused,
  onContentUnpinned,
  isInPinnedSection,
}: ComponentCardProps) => {
  const authorizedRoles: Role[] = useAppSelector(
    (state: RootState) => state.auth.roles
  );
  const location = useLocation();
  const [like, setLike] = useState(status);
  const [localLikesCount, setLocalLikesCount] = useState(initialLikesCount);
  const pinnedContentIds = useAppSelector(
    (state: RootState) => state.page.pinnedContentIds
  );
  const isPinned = pinnedContentIds.includes(contentId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCustomButtonDialogOpen, setIsCustomButtonDialogOpen] =
    useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [imageError, setImageError] = useState(false);
  const isMenuItemsOpen = Boolean(anchorEl);
  const liked = useAppSelector((state: RootState) => state.page.likeState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const theme = useTheme();

  const urlCheckDone = useRef(false);
  const [urlProcessed, setUrlProcessed] = useState(false);

  const toggleInfoModal = () => {
    setIsInfoModalOpen((prev) => !prev);
  };


  const getButtonIcon = (iconName?: string) => {
    switch (iconName) {
      case "link":
        return <LinkIcon />;
      case "record":
        return <PlayArrowIcon />;
      case "document":
        return <DescriptionIcon />;
      case "presentation":
        return <SlideshowIcon />;
      case "brochure":
        return <MenuBookIcon />;
      case "article":
        return <ArticleIcon />;
      case "none":
        return null;
      default:
        return null;
    }
  };

  const handleCustomButtonAction = (button: CustomButton) => {
    //------------------------------Matomo Custom Button event tracker---------------------------------//
    if (window.config?.IS_MATOMO_ENABLED) {
      _paq.push([
        "trackEvent",
        "User Interaction",
        "Custom Button Click",
        `Button: ${button.label}`,
      ]);
    }
    //----------------------------------------------------------------------------------------//

    switch (button.action) {
      case "link":
        if (button.actionValue) {
          window.open(button.actionValue, "_blank");
        }
        break;
      case "download":
        if (button.actionValue) {
          try {
            const isGoogleUrl =
              button.actionValue.includes(GOOGLE_DOCS_DOMAIN) ||
              button.actionValue.includes(GOOGLE_DRIVE_DOMAIN);
            const downloadUrl = isGoogleUrl
              ? getGoogleDocsDownloadUrl(button.actionValue)
              : button.actionValue;
            if (isGoogleUrl) {
              window.open(downloadUrl, "_blank");
            } else {
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = downloadUrl.split("/").pop() || "download";
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } catch (error) {
            console.error("Download failed:", error);
            window.open(button.actionValue, "_blank");
          }
        }
        break;
      default:
        break;
    }
  };
  const customButtonsFromStore = useAppSelector(
    (state: RootState) =>
      state.customButton.buttonsByContentId[contentId.toString()] || []
  );

  const [localCustomButtons, setLocalCustomButtons] = useState<CustomButton[]>(
    customButtonsFromStore
  );
  const [localIsVisible, setLocalIsVisible] = useState(isVisible);

  useEffect(() => {
    setLocalIsVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (contentId) {
      dispatch(getCustomButtons(contentId.toString()));
    }
  }, [contentId, dispatch]);

  useEffect(() => {
    setLocalCustomButtons(customButtonsFromStore);
  }, [customButtonsFromStore]);

  const handleSaveCustomButtons = async (buttons: CustomButton[]) => {
    const reorderedButtons = buttons.map((button, index) => ({
      ...button,
      order: index,
    }));

    setLocalCustomButtons(reorderedButtons);
    setIsCustomButtonDialogOpen(false);

    const originalButtonIds = customButtonsFromStore.map((btn) => btn.id);
    const newButtonIds = buttons.map((btn) => btn.id).filter((id) => id > 0);
    const deletedButtonIds = originalButtonIds.filter(
      (id) => !newButtonIds.includes(id)
    );

    const newButtons = reorderedButtons.filter((btn) => btn.id < 0);
    const existingButtons = reorderedButtons.filter((btn) => btn.id > 0);
    const buttonsToUpdate = existingButtons.filter((btn) => {
      const original = customButtonsFromStore.find(
        (orig) => orig.id === btn.id
      );
      return (
        original &&
        (original.label !== btn.label ||
          original.description !== btn.description ||
          original.icon !== btn.icon ||
          original.color !== btn.color ||
          original.action !== btn.action ||
          original.actionValue !== btn.actionValue ||
          original.isVisible !== btn.isVisible ||
          original.order !== btn.order)
      );
    });

    let hasOperations = false;
    let operationType = "";

    if (deletedButtonIds.length > 0) {
      hasOperations = true;
      operationType = "delete";
      for (const buttonId of deletedButtonIds) {
        await dispatch(
          deleteCustomButton({ buttonId, showNotification: false })
        ).unwrap();
      }
    }

    if (newButtons.length > 0) {
      hasOperations = true;
      if (!operationType) operationType = "create";
      else if (operationType !== "create") operationType = "mixed";

      for (let index = 0; index < newButtons.length; index++) {
        const button = newButtons[index];

        const buttonToSave = {
          ...button,
          contentId: contentId.toString(),
          order: reorderedButtons.findIndex((btn) => btn === button),
          description: button.description?.trim() || "",
          icon: button.icon || null,
          color: button.color || "orange",
          isVisible: button.isVisible !== false,
        };

        if (
          !buttonToSave.contentId ||
          !buttonToSave.action ||
          !buttonToSave.actionValue?.trim()
        ) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...newButtonData } = buttonToSave;
        await dispatch(
          createCustomButton({ button: newButtonData, showNotification: false })
        ).unwrap();

        if (index < newButtons.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    if (buttonsToUpdate.length > 0) {
      hasOperations = true;
      if (!operationType) operationType = "update";
      else if (operationType !== "update") operationType = "mixed";
      for (const button of buttonsToUpdate) {
        const buttonToSave = {
          ...button,
          contentId: contentId.toString(),
          order: reorderedButtons.findIndex((btn) => btn.id === button.id),
          label: button.label?.trim() || "",
          description: button.description?.trim() || "",
          icon: button.icon || null,
          color: button.color || "orange",
          isVisible: button.isVisible !== false,
        };

        if (
          !buttonToSave.contentId ||
          !buttonToSave.action ||
          !buttonToSave.actionValue?.trim()
        ) {
          continue;
        }
        await dispatch(
          updateCustomButton({ button: buttonToSave, showNotification: false })
        ).unwrap();
      }
    }
    if (hasOperations) {
      let message = "";
      switch (operationType) {
        case "create":
          message =
            newButtons.length === 1
              ? "Custom button created successfully"
              : "Custom buttons created successfully";
          break;
        case "update":
          message =
            buttonsToUpdate.length === 1
              ? "Custom button updated successfully"
              : "Custom buttons updated successfully";
          break;
        case "delete":
          message =
            deletedButtonIds.length === 1
              ? "Custom button deleted successfully"
              : "Custom buttons deleted successfully";
          break;
        case "mixed":
          message = "Custom buttons saved successfully";
          break;
        default:
          message = "Custom buttons saved successfully";
      }

      dispatch(
        enqueueSnackbarMessage({
          message,
          type: "success",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        })
      );
      setTimeout(() => {
        dispatch(getCustomButtons(contentId.toString()));
      }, 300);
    }
  };

  const commentDrawerHandler = () => {
    setIsCommentDrawerOpen(true);
    dispatch(getAllComments({ contentId }));

    const currentSearch = new URLSearchParams(location.search);
    currentSearch.set("contentId", contentId.toString());
    currentSearch.set("sectionId", sectionId.toString());

    const newUrl = `${location.pathname}?${currentSearch.toString()}`;
    navigate(newUrl, { replace: true });
  };

  const closeCommentDrawer = () => {
    setIsCommentDrawerOpen(false);
    urlCheckDone.current = false;
    setUrlProcessed(false);
    const currentSearch = new URLSearchParams(location.search);
    currentSearch.delete("contentId");
    currentSearch.delete("sectionId");
    const searchString = currentSearch.toString();
    const newUrl = location.pathname + (searchString ? `?${searchString}` : "");

    navigate(newUrl, { replace: true });
  };

  const getCommentDialogFromUrl = useCallback((): {
    shouldOpenComments: boolean;
    contentId: number | null;
  } => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentIdParam = urlParams.get("contentId");
    const sectionIdParam = urlParams.get("sectionId");
    const contentId = contentIdParam ? parseInt(contentIdParam, 10) : null;
    const urlSectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : null;

    return {
      shouldOpenComments:
        contentId !== null && urlSectionId === sectionId && !urlProcessed,
      contentId: contentId && !isNaN(contentId) ? contentId : null,
    };
  }, [sectionId, urlProcessed]);

  useEffect(() => {
    if (!isExpanded) {
      const { shouldOpenComments, contentId: urlContentId } =
        getCommentDialogFromUrl();

      if (
        shouldOpenComments &&
        urlContentId === contentId &&
        !urlCheckDone.current
      ) {
        setIsCommentDrawerOpen(true);
        dispatch(getAllComments({ contentId }));
        urlCheckDone.current = true;
        setUrlProcessed(true);
      }
    }
  }, [contentId, dispatch, isExpanded, getCommentDialogFromUrl]);

  const toggleLike = () => {
    dispatch(likeContent({ contentId }));
    if (liked !== "failed") {
      setLike((prev) => {
        const next = !prev;

        setLocalLikesCount((c) => (next ? c + 1 : c - 1));
        if (window.config?.IS_MATOMO_ENABLED) {
          _paq.push([
            "trackEvent",
            "User Interaction",
            next ? "Like" : "Unlike",
            `Content : ${description}`,
          ]);
        }
        return next;
      });
    }
  };

  const togglePin = () => {
    const action = isPinned
      ? unpinContent({ contentId })
      : pinContent({ contentId });

    dispatch(action)
      .unwrap()
      .then(() => {
        if (isPinned && isInPinnedSection) {
          onContentUnpinned?.(contentId);
        }

        if (window.config?.IS_MATOMO_ENABLED) {
          _paq.push([
            "trackEvent",
            "User Interaction",
            isPinned ? "Unpin Content" : "Pin Content",
            `Content : ${description}`,
          ]);
        }
      })
      .catch(() => {
        dispatch(
          enqueueSnackbarMessage({
            message: isPinned
              ? "Failed to unpin content. Please try again."
              : "Failed to pin content. Please try again.",
            type: "error",
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          })
        );
      });
  };

  const toggleVisibility = () => {
    const newVisibility = !localIsVisible;
    setLocalIsVisible(newVisibility);
    dispatch(
      updateContent({
        contentId,
        content: { isVisible: newVisibility },
        routePath: location.pathname,
      })
    )
      .unwrap()
      .catch(() => {
        setLocalIsVisible(!newVisibility);
        dispatch(
          enqueueSnackbarMessage({
            message: "Failed to update content visibility",
            type: "error",
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          })
        );
      });
  };

  const shouldShowIframe = () => {
    if (contentType === FILETYPE.External_Link) {
      return contentSubtype && contentSubtype !== CONTENT_SUBTYPE.Generic;
    }
    return [FILETYPE.Slide, FILETYPE.GSheet, FILETYPE.Youtube].includes(contentType as FILETYPE);
  };

  const shouldShowWSO2Placeholder = () => {
    if (contentType === FILETYPE.External_Link) {
      return !contentSubtype || contentSubtype === CONTENT_SUBTYPE.Generic;
    }
    return [FILETYPE.Salesforce, FILETYPE.Lms].includes(contentType as FILETYPE);
  };

  const getEmbedContent = () => {
    const embedUrl = getEmbedUrl(contentType as FILETYPE, contentLink, contentSubtype);
    
    return (
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <iframe
        title="Content Viewer"
        src={embedUrl}
        width={`${PREVIEW_W}px`}
        height={`${PREVIEW_H}px`}
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
        style={{
          ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
          !localIsVisible
            ? {
                opacity: 0.6,
                filter: "grayscale(80%) blur(0.5px)",
              }
            : {}),
        }}
      /> 
      </Box>
    );
  };

  return (
    <Grow
      in
      style={{ transformOrigin: "0 0 0" }}
      {...(contentIndex ? { timeout: contentIndex * 200 } : {})}
    >
      <Card
        elevation={3}
        sx={{
          mx: 1.25,
          my: 1.25,
          width: `${CARD_W}px`,
          height: `${CARD_H}px`,
          borderRadius: 10,
          position: "relative",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#14151be3",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          cursor: "pointer",
          transition: "all 0.3s ease-out",
          "&:hover": {
            transform: "translateY(-16px)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
            "& .card-media": {
              transform: "translateX(-50%) translateY(-6px) scale(1.02)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            },
            "& .pin-button": {
              transform: "scale(1.1)",
            },
            "& .card-content": {
              transform: "translateY(-2px)",
            },
          },
          ...(authorizedRoles.includes(Role.SALES_ADMIN) && !localIsVisible
            ? {
                backgroundColor: "rgba(42, 45, 58, 0.4)",
                border: "2px dashed rgba(255,255,255,0.2)",
              }
            : {}),
        }}
      >
        {localIsVisible && (
          <IconButton
            aria-label={isPinned ? "Unpin this content" : "Pin this content"}
            onClick={togglePin}
            className="pin-button"
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 10,
              color: isPinned ? "#fe9c33ff" : "rgba(255,255,255,0.7)",
              backgroundColor: "rgba(42,45,58,0.8)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "&:hover": {
                backgroundColor: "rgba(42,45,58,0.95)",
                color: "#ffd700",
              },
            }}
            size="small"
          >
            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </IconButton>
        )}

        <CardMedia
          className="card-media"
          sx={{
            position: "absolute",
            top: -30,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${PREVIEW_W}px`,
            height: `${PREVIEW_H}px`,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: `0 15px 40px ${theme.palette.common.black}`,
            zIndex: 3,
            background: theme.palette.common.black,
            border: `1px solid ${theme.palette.primary.main}`,
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            ...(authorizedRoles.includes(Role.SALES_ADMIN) && !localIsVisible
              ? {
                  opacity: 0.7,
                  filter: "grayscale(60%) blur(1px)",
                  background: "rgba(45, 45, 45, 0.5)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                  },
                }
              : {}),
          }}
        >
          {(([
            FILETYPE.External_Link,
            FILETYPE.Salesforce,
            FILETYPE.Youtube,
            FILETYPE.Slide,
            FILETYPE.Lms,
            FILETYPE.GSheet,
          ].includes(contentType as FILETYPE) &&
            !(contentType === FILETYPE.External_Link && contentSubtype === CONTENT_SUBTYPE.Video )) || thumbnail) && (
            <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 20 }}>
              <Tooltip title="Open preview" arrow>
                <IconButton
                  size="small"
                  aria-label="open-preview-modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPreviewModalOpen(true);
                    if (window.config?.IS_MATOMO_ENABLED) {
                      _paq.push([
                        "trackEvent",
                        "User Interaction",
                        "Thumbnail Click",
                        `Content: ${description}`,
                      ]);
                    }
                  }}
                  sx={{
                    color: theme.palette.common.white,
                    backgroundColor: "rgba(60, 60, 60, 0.6)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { backgroundColor: "rgba(80, 80, 80, 0.9)" },
                  }}
                >
                  <OpenInNewIcon sx={{ width: 18, height: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {!thumbnail ? (
            shouldShowWSO2Placeholder() ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                gap={0.5}
                sx={{
                  ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
                  !localIsVisible
                    ? {
                        opacity: 0.7,
                        filter: "grayscale(80%)",
                      }
                    : {}),
                }}
              >
                <img
                  alt="logo"
                  width="48"
                  height="auto"
                  src={wso2LogoWhite}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.primary.main,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: 600,
                    ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
                    !localIsVisible
                      ? {
                          color: "rgba(255,255,255,0.6)",
                        }
                      : {}),
                  }}
                >
                  Sales Pitstop
                </Typography>
              </Box>
            ) : shouldShowIframe() ? (
              getEmbedContent()
            ) : null
          ) : (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
                !localIsVisible
                  ? {
                      "&::after": {
                        content: '"HIDDEN"',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        padding: "3px 6px",
                        borderRadius: "3px",
                        zIndex: 10,
                        textAlign: "center",
                        border: "1px solid rgba(255,255,255,0.3)",
                      },
                    }
                  : {}),
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter:
                    authorizedRoles.includes(Role.SALES_ADMIN) &&
                    !localIsVisible
                      ? "blur(4px) grayscale(70%)"
                      : "blur(5px)",
                  transform: "scale(1.1)",
                  opacity:
                    authorizedRoles.includes(Role.SALES_ADMIN) &&
                    !localIsVisible
                      ? 0.5
                      : 0.7,
                }}
              />
              <Box
                sx={{
                  position: "relative",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageError ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                    width="100%"
                    sx={{
                      backgroundColor: "rgba(0,0,0,0.08)",
                      ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
                      !localIsVisible
                        ? {
                            opacity: 0.7,
                            filter: "grayscale(80%)",
                          }
                        : {}),
                    }}
                  >
                    <BrokenImageIcon
                      sx={{
                        fontSize: 22,
                        color:
                          authorizedRoles.includes(Role.SALES_ADMIN) &&
                          !localIsVisible
                            ? "rgba(255,255,255,0.5)"
                            : "text.secondary",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color={
                        authorizedRoles.includes(Role.SALES_ADMIN) &&
                        !localIsVisible
                          ? "rgba(255,255,255,0.5)"
                          : "text.secondary"
                      }
                      sx={{ mt: 0.5, fontSize: 10 }}
                    >
                      Unable to load image
                    </Typography>
                  </Box>
                ) : (
                  <img
                    src={thumbnail}
                    alt="thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      position: "relative",
                      ...(authorizedRoles.includes(Role.SALES_ADMIN) &&
                      !localIsVisible
                        ? {
                            opacity: 0.6,
                            filter: "grayscale(70%)",
                          }
                        : {}),
                    }}
                    onError={() => setImageError(true)}
                  />
                )}
              </Box>
            </Box>
          )}

          <Menu
            elevation={theme.palette.mode === "light" ? 6 : 0}
            id="long-menu"
            MenuListProps={{ "aria-labelledby": "long-button" }}
            open={isMenuItemsOpen}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ ml: 3 }}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              key={"update"}
              onClick={() => setIsUpdateDialogOpen(true)}
              sx={{ minWidth: 140 }}
            >
              <UpdateIcon sx={{ mr: 1 }} />
              <Typography>Update</Typography>
            </MenuItem>
            <MenuItem
              key={"delete"}
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{ minWidth: 140 }}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              <Typography>Delete</Typography>
            </MenuItem>
          </Menu>
        </CardMedia>

        <Box
          className="card-content"
          sx={{
            mt: `${PREVIEW_H - 30}px`,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            height: `calc(${CARD_H}px - ${PREVIEW_H - 30}px)`,
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <CardHeader
            action={
              authorizedRoles.includes(Role.SALES_ADMIN) ? (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip
                    title={localIsVisible ? "Hide Content" : "Show Content"}
                    arrow
                  >
                    <IconButton
                      size="small"
                      aria-label={
                        localIsVisible ? "Hide Content" : "Show Content"
                      }
                      onClick={toggleVisibility}
                      sx={{
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(20px)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                        mr: 0.5,
                      }}
                    >
                      {localIsVisible ? (
                        <VisibilityIcon sx={{ width: 20, height: 18 }} />
                      ) : (
                        <VisibilityOffIcon sx={{ width: 18, height: 18 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLElement>) =>
                      setAnchorEl(e.currentTarget)
                    }
                    aria-label="more"
                    id="long-button"
                    aria-controls={isMenuItemsOpen ? "long-menu" : undefined}
                    aria-expanded={isMenuItemsOpen ? "true" : undefined}
                    aria-haspopup="true"
                    size="small"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": { color: "#fff" },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              ) : null
            }
            title={
              <Typography
                variant="h6"
                sx={{
                  ...customContentTheme?.title,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#fff",
                  display: "-webkit-box",
                  wordWrap: "break-word",
                  WebkitBoxOrient: "vertical",
                  whiteSpace: "normal",
                  overflow: "hidden",
                }}
              >
                {description}
              </Typography>
            }
            subheader={
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 400,
                }}
              >
                {dayjs(createdOn).format("DD MMM YYYY")}
              </Typography>
            }
            sx={{
              pt: 2.5,
              pb: 0.5,
              px: 2.5,
            }}
          />

          <CardContent
            sx={{
              pt: 1,
              px: 2.5,
              pb: 1.5,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Note + Tags */}
            <Box sx={{ mb: 1.5 }}>
              {note && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.7rem",
                    lineHeight: 1,
                    mb: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {note.length > 50 ? (
                    <>
                      {note.slice(0, 50)}…{" "}
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          color: "#667eea",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "0.8rem",
                        }}
                        onClick={toggleInfoModal}
                      >
                        Read more
                      </Typography>
                    </>
                  ) : (
                    note
                  )}
                </Typography>
              )}

              {tags?.filter((t) => t.trim()).length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {tags
                    .filter((t) => t.trim())
                    .slice(0, 5)
                    .map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag.length > 12 ? `${tag.slice(0, 12)}…` : tag}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "0.75rem",
                          height: 22,
                          borderRadius: 1.5,
                          "& .MuiChip-label": { px: 1, py: 0 },
                        }}
                      />
                    ))}
                </Box>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Custom buttons - ALL IN ONE ROW */}
            <Box sx={{ mb: 1 }}>
              {(() => {
                const base = (localCustomButtons || [])
                  .filter((b) => b.isVisible)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                const configured = base.slice(0, 4);
                const has = configured.length > 0;

                return (
                  <Box sx={{ width: "100%" }}>
                    {has && localIsVisible && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          width: "100%",
                          flexWrap: "nowrap",
                          mb: 2,
                        }}
                      >
                        {configured.map((button, i) => (
                          <Tooltip
                            key={button.id || `button-${i}`}
                            title={ button.label || ""}
                            arrow
                            placement="top"
                          >
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              startIcon={
                                button.icon && button.icon !== "none"
                                  ? getButtonIcon(button.icon)
                                  : undefined
                              }
                              onClick={() => handleCustomButtonAction(button)}
                              sx={{
                                minHeight: 31,
                                fontSize: "0.8rem",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.6,
                                flex: 1,
                                minWidth: 0,
                                borderRadius: 8,
                                borderColor: "#ff7300", 
                                color: "#ff7300", 
                                backgroundColor: "transparent",
                                "&:hover": {
                                  color: "white",
                                  borderColor: "orange", 
                                },
                                "& .MuiButton-startIcon": {
                                  marginRight: "4px",
                                  marginLeft: "-2px",
                                },
                                "& .MuiButton-startIcon > svg": {
                                  fontSize: 16,
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {button.label}
                              </Box>
                            </Button>
                          </Tooltip>
                        ))}
                      </Box>
                    )}

                    {authorizedRoles.includes(Role.SALES_ADMIN) && (
                      <Box sx={{ textAlign: "center", mt: has ? 0 : 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setIsCustomButtonDialogOpen(true)}
                          sx={{
                            minHeight: 26,
                            fontSize: "0.7rem",
                            borderStyle: "dashed",
                            color: "rgba(255,255,255,0.5)",
                            borderColor: "rgba(255,255,255,0.2)",
                            px: 1.5,
                            py: 0.25,
                            borderRadius: 1.5,
                            textTransform: "none",
                            "&:hover": {
                              borderStyle: "solid",
                              borderColor: "rgba(255,255,255,0.4)",
                              color: "rgba(255,255,255,0.7)",
                              backgroundColor: "rgba(0, 0, 0, 0.05)",
                            },
                          }}
                        >
                          + Customize Buttons
                        </Button>
                      </Box>
                    )}
                  </Box>
                );
              })()}
            </Box>
          </CardContent>
          <Modal
            open={isInfoModalOpen}
            onClose={toggleInfoModal}
            closeAfterTransition
          >
            <Fade in={isInfoModalOpen}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Additional Information
                </Typography>
                {customContentTheme?.note?.htmlContent ? (
                  <Box
                    sx={{
                      "& *": {
                        margin: 0,
                        padding: 0,
                      },
                      "& p": {
                        marginBottom: "0.5em",
                      },
                      whiteSpace: "pre-line",
                      wordWrap: "break-word",
                    }}
                  >
                    {safeParseHtml(customContentTheme.note.htmlContent)}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", ...customContentTheme?.note }}
                  >
                    {note}
                  </Typography>
                )}
              </Box>
            </Fade>
          </Modal>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          <CardActions
            disableSpacing
            sx={{
              pt: 0.75,
              pb: 1,
              px: 2.5,
              minHeight: 44,
              justifyContent: "flex-start",
              gap: 1.5,
            }}
          >
            <IconButton
              aria-label="like"
              onClick={toggleLike}
              size="small"
              sx={{
                color: like ? "#ff6b9d" : "rgba(255,255,255,0.7)",
                p: 0.5,
                "&:hover": {
                  transform: "scale(1.1)",
                  color: "#ff6b9d",
                },
              }}
            >
              {like ? (
                <FavoriteIcon sx={{ fontSize: 18 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
              )}
              <Typography sx={{ ml: 0.5, fontSize: 11, color: "inherit" }}>
                {localLikesCount}
              </Typography>
            </IconButton>

            {!isExpanded && (
              <IconButton
                aria-label="comment"
                onClick={commentDrawerHandler}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  p: 0.5,
                  "&:hover": {
                    transform: "scale(1.1)",
                    color: "#fff",
                  },
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ ml: 0.5, fontSize: 11, color: "inherit" }}>
                  {commentCount}
                </Typography>
              </IconButton>
            )}
          </CardActions>
        </Box>

        {/* Dialogs / drawers */}
        <UpdateContentDialogBox
          type="update"
          isOpen={isUpdateDialogOpen}
          handleClose={() => setIsUpdateDialogOpen(false)}
          initialValues={{
            contentId,
            sectionId,
            contentLink,
            contentType,
            contentSubtype,
            description,
            thumbnail,
            note,
            customContentTheme,
            verifyContent: false,
            tags,
            isReused,
          }}
        />

        <DeleteDialogBox
          type={"content"}
          open={isDeleteDialogOpen}
          handleClose={() => setIsDeleteDialogOpen(false)}
          contentId={contentId}
          sectionId={sectionId}
        />

        <ExpandedContentCard
          expandCard={isCommentDrawerOpen}
          expandedCardClose={closeCommentDrawer}
          contentId={contentId}
          contentLink={getEmbedUrl(contentType as FILETYPE, contentLink, contentSubtype)}
          originalContentLink={contentLink}
          contentType={contentType}
          description={description}
          likesCount={localLikesCount}
          contentOrder={contentOrder}
          sectionId={sectionId}
          status={status}
          commentCount={commentCount}
          createdOn={createdOn}
          tags={tags}
          customButtons={customButtons}
          note={note}
          customContentTheme={customContentTheme}
        />

        <IframeViewerDialogBox
          link={getEmbedUrl(contentType as FILETYPE, contentLink, contentSubtype)}
          originalUrl={contentLink}
          open={isPreviewModalOpen}
          handleClose={() => setIsPreviewModalOpen(false)}
          contentId={contentId}
          description={description}
        />

        <CustomButtonConfigDialog
          open={isCustomButtonDialogOpen}
          onClose={() => setIsCustomButtonDialogOpen(false)}
          contentId={contentId}
          sectionId={sectionId}
          initialButtons={localCustomButtons}
          onSave={handleSaveCustomButtons}
        />
      </Card>
    </Grow>
  );
};

export default ComponentCard;
