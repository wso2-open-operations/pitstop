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

import React, {
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import SectionCard from "@component/ui/section/Section";
import {
  getContentsInfo,
  reorderSections,
} from "@slices/pageSlice/page";
import { Box } from "@mui/material";
import { Section } from "../../../types/types";
import { Role } from "@utils/types";
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
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import VerticalSortableItem from "@component/common/VerticalSortableItem";

interface ContentsProps {
  afterSectionId?: number;
  AfterSectionComponent?: ReactNode;
}

const ViewContent: React.FC<ContentsProps> = ({
  afterSectionId,
  AfterSectionComponent,
}) => {
  const sections = useAppSelector((state: RootState) => state.page);
  const authorizedRoles = useAppSelector(
    (state: RootState) => state.auth.roles
  );
  const [orderSections, setOrderSections] = useState<Section[]>(
    sections.sectionData
  );
  const [tempOrderSections, setTempOrderSections] = useState<
    {
      sectionId: number;
      sectionOrder: number;
      isVisible: number;
      isRouteVisible: number;
    }[]
  >([]);
  const dispatch = useAppDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  //-----------------------------------------------------------------------//
  //-------------------- Drag and Drop--------------------------------------//
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = orderSections.findIndex(
        (item) => `section-${item.sectionId}` === active.id
      );
      const newIndex = orderSections.findIndex(
        (item) => `section-${item.sectionId}` === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find section indices for drag operation");
        return;
      }

      const newItems = arrayMove(orderSections, oldIndex, newIndex);
      setOrderSections(newItems);

      const reorderData = tempOrderSections.map((original, index) => ({
        sectionId: newItems[index].sectionId,
        sectionOrder: original.sectionOrder,
      }));

      dispatch(reorderSections({ reorderSections: reorderData }))
        .unwrap()
        .catch((error: unknown) => {
          console.error("Reorder failed:", error);
          setOrderSections(orderSections);
        });
    },
    [orderSections, dispatch, tempOrderSections]
  );

  useEffect(() => {
    if (sections.sectionData.length === 0) return;

    const filteredSections = sections.sectionData.filter(section => section.sectionId !== -2);
    setOrderSections(filteredSections);

    setTempOrderSections((prevTemp) => {
      const existingSectionIds = new Set(
        prevTemp.map((item) => item.sectionId)
      );
      const newSections = filteredSections
        .filter((item) => !existingSectionIds.has(item.sectionId))
        .map((item) => ({
          sectionId: item.sectionId,
          sectionOrder: item.sectionOrder,
          isVisible: item.isVisible,
          isRouteVisible: item.isRouteVisible ?? 1,
        }));

      return [...prevTemp, ...newSections];
    });
  }, [sections.sectionData]);
  //-----------------------------------------------------------------------//

  useEffect(() => {
    if (sections.sectionState === "success") {
      // Filter out section with ID -2 before fetching content
      sections.sectionData
        .filter(section => section.sectionId !== -2)
        .slice(sections.sectionOffset)
        .forEach((section) => {
          dispatch(
            getContentsInfo({
              sectionId: section.sectionId,
              offset: 0,
              isInitial: true,
            })
          );
        });
    }
  }, [sections.sectionState, sections.sectionOffset, dispatch]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderSections.map((section) => `section-${section.sectionId}`)}
        strategy={verticalListSortingStrategy}
      >
        <Box sx={{ mb: 0 }}>
          {orderSections.map((section) => (
            <React.Fragment key={`section-${section.sectionId}`}>
              <VerticalSortableItem
                id={`section-${section.sectionId}`}
                disabled={!authorizedRoles.includes(Role.SALES_ADMIN)}
              >
                <Box
                  sx={{ width: "100%", position: "relative" }}
                  data-section-id={section.sectionId}
                >
                  <SectionCard
                    sectionId={section.sectionId}
                    title={section.title}
                    description={section.description}
                    contentState={section.contentState}
                    contentData={section.contentData}
                    contentOffset={section.contentOffset}
                    sectionType={section.sectionType}
                    imageUrl={section.imageUrl}
                    redirectUrl={section.redirectUrl}
                    customSectionTheme={section.customSectionTheme}
                    sectionOrder={section.sectionOrder}
                  />
                </Box>
              </VerticalSortableItem>
              {afterSectionId === section.sectionId && AfterSectionComponent}
            </React.Fragment>
          ))}

          {sections.sectionState === "loading" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
            </Box>
          )}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

export default ViewContent;
