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
import { Box, IconButton} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { VerticalSortableItemProps } from "../../types/types";

const VerticalSortableItem = ({
  id,
  children,
  disabled = false,
}: VerticalSortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id!, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const numericId =
    typeof id === "string" && id.startsWith("section-")
      ? parseInt(id.replace("section-", ""), 10)
      : typeof id === "number"
      ? id
      : undefined;

  const isHandleHidden =
    numericId !== undefined && (numericId === -1 || numericId === -2 || numericId === -3);

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: "relative",
        width: "100%",
        "&:active": {
          transform: "none !important",
        },
      }}
      {...attributes}
    >
      {!disabled && !isHandleHidden && (
        <IconButton
          ref={setActivatorNodeRef}
          {...listeners}
          aria-label="Drag to reorder section"
          sx={{
            position: "absolute",
            top: 40,
            left: 80,
            zIndex: 10,
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            width: 36,
            height: 36,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 5,
          }}
        >
          <DragIndicatorIcon
            color="disabled"
            fontSize="small"
            sx={{
              width: 24,
              height: 24,
              color: "white",
            }}
          />
        </IconButton>
      )}
      <Box
        sx={{
          cursor: "default",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default VerticalSortableItem;
