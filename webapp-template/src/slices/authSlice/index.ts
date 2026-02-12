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

import { RootState } from "../store";
import { Role, AuthState, AuthData } from "@utils/types";
import { getUserPrivileges } from "@utils/auth";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const initialState: AuthState = {
  isAuthenticated: false,
  status: "idle",
  mode: "active",
  statusMessage: null,
  userInfo: null,
  idToken: null,
  isIdTokenExpired: null,
  decodedIdToken: null,
  roles: [],
  userPrivileges: null,
  errorMessage: null,
  authFlowState: "start",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserAuthData: (state, action: PayloadAction<AuthData>) => {
      state.userInfo = action.payload.userInfo;
      state.idToken = action.payload.idToken;
      state.decodedIdToken = action.payload.decodedIdToken;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadPrivileges.pending, (state) => {
        state.authFlowState = "l_user_privileges";
        state.status = "loading";
      })
      .addCase(loadPrivileges.fulfilled, (state, action) => {
        state.userPrivileges = action.payload;
        const roles = [];
        // appending UI roles based on user privileges
        if (action.payload.includes(987)) {
          roles.push(Role.EMPLOYEE);
        }
        if (action.payload.includes(537)) {
          roles.push(Role.SALES_ADMIN);
        }
        state.roles = roles;
        state.authFlowState = "end";
        state.isAuthenticated = true;
        state.status = "success";
      })
      .addCase(loadPrivileges.rejected, (state) => {
        state.status = "failed";
        state.authFlowState = "e_user_privileges";
        state.errorMessage = "Unable to load user privileges";
        state.isAuthenticated = false;
      });
  },
});

export const loadPrivileges = createAsyncThunk("auth/loadPrivileges", async () => {
  return getUserPrivileges();
});

export const { setUserAuthData } = authSlice.actions;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const isIdTokenExpired = (state: RootState) => state.auth.isIdTokenExpired;
export default authSlice.reducer;
