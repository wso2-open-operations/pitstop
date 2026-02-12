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

import { IframeViewerDialogBoxProps } from "../../types/types";
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  IconButton,
  Typography,
  useTheme,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAppDispatch, useAppSelector, RootState } from "@slices/store";
import { getBlockedIframeUrls } from "@slices/pageSlice/page";
import { CONTENT_STATE_IDLE, CONTENT_STATE_FAILED } from "@config/constant";
import { isGoogleDriveFolderLink } from "@utils/utils";

export declare let _paq: unknown[];
if (typeof window !== "undefined" && typeof _paq === "undefined") {
  (window as Window & { _paq?: unknown[] })._paq = [];
}

const IframeViewerDialogBox: React.FC<IframeViewerDialogBoxProps> = ({
  link,
  originalUrl,
  open,
  handleClose,
  contentId,
  description,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openedAtRef = useRef<number | null>(null);
  const loadAttemptedRef = useRef(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const blockedUrls = useAppSelector(
    (state: RootState) => state.page.blockedIframeUrls,
  );
  const blockedUrlsState = useAppSelector(
    (state: RootState) => state.page.blockedUrlsState,
  );

  const isBlockedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      return blockedUrls.some((blockedUrl: string) => {
        let blockedHostname: string;
        let blockedPath: string | null = null;
        
        try {
          const blockedUrlObj = new URL(blockedUrl);
          blockedHostname = blockedUrlObj.hostname;
          blockedPath = blockedUrlObj.pathname;
        } catch {
          const trimmed = blockedUrl.trim();
          const pathStartIndex = trimmed.indexOf('/');
          
          if (pathStartIndex > 0) {
            blockedHostname = trimmed.substring(0, pathStartIndex);
            blockedPath = trimmed.substring(pathStartIndex);
          } else {
            blockedHostname = trimmed;
          }
        }
        
        const hostnameMatches = 
          hostname === blockedHostname ||
          hostname.endsWith(`.${blockedHostname}`);
        
        if (!hostnameMatches) {
          return false;
        }
        
        if (blockedPath && blockedPath !== "/") {
          const normalizedBlockedPath =
            blockedPath.endsWith("/") && blockedPath.length > 1
              ? blockedPath.slice(0, -1)
              : blockedPath;
          const normalizedPathname =
            pathname.endsWith("/") && pathname.length > 1
              ? pathname.slice(0, -1)
              : pathname;
          return (
            normalizedPathname === normalizedBlockedPath ||
            normalizedPathname.startsWith(`${normalizedBlockedPath}/`)
          );
        }
        
        return true;
      });
    } catch {
      return blockedUrls.some((blockedUrl: string) => url.includes(blockedUrl));
    }
  };

  const isGoogleDriveFolder = isGoogleDriveFolderLink(link);
  const isBlocked = isBlockedUrl(link);

  const formatsTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h`;
    }
    return `${minutes}min`;
  };

  useEffect(() => {
    if (
      blockedUrlsState === CONTENT_STATE_IDLE ||
      blockedUrlsState === CONTENT_STATE_FAILED
    ) {
      dispatch(getBlockedIframeUrls());
    }
  }, [dispatch, blockedUrlsState]);

  useEffect(() => {
    if (!window.config?.IS_MATOMO_ENABLED) return;

    if (open) {
      openedAtRef.current = Date.now();
      return;
    }

    if (!open && openedAtRef.current) {
      const minutes = Math.round((Date.now() - openedAtRef.current) / 60000);
      const formattedTime = formatsTime(minutes);

      _paq.push([
        "trackEvent",
        "User Interaction",
        "Preview Modal",
        `Content : ${description} - ${formattedTime}`,
      ]);

      openedAtRef.current = null;
    }
  }, [open, description, contentId]);

  useEffect(() => {
    if (open) {
      if (isGoogleDriveFolder || isBlocked) {
        setIframeError(true);
        setIsLoading(false);
        return;
      }

      setIframeError(false);
      setIsLoading(true);
      loadAttemptedRef.current = false;
      errorTimeoutRef.current = setTimeout(() => {
        if (!loadAttemptedRef.current) {
          // Timeout for load attempt check
        }
      }, 5000);

      return () => {
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      };
    } else {
      setIframeError(false);
      setIsLoading(true);
      loadAttemptedRef.current = false;
    }
  }, [open, link, isGoogleDriveFolder, isBlocked, blockedUrls]);

  const handleOpenInNewTab = () => {
    window.open(originalUrl, "_blank", "noopener, noreferrer");
  };

  const handleIframeLoad = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    loadAttemptedRef.current = true;

    loadTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);

      try {
        const iframeDoc = iframeRef.current?.contentDocument;
        const bodyText = iframeDoc?.body?.innerText || "";

        if (
          bodyText.toLowerCase().includes("refused to connect") ||
          bodyText.toLowerCase().includes("cannot be displayed") ||
          bodyText.toLowerCase().includes("this page can't be displayed")
        ) {
          setIframeError(true);
        } else {
          setIframeError(false);
        }
      } catch {
        setIframeError(false);
      }
    }, 300);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);

    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "12px",
          width: "90vw",
          maxWidth: "1200px",
          height: "80vh",
          maxHeight: "800px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.grey[900],
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.grey[100],
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              mr: 2,
            }}
          >
            {description || "Content Preview"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={handleOpenInNewTab}
              sx={{ color: theme.palette.grey[100] }}
              aria-label="open in new tab"
              title="Open in new tab"
            >
              <OpenInNewIcon />
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{ color: theme.palette.grey[100] }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isLoading && !iframeError && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.background.default,
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {iframeError ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 3,
                padding: 4,
                textAlign: "center",
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.warning.main,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                }}
              >
                Can't open in preview
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: "400px",
                }}
              >
                {isGoogleDriveFolder
                  ? "Google Drive folder links cannot be previewed. Click the button below to open it in a new window."
                  : isBlocked
                    ? "This content cannot be embedded due to security restrictions. Click the button below to open it in a new window."
                    : "This content cannot be displayed in an embedded preview. Click the button below to open it in a new window."}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenInNewTab}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  color: theme.palette.common.white,
                }}
              >
                Open in New Window
              </Button>
            </Box>
          ) : !isGoogleDriveFolder && !isBlocked ? (
            <iframe
              ref={iframeRef}
              title="Content Preview"
              src={link}
              width="100%"
              height="100%"
              sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-forms"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                border: "none",
                display: "block",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
            />
          ) : null}
        </Box>
      </Box>
    </Dialog>
  );
};

export default IframeViewerDialogBox;
