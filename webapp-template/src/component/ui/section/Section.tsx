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

import { useCallback, useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import SectionDialogBox from "@component/dialogs/SectionDialogBox";
import ComponentCard from "@component/ui/content/Card";
import { Role } from "@utils/types";
import { Action, ContentResponse, CustomTheme } from "../../../types/types";
import { IconButton } from "@component/common/Common";
import ImageSection from "./ImageSection";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  Typography,
  Box,
  Tooltip,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LinkIcon from "@mui/icons-material/Link";
import AddContentDialogBox from "../../dialogs/ContentDialogBox";
import DeleteDialogBox from "../../dialogs/DeleteDialogBox";
import { getContentsInfo, reorderContents } from "@slices/pageSlice/page";
import GridSortableItem from "../../common/GridSortableItem";
import { useLocation } from "react-router-dom";
import CarouselSection from "./CarouselSection";
import SuggestedCarousel from "./SuggestedCarousel";
import { SkeletonCard } from "@component/ui/content/SkeletonCard";
import { safeParseHtml } from "@utils/safeHtml";
import { CONTENTS_PER_SECTION } from "@config/constant";

interface SectionProps {
  sectionId: number;
  title: string;
  description?: string;
  sectionType: string;
  imageUrl?: string;
  redirectUrl?: string;
  contentData: ContentResponse[];
  contentState: "failed" | "loading" | "idle" | "success";
  contentOffset: number;
  customSectionTheme?: CustomTheme;
  sectionOrder: number;
}

const Section = ({
  sectionId,
  title,
  description,
  imageUrl,
  redirectUrl,
  sectionType,
  contentData,
  contentState,
  contentOffset,
  customSectionTheme,
  sectionOrder,
}: SectionProps) => {
  const [openAddContentDialogBox, setOpenAddContentDialogBox] = useState(false);
  const [openDeleteSectionDialogBox, setOpenDeleteSectionDialogBox] =
    useState(false);
  const [openUpdateSectionDialogBox, setOpenUpdateSectionDialogBox] =
    useState(false);
  const [isCarouselReady, setIsCarouselReady] = useState(false);

  const authorizedRoles: Role[] = useAppSelector(
    (state: RootState) => state.auth.roles
  );
  const [orderContents, setOrderContents] =
    useState<ContentResponse[]>(contentData);
  const [tempOrderContents, setTempOrderContents] = useState<
    { contentId: number; contentOrder: number }[]
  >([]);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = orderContents.findIndex(
        (item) => item.contentId.toString() === active.id
      );
      const newIndex = orderContents.findIndex(
        (item) => item.contentId.toString() === over.id
      );
      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(orderContents, oldIndex, newIndex);
      setOrderContents(newItems);

      const reorderData = tempOrderContents.map((original, index) => ({
        contentId: newItems[index].contentId,
        contentOrder: original.contentOrder,
      }));

      dispatch(reorderContents({ sectionId, reorderContents: reorderData }))
        .unwrap()
        .catch((error: unknown) => {
          console.error("Reorder failed:", error);
          setOrderContents(orderContents);
        });
    },
    [orderContents, dispatch, sectionId, tempOrderContents]
  );

  useEffect(() => {
    if (contentData.length === 0) return;

    setOrderContents(contentData);

    setTempOrderContents((prevTemp) => {
      const existingContentIds = new Set(
        prevTemp.map((item) => item.contentId)
      );
      const newContents = contentData
        .filter((item) => !existingContentIds.has(item.contentId))
        .map((item) => ({
          contentId: item.contentId,
          contentOrder: item.contentOrder,
        }));
      return [...prevTemp, ...newContents];
    });
  }, [contentData]);

  const theme = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contentIdParam = params.get("contentId");
    const sectionIdParam = params.get("sectionId");

    if (
      !contentIdParam ||
      !sectionIdParam ||
      sectionId !== parseInt(sectionIdParam, 10)
    ) {
      return;
    }
    const contentId = parseInt(contentIdParam, 10);

    const isContentLoaded = () =>
      orderContents.some((c) => c.contentId === contentId);

    if (!isContentLoaded()) {
      if (contentState === "success") {
        seeMoreHandler();
      }
    } else {
      setTimeout(() => {}, 100);
    }
  }, [orderContents, location.search, contentState, sectionId]);

  const shouldShowActions =
    sectionId !== -2 && sectionId !== -1 && sectionId !== -3;
  const isSuggestedSection = sectionId === -3;

  const addNewContentHandler = () => setOpenAddContentDialogBox(true);
  const updateSectionHandler = () => setOpenUpdateSectionDialogBox(true);
  const deleteSectionHandler = () => setOpenDeleteSectionDialogBox(true);

  const seeMoreHandler = () => {
    dispatch(
      getContentsInfo({
        sectionId,
        offset: contentOffset + CONTENTS_PER_SECTION,
        isInitial: false,
      })
    );
  };

  useEffect(() => {
    if (isSuggestedSection && contentData.length === 0) {
      dispatch(
        getContentsInfo({
          sectionId,
          offset: 0,
          isInitial: true,
          loadAll: true,
        })
      );
    }
  }, [isSuggestedSection, contentData.length, dispatch, sectionId]);

  const actions: Action[] = shouldShowActions
    ? [
        {
          icon: <AddIcon color="success" fontSize="small" />,
          name: "Add new content",
          action: addNewContentHandler,
        },
        {
          icon: <EditIcon color="info" fontSize="small" />,
          name: "Edit section",
          action: updateSectionHandler,
        },
        {
          icon: <DeleteIcon color="error" fontSize="small" />,
          name: "Delete section",
          action: deleteSectionHandler,
        },
      ]
    : [];

  useEffect(() => {
    if (
      sectionId === -1 &&
      orderContents.length > 0 &&
      contentState === "success"
    ) {
      const timer = setTimeout(() => {
        setIsCarouselReady(true);
      }, 20);
      return () => clearTimeout(timer);
    } else if (sectionId === -1) {
      setIsCarouselReady(false);
    }
  }, [sectionId, orderContents.length, contentState]);

  // ————— Section -1: Twin stacked carousels —————
  if (sectionId === -1 && sectionType !== "image") {
    if (
      (contentState === "loading" && orderContents.length === 0) ||
      (contentState === "success" && !isCarouselReady)
    ) {
      return (
        <Box
          sx={{
            py: 10,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? " #000000 0%"
                : "linear-gradient(135deg, #FFE4CC 0%, #FFEEDD 30%, #FFF5E8 60%, #FFFAF2 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "500px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              justifyContent: "center",
            }}
          >
            <SkeletonCard />
            <SkeletonCard />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          py: 4,
          px: { xs: 2, md: 3 },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? " #000000 0%"
              : "linear-gradient(135deg, #FFE4CC 0%, #FFEEDD 30%, #FFF5E8 60%, #FFFAF2 100%)",
        }}
      >
        <CarouselSection
          description={description}
          contentData={orderContents}
          customSectionTheme={customSectionTheme}
        />
      </Box>
    );
  }
  if (isSuggestedSection && orderContents.length > 0) {
    return <SuggestedCarousel items={orderContents} />;
  }
  if (isSuggestedSection && orderContents.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
        py: 2,
        ...(sectionId === -2 && {
          backgroundImage: `url(${theme.palette.mode === "dark" ? "/Myboard_dark.jpg" : "/Myboard.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }),
      }}
    >
      {sectionType === "image" ? (
        <>
          <ImageSection
            sectionOrder={sectionOrder}
            imageUrl={imageUrl!}
            title={title}
            customSectionTheme={customSectionTheme}
            redirectUrl={redirectUrl}
            actions={actions}
            authorizedRoles={authorizedRoles}
          />
        </>
      ) : (
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              pb: 2,
              borderBottom: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", pl: 15 }}>
              {customSectionTheme?.title?.richText && customSectionTheme?.title?.htmlContent ? (
                <Typography
                  variant="h3"
                  color={theme.palette.primary.main}
                  sx={{
                    ...(() => {
                      const { ...styles } = customSectionTheme.title || {};
                      return styles;
                    })(),
                    ...(sectionId === -2 && {
                      fontWeight: 400,
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #ff9944 0%, #ffbb77 100%)"
                          : "linear-gradient(135deg, #ff7300 0%, #ff9944 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }),
                    '& p': { margin: 0 },
                  }}
                >
                  {safeParseHtml(customSectionTheme.title.htmlContent)}
                </Typography>
              ) : (
                <Typography
                  variant="h3"
                  color={theme.palette.primary.main}
                  sx={{
                    ...customSectionTheme?.title,
                    ...(sectionId === -2 && {
                      fontWeight: 400,
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #ff9944 0%, #ffbb77 100%)"
                          : "linear-gradient(135deg, #ff7300 0%, #ff9944 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }),
                  }}
                >
                  {title}
                </Typography>
              )}
              {description && (
                <>
                  {customSectionTheme?.description?.richText && customSectionTheme?.description?.htmlContent ? (
                    <Typography
                      variant="body1"
                      sx={{
                        ...(() => {
                          const { ...styles } = customSectionTheme.description || {};
                          return styles;
                        })(),
                        whiteSpace: "pre-line",
                        '& p': { margin: 0 },
                      }}
                    >
                      {safeParseHtml(customSectionTheme.description.htmlContent)}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        ...customSectionTheme?.description,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {description}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {redirectUrl && (
                <Tooltip title="View related contents" arrow>
                  <LinkIcon
                    sx={{
                      rotate: "-45deg",
                      cursor: "pointer",
                      color: theme.palette.primary.main,
                    }}
                    onClick={() => window.open(redirectUrl)}
                  />
                </Tooltip>
              )}

              {authorizedRoles.includes(Role.SALES_ADMIN) &&
                shouldShowActions && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      borderRadius: 7,
                      bgcolor: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.55)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    {actions.map((action) => (
                      <Tooltip title={action.name} key={action.name} arrow>
                        <IconButton
                          aria-label={action.name}
                          onClick={action.action}
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 6,
                            bgcolor: "transparent",
                            color: theme.palette.primary.main,
                            "& svg": {
                              fontSize: 20,
                              color: theme.palette.primary.main,
                            },
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.14)",
                            },
                          }}
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                )}
            </Box>
          </Box>
        </Box>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={orderContents.map((item) => item.contentId.toString())}
          strategy={horizontalListSortingStrategy}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fit, minmax(399px, 1fr))",
                md: "repeat(auto-fit, minmax(399px, 1fr))",
                lg: "repeat(3, 399px)",
              },
              gap: 5,
              width: "100%",
              justifyContent: "center",
              alignItems: "start",
              pt: 6,
              pb: 6,
              px: 3,
              rowGap: 8,
              "& > *": { position: "relative", zIndex: 1 },
            }}
          >
            {orderContents.map((contentLink) => (
              <GridSortableItem
                key={contentLink.contentId}
                id={contentLink.contentId.toString()}
                disabled={
                  !authorizedRoles.includes(Role.SALES_ADMIN) ||
                  sectionId === -1
                }
              >
                <Box
                  id={`content-card-${contentLink.contentId}`}
                  sx={{
                    width: "399px",
                    height: "424px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <ComponentCard
                    {...contentLink}
                    isInPinnedSection={sectionId === -2}
                  />
                </Box>
              </GridSortableItem>
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {sectionId !== -1 &&
        orderContents.length > 0 &&
        contentState === "success" && (
          <Divider textAlign="center" sx={{ height: 1, mt: 4, mb: 4 }}>
            <Button
              endIcon={<KeyboardArrowDownIcon sx={{ color: "#ffffff" }} />}
              sx={{
                borderRadius: 8,
                backgroundColor: theme.palette.primary.main,
                px: 4,
                py: 0.5,
                fontWeight: 400,
                letterSpacing: 0.2,
                color: theme.palette.common.white,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              onClick={seeMoreHandler}
              aria-label="See more"
            >
              <Typography variant="body1" color={theme.palette.common.white}>
                SEE MORE
              </Typography>
            </Button>
          </Divider>
        )}

      <AddContentDialogBox
        type="add"
        isOpen={openAddContentDialogBox}
        sectionId={sectionId}
        handleClose={() => setOpenAddContentDialogBox(false)}
      />
      <DeleteDialogBox
        type="section"
        open={openDeleteSectionDialogBox}
        sectionId={sectionId}
        handleClose={() => setOpenDeleteSectionDialogBox(false)}
      />
      <SectionDialogBox
        type="update"
        open={openUpdateSectionDialogBox}
        handleClose={() => setOpenUpdateSectionDialogBox(false)}
        initialValues={{
          title,
          description,
          sectionType,
          imageUrl,
          redirectUrl,
          customSectionTheme,
        }}
        sectionId={sectionId}
      />
    </Box>
  );
};

export default Section;
