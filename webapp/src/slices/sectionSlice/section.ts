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
import { AppConfig } from "@config/config";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { getPageData } from "@slices/pageSlice/page";
import { ApiService } from "@utils/apiService";

import { RouteStatuses, SectionPayload, UpdateSectionPayload } from "../../types/types";

const initialState: SectionState = {
  stateMessage: null,
  state: "idle",
  sectionId: 1,
};

interface SectionState {
  state?: RouteStatuses;
  sectionId: number;
  stateMessage: string | null;
}

export const SectionSlice = createSlice({
  name: "getSectionInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Section
      .addCase(createNewSection.pending, (state) => {
        state.state = "loading";
      })
      .addCase(createNewSection.fulfilled, (state) => {
        state.stateMessage = "You have successfully created a section";
        state.state = "success";
      })
      .addCase(createNewSection.rejected, (state) => {
        state.stateMessage = "Something went wrong :(";
        state.state = "failed";
      })

      //Update Section
      .addCase(updateSection.pending, (state) => {
        state.state = "loading";
      })
      .addCase(updateSection.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "You have successfully updated the section";
      })
      .addCase(updateSection.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Something went wrong :(";
      })

      //Delete Section
      .addCase(deleteSection.pending, (state) => {
        state.state = "loading";
      })
      .addCase(deleteSection.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "You have successfully deleted the section";
      })
      .addCase(deleteSection.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Something went wrong :(";
      });
  },
});

//Create a new section
export const createNewSection = createAsyncThunk(
  "pitstop/createNewSection",
  async (payload: { section: SectionPayload; routePath: string }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .post(AppConfig.serviceUrls.createNewSection, payload.section)
        .then(() => {
          resolve();
          dispatch(getPageData(payload.routePath));
          dispatch(
            enqueueSnackbarMessage({
              message: "You have successfully created a new section.",
              type: "success",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }),
          );
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while creating new section :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }),
          );
          reject(resp);
        });
    });
  },
);

//Delete a section
export const deleteSection = createAsyncThunk(
  "pitstop/deleteSection",
  async (payload: { routeId: number; sectionId: number; routePath: string }, { dispatch }) => {
    return new Promise<unknown>((reject) => {
      ApiService.getInstance()
        .delete(AppConfig.serviceUrls.deleteSection + payload.sectionId)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(getPageData(payload.routePath));
            dispatch(
              enqueueSnackbarMessage({
                message: "You have successfully deleted the section.",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              }),
            );
          }
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while deleting a section :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }),
          );
          reject(resp);
        });
    });
  },
);

//Update a section
export const updateSection = createAsyncThunk(
  "pitstop/updateSection",
  async (payload: { section: UpdateSectionPayload; routePath: string }, { dispatch }) => {
    return new Promise<unknown>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.updateSection, payload.section)
        .then((resp) => {
          if (resp.status == 200) {
            dispatch(getPageData(payload.routePath));
            dispatch(
              enqueueSnackbarMessage({
                message: "You have successfully edit the section details.",
                type: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              }),
            );
            resolve({ requestResponse: resp.data });
          }
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while updating a section :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }),
          );
          reject(resp);
        });
    });
  },
);

export default SectionSlice.reducer;
