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

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { GridSortableItemProps } from "../../types/types";

const GridSortableItem = ({ id, children, disabled = false }: GridSortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        transform: isDragging ? "scale(1.05)" : "none",
        boxShadow: isDragging ? 3 : "none",
        transition: "transform 0.2s ease",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!disabled && (
        <IconButton
          {...attributes}
          {...listeners}
          sx={{
            position: "absolute",
            transform: "translateY(-10px)",
            left: 56,
            zIndex: 15,
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 5,
          }}
        >
          <DragIndicatorIcon
            sx={{
              width: 20,
              height: 20,
              borderRadius: 5,
              color: "white",
            }}
          />
        </IconButton>
      )}
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Box>
  );
};

export default GridSortableItem;
