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

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConfig } from "@config/config";
import { ApiService } from "@utils/apiService";
import { CustomButton, CreateCustomButton } from "../../types/types";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

interface CustomButtonState {
  buttonsByContentId: Record<string, CustomButton[]>;
  state: "idle" | "loading" | "success" | "failed";
  stateMessage: string | null;
  errorMessage: string | null;
}

const initialState: CustomButtonState = {
  buttonsByContentId: {},
  state: "idle",
  stateMessage: null,
  errorMessage: null,
};

export const getCustomButtons = createAsyncThunk(
  "customButtons/getCustomButtons",
  async (contentId: string, { dispatch }) => {
    return new Promise<{ contentId: string; buttons: CustomButton[] }>(
      (resolve, reject) => {
        ApiService.getInstance()
          .get(AppConfig.serviceUrls.getCustomButtons(contentId))
          .then((resp) => {
            resolve({ contentId, buttons: resp.data });
          })
          .catch((error) => {
            dispatch(
              enqueueSnackbarMessage({
                message: "Failed to load custom buttons",
                type: "error",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              })
            );
            reject(error);
          });
      }
    );
  }
);

export const createCustomButton = createAsyncThunk(
  "customButtons/createCustomButton",
  async (
    {
      button,
      showNotification = true,
    }: { button: CreateCustomButton; showNotification?: boolean },
    { dispatch }
  ) => {
    if (!button.contentId || !button.action || !button.actionValue?.trim()) {
      const errorMessage =
        "Missing required fields: contentId, action, and URL are required";
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        })
      );
      throw new Error(errorMessage);
    }

    return new Promise<{ button: CustomButton }>((resolve, reject) => {
      const payload = {
        contentId: button.contentId,
        label: button.label || "",
        description: button.description || "",
        icon: button.icon,
        color: button.color || "orange",
        action: button.action,
        actionValue: button.actionValue,
        isVisible: button.isVisible !== false,
        order: Number(button.order) || 0,
      };

      ApiService.getInstance()
        .post(AppConfig.serviceUrls.customButtons, payload)
        .then((resp) => {
          if (showNotification) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Custom button created successfully",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              })
            );
          }
          const createdButton: CustomButton = resp.data || {
            ...button,
            id: Date.now(),
          };
          resolve({ button: createdButton });
        })
        .catch((error) => {
          const backendError =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.statusText ||
            error.message;

          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to create custom button: ${backendError}`,
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
          reject(error);
        });
    });
  }
);

export const updateCustomButton = createAsyncThunk(
  "customButtons/updateCustomButton",
  async (
    {
      button,
      showNotification = true,
    }: { button: CustomButton; showNotification?: boolean },
    { dispatch }
  ) => {
    if (
      !button.id ||
      button.id <= 0 ||
      !button.contentId ||
      !button.action ||
      !button.actionValue?.trim()
    ) {
      const errorMessage = `Missing required fields: valid id (${button.id}), contentId (${button.contentId}), action (${button.action}), and URL (${button.actionValue}) are required`;

      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        })
      );
      throw new Error(errorMessage);
    }

    return new Promise<{ button: CustomButton }>((resolve, reject) => {
      const payload = {
        contentId: button.contentId,
        label: button.label,
        description: button.description,
        icon: button.icon,
        color: button.color,
        action: button.action,
        actionValue: button.actionValue,
        isVisible: button.isVisible,
        order: button.order,
      };

      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.updateCustomButton(button.id), payload)
        .then(() => {
          if (showNotification) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Custom button updated successfully",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              })
            );
          }
          resolve({ button });
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to update custom button: ${
                error.response?.data?.message || error.message
              }`,
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
          reject(error);
        });
    });
  }
);

