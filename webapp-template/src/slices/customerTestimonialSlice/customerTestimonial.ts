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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerTestimonial, CustomerTestimonialCreatePayload, CustomerTestimonialUpdatePayload } from "../../types/types";
import { AppConfig } from "@config/config";
import { ApiService } from "@utils/apiService";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

interface CustomerTestimonialState {
  items: CustomerTestimonial[];
  state: "idle" | "loading" | "success" | "failed";
  mutationState: "idle" | "loading" | "success" | "failed";
  stateMessage: string | null;
  errorMessage: string | null;
}

const initialState: CustomerTestimonialState = {
  items: [],
  state: "idle",
  mutationState: "idle",
  stateMessage: null,
  errorMessage: null,
};

export const fetchCustomerTestimonials = createAsyncThunk(
  "customerTestimonials/fetchAll",
  async (_, { dispatch }) => {
    return new Promise<CustomerTestimonial[]>((resolve, reject) => {
      ApiService.getInstance()
        .get(AppConfig.serviceUrls.testimonials)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Failed to load testimonials",
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

export const createCustomerTestimonial = createAsyncThunk(
  "customerTestimonials/create",
  async (
    {
      payload,
      showNotification = true,
    }: { payload: CustomerTestimonialCreatePayload; showNotification?: boolean },
    { dispatch }
  ) => {
    if (!payload.name || !payload.logoUrl || !payload.websiteUrl) {
      const errorMessage = "Missing required fields: name, logoUrl, and websiteUrl are required";
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

    return new Promise<CustomerTestimonial>((resolve, reject) => {
      ApiService.getInstance()
        .post(AppConfig.serviceUrls.createTestimonial, payload)
        .then((resp) => {
          if (showNotification) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Customer testimonial created successfully",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              })
            );
          }
          resolve(resp.data);
        })
        .catch((error) => {
          const backendError =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.statusText ||
            error.message;

          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to create testimonial: ${backendError}`,
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

export const updateCustomerTestimonial = createAsyncThunk(
  "customerTestimonials/update",
  async (
    {
      id,
      payload,
      showNotification = true,
    }: { id: number; payload: CustomerTestimonialUpdatePayload; showNotification?: boolean },
    { dispatch }
  ) => {
    return new Promise<{ id: number; data: CustomerTestimonial }>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.updateTestimonial(id), payload)
        .then((resp) => {
          if (showNotification) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Customer testimonial updated successfully",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              })
            );
          }
          resolve({ id, data: resp.data });
        })
        .catch((error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to update testimonial: ${
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

export const deleteCustomerTestimonial = createAsyncThunk(
  "customerTestimonials/delete",
  async (
    {
      id,
      showNotification = true,
    }: { id: number; showNotification?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    if (!id || id <= 0) {
      const errorMessage = `Invalid testimonial ID provided for deletion: ${id}`;

      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        })
      );
      return rejectWithValue(errorMessage);
    }

    try {
      await ApiService.getInstance().delete(AppConfig.serviceUrls.deleteTestimonial(id));

      if (showNotification) {
        dispatch(
          enqueueSnackbarMessage({
            message: "Customer testimonial deleted successfully",
            type: "success",
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          })
        );
      }

      return id;
    } catch (error: unknown) {
      dispatch(
        enqueueSnackbarMessage({
          message: "Failed to delete testimonial",
          type: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        })
      );

      return rejectWithValue((error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || (error as unknown as { message: string }).message);
    }
  }
);

const customerTestimonialSlice = createSlice({
  name: "customerTestimonials",
  initialState,
  reducers: {
    resetMutationState: (state) => {
      state.mutationState = "idle";
      state.stateMessage = null;
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch testimonials
      .addCase(fetchCustomerTestimonials.pending, (state) => {
        state.state = "loading";
        state.stateMessage = "Loading testimonials...";
      })
      .addCase(fetchCustomerTestimonials.fulfilled, (state, action) => {
        state.state = "success";
        state.items = action.payload;
        state.stateMessage = "Testimonials loaded successfully";
      })
      .addCase(fetchCustomerTestimonials.rejected, (state) => {
        state.state = "failed";
        state.errorMessage = "Failed to load testimonials";
      })
      // Create testimonial
      .addCase(createCustomerTestimonial.pending, (state) => {
        state.mutationState = "loading";
        state.stateMessage = "Creating testimonial...";
      })
      .addCase(createCustomerTestimonial.fulfilled, (state, action) => {
        state.mutationState = "success";
        state.items.push(action.payload);
        state.stateMessage = "Testimonial created successfully";
      })
      .addCase(createCustomerTestimonial.rejected, (state) => {
        state.mutationState = "failed";
        state.errorMessage = "Failed to create testimonial";
      })
      // Update testimonial
      .addCase(updateCustomerTestimonial.pending, (state) => {
        state.mutationState = "loading";
        state.stateMessage = "Updating testimonial...";
      })
      .addCase(updateCustomerTestimonial.fulfilled, (state, action) => {
        state.mutationState = "success";
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.stateMessage = "Testimonial updated successfully";
      })
      .addCase(updateCustomerTestimonial.rejected, (state) => {
        state.mutationState = "failed";
        state.errorMessage = "Failed to update testimonial";
      })
      // Delete testimonial
      .addCase(deleteCustomerTestimonial.pending, (state) => {
        state.mutationState = "loading";
        state.stateMessage = "Deleting testimonial...";
      })
      .addCase(deleteCustomerTestimonial.fulfilled, (state, action) => {
        state.mutationState = "success";
        state.items = state.items.filter(item => item.id !== action.payload);
        state.stateMessage = "Testimonial deleted successfully";
      })
      .addCase(deleteCustomerTestimonial.rejected, (state) => {
        state.mutationState = "failed";
        state.errorMessage = "Failed to delete testimonial";
      });
  },
});

export const { resetMutationState } = customerTestimonialSlice.actions;

// Selectors
export const selectCustomerTestimonials = (state: { customerTestimonials: CustomerTestimonialState }) =>
  [...state.customerTestimonials.items].sort((a, b) => a.id - b.id);

export const selectCustomerTestimonialState = (state: { customerTestimonials: CustomerTestimonialState }) =>
  state.customerTestimonials.state;

export const selectCustomerTestimonialMutationState = (state: { customerTestimonials: CustomerTestimonialState }) =>
  state.customerTestimonials.mutationState;

export const selectCustomerTestimonialError = (state: { customerTestimonials: CustomerTestimonialState }) =>
  state.customerTestimonials.errorMessage;

export default customerTestimonialSlice.reducer;
