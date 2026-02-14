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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import { SideBarSortableItemProps } from "../../types/types"

const SidebarSortableItem = ({
  id,
  width,
  disabled,
  dragHandle,
  children,
}: SideBarSortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    opacity: isDragging ? 0.8 : 1,
    width,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        transform: isDragging ? "scale(1.05)" : "none",
        boxShadow: isDragging ? 3 : "none",
        transition: "transform 0.2s ease",
        cursor: disabled ? "default" : "grab",
        "&:active": {
          cursor: disabled ? "default" : "grabbing",
        },
        display: "flex",
        alignItems: "center",
      }}
    >
      {React.cloneElement(children as React.ReactElement<{
        dragHandle?: React.ReactNode;
        dragListeners?: Record<string, unknown>;
      }>, {
        dragHandle,
        dragListeners: listeners,
      })}
    </Box>
  );
};

export default SidebarSortableItem;
