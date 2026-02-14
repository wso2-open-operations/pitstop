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

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  Stack,
} from "@mui/material";
import { useState } from "react";
import {
  RouteContentPayload,
  UpdateRouteContentPayload,
} from "../../types/types";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";

interface RouteContentDialogBoxProps {
  isOpen: boolean;
  handleClose: () => void;
  mode: "create" | "update";
  routeId?: number;
  contentId?: number;
  description?: string;
  contentLink?: string;
  onCreate?: (payload: RouteContentPayload) => void;
  onUpdate?: (payload: UpdateRouteContentPayload) => void;
}

const RouteContentDialogBox = ({
  isOpen,
  handleClose,
  mode,
  routeId,
  contentId,
  description = "",
  contentLink = "",
  onCreate,
  onUpdate,
}: RouteContentDialogBoxProps) => {
  const theme = useTheme();
  const [desc, setDesc] = useState(description);
  const [link, setLink] = useState(contentLink);
  const [errors, setErrors] = useState({ desc: false, link: false });

  const dialogBoxTitle = () => {
    return mode === "create" ? "Add New Content" : "Update Content";
  };

  const dialogSubtitle = () => {
    return mode === "create" 
      ? "Create new content for this route" 
      : "Update content details";
  };

  const handleSubmit = () => {
    // Validate required fields in "create" mode
    if (mode === "create") {
      const hasDesc = desc.trim() !== "";
      const hasLink = link.trim() !== "";

      setErrors({
        desc: !hasDesc,
        link: !hasLink,
      });

      if (!hasDesc || !hasLink) return;

      if (routeId && onCreate) {
        onCreate({ routeId, description: desc, contentLink: link });
        handleClose();
      }
    } else if (mode === "update" && contentId !== undefined && onUpdate) {
      onUpdate({ contentId, description: desc, contentLink: link });
      handleClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
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
          {/* Description */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <DescriptionIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22, mt: 2 }} />
              <Typography variant="h6" fontWeight="700" mt={2}>
                Description
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Enter content description"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                if (errors.desc) setErrors({ ...errors, desc: false });
              }}
              error={errors.desc}
              helperText={errors.desc ? "Description is required." : ""}
            />
          </Box>

          {/* Content Link */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <LinkIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 22 }} />
              <Typography variant="h6" fontWeight="700" >
                Content Link
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="https://example.com/content"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (errors.link) setErrors({ ...errors, link: false });
              }}
              error={errors.link}
              helperText={errors.link ? "Content link is required." : ""}
            />
          </Box>
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
          onClick={handleSubmit}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
          }}
        >
          {mode === "create" ? "Add Content" : "Update Content"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteContentDialogBox;
