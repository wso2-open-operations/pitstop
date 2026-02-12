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

import IframeViewerDialogBox from "@component/dialogs/IframeViewerDialogBox";
import UpdateContentDialogBox from "@component/dialogs/ContentDialogBox";
import DeleteContentDialogBox from "@component/dialogs/DeleteDialogBox";
import ComponentCard from "./Card";
import CommentCard from "../CommentCard";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Stack,
  Divider,
  Typography,
  alpha,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { CustomButton, CustomTheme, CommentsResponse } from "../../../types/types";
import { RootState, useAppSelector, useAppDispatch } from "@slices/store";
import { addComment } from "@slices/pageSlice/page";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

// For matomo integration
declare let _paq: unknown[];

interface ComponentCardProps {
  expandCard: boolean;
  expandedCardClose: () => void;
  contentId: number;
  contentLink: string;
  originalContentLink: string;
  contentType: string;
  description: string;
  likesCount: number;
  sectionId: number;
  thumbnail?: string;
  note?: string;
  status?: boolean;
  contentOrder: number;
  commentCount: number;
  createdOn: string;
  tags: string[];
  customButtons?: CustomButton[];
  customContentTheme?: CustomTheme;
}

const ExpandedContentCard: React.FC<ComponentCardProps> = ({
  expandCard,
  expandedCardClose,
  contentId,
  contentLink,
  originalContentLink,
  contentType,
  description,
  likesCount,
  sectionId,
  thumbnail,
  note,
  contentOrder,
  status,
  commentCount,
  createdOn,
  tags,
  customButtons,
  customContentTheme,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isFullScreenDrawerOpen, setIsFullScreenDrawerOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const comments = useAppSelector((s: RootState) => s.page.comments as CommentsResponse[]) ?? [];
  const userThumbnail = useAppSelector(
    (state: RootState) => state.employee.employeeInfo?.employeeThumbnail,
  );

  const dispatch = useAppDispatch();

  const sendCommentHandler = async () => {
    const commentText = comment.trim();
    if (!commentText || isPosting) return;

    setIsPosting(true);

    try {
      await dispatch(addComment({ contentId, comment: commentText })).unwrap();

      setComment("");

      if (window.config?.IS_MATOMO_ENABLED) {
        //------------------------------Matomo Add Comment event tracker---------------------------------//
        _paq.push([
          "trackEvent",
          "User Interaction",
          "Add Comment",
          `Content: ${description}`,
        ]);
        //----------------------------------------------------------------------------------------//
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setComment(commentText);
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to add comment. Please try again.",
          type: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        }),
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCommentHandler();
    }
  };

  return (
    <Dialog
      open={expandCard}
      onClose={expandedCardClose}
      fullWidth
      maxWidth="md"
      disableScrollLock
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        },
      }}
      PaperProps={{
        sx: (t) => ({
          borderRadius: 4,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${alpha(
            t.palette.background.paper,
            0.85,
          )} 0%, ${alpha(t.palette.background.default, 0.9)} 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(t.palette.common.white, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(t.palette.common.black, 0.4)}`,
        }),
      }}
    >
      <DialogContent sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={10}
          alignItems="flex-start"
          sx={{ mt: 4 }}
        >
          {/* Left: Content Card */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ComponentCard
              contentId={contentId}
              contentLink={contentLink}
              contentType={contentType}
              description={description}
              likesCount={likesCount}
              sectionId={sectionId}
              isExpanded
              status={status}
              contentOrder={contentOrder}
              thumbnail={thumbnail}
              note={note}
              commentCount={commentCount}
              createdOn={createdOn}
              tags={tags}
              customButtons={customButtons}
              customContentTheme={customContentTheme}
              isInPinnedSection={sectionId === -2}
            />
          </Box>

          {/* Right: Comments Panel without Box */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              height: 450,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              fontWeight={600}
              sx={{ mb: 2, fontSize: "1.1rem", flexShrink: 0 }}
            >
              Comments ({comments.length})
            </Typography>

            <Divider
              sx={{
                mb: 2,
                opacity: 0.2,
                background: (t) => alpha(t.palette.common.white, 0.1),
                flexShrink: 0,
              }}
            />

            {/* Comments List - Scrollable */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 2,
                pr: 1,
                minHeight: 0,
                scrollbarWidth: "thin",
                scrollbarColor: (t) =>
                  `${alpha(t.palette.primary.main, 0.3)} transparent`,
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                  borderRadius: 10,
                },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 10,
                  background: (t) => alpha(t.palette.primary.main, 0.3),
                  "&:hover": {
                    background: (t) => alpha(t.palette.primary.main, 0.5),
                  },
                },
              }}
            >
              {comments.length === 0 && !isPosting ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    opacity: 0.6,
                  }}
                >
                  <Typography variant="body2">
                    No comments yet. Be the first to share feedback.
                  </Typography>
                </Box>
              ) : (
                <>
                  {comments.map((c: CommentsResponse) => (
                    <Box key={c.commentId} sx={{ mb: 1.5 }}>
                      <CommentCard
                        commentResponse={c}
                        contentId={contentId}
                        description={description}
                      />
                    </Box>
                  ))}
                  {isPosting && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        background: (t) =>
                          alpha(t.palette.background.paper, 0.3),
                        border: (t) =>
                          `1px solid ${alpha(t.palette.common.white, 0.05)}`,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          border: (t) =>
                            `2px solid ${alpha(t.palette.primary.main, 0.2)}`,
                        }}
                        src={userThumbnail}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={16} thickness={4} />
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            Posting your comment...
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Add Comment Section - Fixed at Bottom */}
            <Box
              sx={(t) => ({
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderRadius: 3,
                background: alpha(t.palette.background.paper, 0.5),
                border: `1px solid ${alpha(t.palette.common.white, 0.05)}`,
                flexShrink: 0,
              })}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  border: (t) =>
                    `2px solid ${alpha(t.palette.primary.main, 0.2)}`,
                  flexShrink: 0,
                }}
                src={userThumbnail}
              />
              <TextField
                fullWidth
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="outlined"
                size="small"
                disabled={isPosting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={sendCommentHandler}
                        disabled={!comment.trim() || isPosting}
                        sx={{
                          color: (t) => t.palette.primary.main,
                          "&:hover": {
                            background: (t) =>
                              alpha(t.palette.primary.main, 0.1),
                          },
                          "&.Mui-disabled": {
                            opacity: 0.3,
                          },
                        }}
                      >
                        {isPosting ? (
                          <CircularProgress size={20} thickness={4} />
                        ) : (
                          <SendIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: (t) => ({
                    borderRadius: 3,
                    background: alpha(t.palette.background.default, 0.4),
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      background: alpha(t.palette.background.default, 0.6),
                    },
                    "&.Mui-focused": {
                      background: alpha(t.palette.background.default, 0.7),
                    },
                  }),
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <UpdateContentDialogBox
        type="update"
        isOpen={isUpdateDialogOpen}
        handleClose={() => setIsUpdateDialogOpen(false)}
        initialValues={{
          contentId,
          sectionId,
          contentLink,
          contentType,
          description,
          verifyContent: false,
          tags,
        }}
      />

      <DeleteContentDialogBox
        type="content"
        open={isDeleteDialogOpen}
        handleClose={() => setIsDeleteDialogOpen(false)}
        contentId={contentId}
        sectionId={sectionId}
      />

      <IframeViewerDialogBox
        link={contentLink}
        originalUrl={originalContentLink}
        open={isFullScreenDrawerOpen}
        handleClose={() => setIsFullScreenDrawerOpen(false)}
        contentId={contentId}
        description={description}
      />
    </Dialog>
  );
};

export default ExpandedContentCard;