export const deleteCustomButton = createAsyncThunk(
  "customButtons/deleteCustomButton",
  async (
    {
      buttonId,
      showNotification = true,
    }: { buttonId: number; showNotification?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    if (!buttonId || buttonId <= 0) {
      const errorMessage = `Invalid buttonId provided for deletion: ${buttonId}`;

      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        })
      );
      return rejectWithValue(errorMessage);
    }

    const deleteUrl = AppConfig.serviceUrls.deleteCustomButton(buttonId);
    try {
      await ApiService.getInstance().delete(deleteUrl);

      if (showNotification) {
        dispatch(
          enqueueSnackbarMessage({
            message: "Custom button deleted successfully",
            type: "success",
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          })
        );
      }

      return { buttonId };
    } catch (error: unknown) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to delete custom button",
          type: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        })
      );

      return rejectWithValue((error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || (error as unknown as { message: string }).message);
    }
  }
);

export const CustomButtonSlice = createSlice({
  name: "customButtons",
  initialState,
  reducers: {
    clearCustomButtons: (state, action: PayloadAction<string>) => {
      delete state.buttonsByContentId[action.payload];
      state.state = "idle";
      state.stateMessage = null;
      state.errorMessage = null;
    },
    updateButtonLocally: (
      state,
      action: PayloadAction<{ contentId: string; button: CustomButton }>
    ) => {
      const { contentId, button } = action.payload;
      if (state.buttonsByContentId[contentId]) {
        const index = state.buttonsByContentId[contentId].findIndex(
          (btn) => btn.id === button.id
        );
        if (index !== -1) {
          state.buttonsByContentId[contentId][index] = button;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomButtons.pending, (state) => {
        state.state = "loading";
        state.stateMessage = "Loading custom buttons...";
      })
      .addCase(getCustomButtons.fulfilled, (state, action) => {
        state.state = "success";
        state.buttonsByContentId[action.payload.contentId] =
          action.payload.buttons;
        state.stateMessage = "Custom buttons loaded successfully";
      })
      .addCase(getCustomButtons.rejected, (state) => {
        state.state = "failed";
        state.errorMessage = "something went wrong";
      })
      .addCase(createCustomButton.pending, (state) => {
        state.state = "loading";
        state.stateMessage = "Creating custom button...";
      })
      .addCase(createCustomButton.fulfilled, (state, action) => {
        state.state = "success";
        const contentId = action.payload.button.contentId;
        if (!state.buttonsByContentId[contentId]) {
          state.buttonsByContentId[contentId] = [];
        }
        state.buttonsByContentId[contentId].push(action.payload.button);
        state.stateMessage = "Custom button created successfully";
      })
      .addCase(createCustomButton.rejected, (state) => {
        state.state = "failed";
        state.errorMessage = "something went wrong";
      })
      .addCase(updateCustomButton.pending, (state) => {
        state.state = "loading";
        state.stateMessage = "Updating custom button...";
      })
      .addCase(updateCustomButton.fulfilled, (state, action) => {
        state.state = "success";
        const contentId = action.payload.button.contentId;
        if (state.buttonsByContentId[contentId]) {
          const index = state.buttonsByContentId[contentId].findIndex(
            (btn) => btn.id === action.payload.button.id
          );
          if (index !== -1) {
            state.buttonsByContentId[contentId][index] = action.payload.button;
          }
        }
        state.stateMessage = "Custom button updated successfully";
      })
      .addCase(updateCustomButton.rejected, (state) => {
        state.state = "failed";
        state.errorMessage = "something went wrong";
      })
      .addCase(deleteCustomButton.pending, (state) => {
        state.state = "loading";
        state.stateMessage = "Deleting custom button...";
      })
      .addCase(deleteCustomButton.fulfilled, (state, action) => {
        state.state = "success";
        Object.keys(state.buttonsByContentId).forEach((contentId) => {
          state.buttonsByContentId[contentId] = state.buttonsByContentId[
            contentId
          ].filter((btn) => btn.id !== action.payload.buttonId);
        });
        state.stateMessage = "Custom button deleted successfully";
      })
      .addCase(deleteCustomButton.rejected, (state) => {
        state.state = "failed";
        state.errorMessage = "something went wrong";
      });
  },
});

export const { clearCustomButtons, updateButtonLocally } =
  CustomButtonSlice.actions;
export default CustomButtonSlice.reducer;
