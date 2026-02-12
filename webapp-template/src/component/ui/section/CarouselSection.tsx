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

import React, { useEffect } from "react";
import { Box, Stack, CircularProgress, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "../content/Carousel";
import { ContentResponse, CustomTheme } from "../../../types/types";
import { getTrendingContents } from "@slices/pageSlice/page";
import { AppDispatch, RootState } from "@slices/store";
import {
  CONTENT_STATE_FAILED,
  CONTENT_STATE_LOADING,
  CONTENT_STATE_IDLE,
} from "@config/constant";
import { useInViewport } from "@utils/utils";

interface CarouselSectionProps {
  description?: string;
  contentData: ContentResponse[];
  customSectionTheme?: CustomTheme;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ contentData }) => {
  const { ref, isInViewport } = useInViewport<HTMLDivElement>();
  const dispatch = useDispatch<AppDispatch>();
  const { trendingContents, trendingState } = useSelector(
    (state: RootState) => state.page
  );

  useEffect(() => {
    if (trendingState === CONTENT_STATE_IDLE) {
      dispatch(getTrendingContents());
    }
  }, [dispatch, trendingState]);

  const renderTrendingCarousel = () => {
    if (trendingState === CONTENT_STATE_LOADING) {
      return <CircularProgress />;
    }
    if (
      trendingState === CONTENT_STATE_FAILED ||
      trendingContents.length === 0
    ) {
      return <Typography>No trending contents available</Typography>;
    }
    return (
      <Carousel
        contentData={trendingContents}
        isInPinnedSection={false}
        autoScroll={isInViewport}
        autoScrollInterval={5000}
      />
    );
  };

  return (
    <Box ref={ref} sx={{ pt: 2 }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 4, lg: 2 }}
        alignItems="center"
        justifyContent="center"
      >
        <Box sx={{ flex: 1, display: "grid", placeItems: "center", width: "100%" }}>
          <Typography
            component="h3"
            sx={{
              mb: 8,
              textAlign: "center",
              fontSize: { xs: 24, sm: 28, md: 32 },
              lineHeight: 1.1,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #ff9944 0%, #ffbb77 100%)"
                  : "linear-gradient(135deg, #ff7300 0%, #ff9944 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            What's New
          </Typography>
          <Carousel
            contentData={contentData}
            isInPinnedSection={false}
            autoScroll={isInViewport}
            autoScrollInterval={5000}
          />
        </Box>

        <Box sx={{ flex: 1, display: "grid", placeItems: "center", width: "100%" }}>
          <Typography
            component="h3"
            sx={{
              mb: 8,
              textAlign: "center",
              fontSize: { xs: 24, sm: 28, md: 32 },
              lineHeight: 1.1,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #ff9944 0%, #ffbb77 100%)"
                  : "linear-gradient(135deg, #ff7300 0%, #ff9944 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            What's Trending
          </Typography>
          {renderTrendingCarousel()}
        </Box>
      </Stack>
    </Box>
  );
};

export default CarouselSection;
