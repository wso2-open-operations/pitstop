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


import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import { Box, CardContent, CardHeader, Divider, Skeleton, CardMedia } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { useTheme } from "@mui/material/styles";

const PREVIEW_W = 323;
const PREVIEW_H = 161;
const CARD_W = 399;
const CARD_H = 424;

export const SkeletonCard = () => {
  const theme = useTheme();
  return (
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
        backgroundColor: theme.palette.grey[500],
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        border: `1px solid ${theme.palette.grey[500]}`,
        '@keyframes pulse': {
          '0%': { 
            opacity: 1,
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: 0.6,
            transform: 'scale(0.98)',
          },
          '100%': { 
            opacity: 1,
            transform: 'scale(1)',
          },
        },
      }}
    >
      {/* Pin Button */}
      <IconButton
        disabled
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 10,
          color: "rgba(0,0,0,0.4)",
          backgroundColor: "rgba(240,240,240,0.9)",
          backdropFilter: "blur(10px)",
        }}
        size="small"
      >
        <PushPinOutlinedIcon />
      </IconButton>

      {/* Card Media Preview */}
      <CardMedia
        sx={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${PREVIEW_W}px`,
          height: `${PREVIEW_H}px`,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
          zIndex: 3,
          background: theme.palette.grey[400],
        }}
      >
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          animation="wave"
          sx={{ bgcolor: theme.palette.grey[700] }}
        />
      </CardMedia>

      <Box
        sx={{
          mt: `${PREVIEW_H - 30}px`,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          height: `calc(${CARD_H}px - ${PREVIEW_H - 30}px)`,
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <CardHeader
          action={
            <IconButton disabled size="small" sx={{ color: "rgba(0,0,0,0.3)" }}>
              <Skeleton variant="circular" width={20} height={20} animation="wave" />
            </IconButton>
          }
          title={
            <Skeleton 
              animation="wave" 
              height={24} 
              width="85%" 
              sx={{ bgcolor: theme.palette.grey[300] }}
            />
          }
          subheader={
            <Skeleton 
              animation="wave" 
              height={14} 
              width="40%" 
              sx={{ mt: 0.5, bgcolor: theme.palette.grey[700] }}
            />
          }
          sx={{
            pt: 2.5,
            pb: 0.5,
            px: 2.5,
          }}
        />

        {/* Content */}
        <CardContent
          sx={{
            pt: 1,
            px: 2.5,
            pb: 1.5,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          {/* Note skeleton */}
          <Box sx={{ mb: 1.5 }}>
            <Skeleton 
              animation="wave" 
              height={14} 
              width="90%" 
              sx={{ mb: 0.5, bgcolor: theme.palette.grey[300] }}
            />
            <Skeleton 
              animation="wave" 
              height={14} 
              width="75%" 
              sx={{ bgcolor: theme.palette.grey[300] }}
            />
          </Box>

          {/* Tags skeleton */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
            <Skeleton 
              variant="rounded" 
              width={70} 
              height={22} 
              animation="wave"
              sx={{ borderRadius: 1.5, bgcolor: theme.palette.grey[300] }}
            />
            <Skeleton 
              variant="rounded" 
              width={60} 
              height={22} 
              animation="wave"
              sx={{ borderRadius: 1.5, bgcolor: theme.palette.grey[300] }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Custom buttons skeleton */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: "flex", gap: 0.75, width: "100%", mb: 2 }}>
              <Skeleton 
                variant="rounded" 
                height={31} 
                animation="wave"
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.grey[300]
                }}
              />
              <Skeleton 
                variant="rounded" 
                height={31} 
                animation="wave"
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.grey[300]
                }}
              />
            </Box>
          </Box>
        </CardContent>

        <Divider sx={{ borderColor: "rgba(0,0,0,0.1)" }} />

        {/* Actions */}
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
            disabled
            size="small"
            sx={{
              color: "rgba(0,0,0,0.3)",
              p: 0.5,
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            <Skeleton 
              animation="wave"
              width={20} 
              height={11} 
              sx={{ ml: 0.5, bgcolor: theme.palette.grey[300] }}
            />
          </IconButton>

          <IconButton
            disabled
            size="small"
            sx={{
              color: "rgba(0,0,0,0.3)",
              p: 0.5,
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            <Skeleton 
              animation="wave"
              width={20} 
              height={11} 
              sx={{ ml: 0.5, bgcolor: theme.palette.grey[300] }}
            />
          </IconButton>
        </CardActions>
      </Box>
    </Card>
  );
};
