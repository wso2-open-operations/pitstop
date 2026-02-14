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

import { AppConfig } from "@config/config";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiService } from "@utils/apiService";
import {
  RoutePayload,
  UpdateRoutePayload,
  RouteResponse,
  ReorderRoutesPayload,
  RouteContentItem,
  RouteContentPayload,
  UpdateRouteContentPayload,
  reparentRoutesPayload,
  PageData,
} from "../../types/types";
import { getPageData } from "@slices/pageSlice/page";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

const initialState: RouteState = {
  stateMessage: null,
  state: "idle",
  pageDataState: "idle",
  currentPath: "/",
  routeId: 1,
  label: "home",
  childrenRoutes: [],
  routes: [],
  routeContents: [],
  pageData: undefined,
  isRouteVisible: 1,
  reparentingState: "idle", 
};

interface RouteState {
  state?: "failed" | "success" | "loading" | "idle";
  pageDataState?: "failed" | "success" | "loading" | "idle";
  currentPath: string;
  label: string;
  routeId: number;
  childrenRoutes: RouteResponse[];
  stateMessage: string | null;
  routes: RouteResponse[];
  routeContents: RouteContentItem[];
  pageData?: PageData;
  isRouteVisible: number;
  reparentingState: 'idle' | 'loading' | 'success'; 
}

export const RouteSlice = createSlice({
  name: "getFormInfo",
  initialState,
  reducers: {
    updateRouterPath: (
      state,
      action: PayloadAction<{
        routeId: number;
        currentPath: string;
        label: string;
        children: RouteResponse[];
      }>
    ) => {
      state.routeId = action.payload.routeId;
      state.currentPath = action.payload.currentPath;
      state.label = action.payload.label;
      state.childrenRoutes = action.payload.children;
    },
    updateRouteId: (state, action: PayloadAction<number>) => {
      state.routeId = action.payload;
    },
    updateStateMessage: (state, action: PayloadAction<unknown>) => {
      state.stateMessage = action.payload as string;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Route Path
      .addCase(createNewRoute.pending, (state) => {
        state.state = "loading";
      })
      .addCase(createNewRoute.fulfilled, (state) => {
        state.stateMessage = "You have successfully created a page";
        state.state = "success";
      })
      .addCase(createNewRoute.rejected, (state) => {
        state.stateMessage = "Something went wrong while creating a route :(";
        state.state = "failed";
      })

      //Get Route Paths
      .addCase(getRoutesInfo.pending, (state) => {
        state.state = "loading";
      })
      .addCase(getRoutesInfo.fulfilled, (state, action) => {
        const newRoutes = action.payload.routesInfo;
        state.routes = [
          {
            path: "/",
            menuItem: "Home",
            routeId: 1,
            routeOrder: 0,
            isRouteVisible: true,
          },
          ...newRoutes,
          {
            path: "/my-board",
            menuItem: "My Board",
            routeId: -5,
            routeOrder: 1000,
            isRouteVisible: true,
          }
        ];
        state.state = "success";
      })
      .addCase(getRoutesInfo.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while fetching all page data :(";
      })

      //Update Route Path
      .addCase(updateRoute.pending, (state) => {
        state.state = "loading";
      })
      .addCase(updateRoute.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "You have successfully updated the page";
      })
      .addCase(updateRoute.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Something went wrong :(";
      })

      //Delete Route Path
      .addCase(deleteRoute.pending, (state) => {
        state.state = "loading";
      })
      .addCase(deleteRoute.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "You have successfully deleted the page";
      })
      .addCase(deleteRoute.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Something went wrong :(";
      })
      //Reorder Routes
      .addCase(reorderRoutes.fulfilled, (state, action) => {
        const { parentId, reorderRoutes } = action.meta.arg;

        const orderMap = new Map<number, number>(
          reorderRoutes.map((r) => [r.routeId, r.routeOrder])
        );

        const sortByOrderMap = (routes: RouteResponse[]) =>
          [...routes].sort(
            (a, b) =>
              (orderMap.get(a.routeId) ?? a.routeOrder) -
              (orderMap.get(b.routeId) ?? b.routeOrder)
          );

        const updateChildrenRecursively = (
          routes: RouteResponse[]
        ): RouteResponse[] =>
          routes.map((route) => {
            if (route.routeId === parentId) {
              return {
                ...route,
                children: sortByOrderMap(route.children ?? []).map((child) => ({
                  ...child,
                  routeOrder: orderMap.get(child.routeId) ?? child.routeOrder,
                })),
              };
            } else if (route.children && route.children.length > 0) {
              return {
                ...route,
                children: updateChildrenRecursively(route.children),
              };
            } else {
              return route;
            }
          });

        if (parentId === null) {
          const topLevelRoutes = state.routes.map((route) => ({
            ...route,
            routeOrder: orderMap.get(route.routeId) ?? route.routeOrder,
          }));

          state.routes = sortByOrderMap(topLevelRoutes);
        } else {
          state.routes = updateChildrenRecursively(state.routes);
        }
      })
      // Get Route Contents
      .addCase(getRouteContents.pending, (state) => {
        state.state = "loading";
      })
      .addCase(getRouteContents.fulfilled, (state, action) => {
        state.routeContents = action.payload;
        state.state = "success";
      })
      .addCase(getRouteContents.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while fetching route contents :(";
      })
      // Create Route Contents
      .addCase(createRouteContent.pending, (state) => {
        state.state = "loading";
      })
      .addCase(createRouteContent.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "Route content created successfully";
      })
      .addCase(createRouteContent.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while creating route content :(";
      })
      // Update Route Contents
      .addCase(updateRouteContent.pending, (state) => {
        state.state = "loading";
      })
      .addCase(updateRouteContent.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "Route content updated successfully";
      })
      .addCase(updateRouteContent.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while updating route content :(";
      })
      // Delete Route Contents
      .addCase(deleteRouteContent.pending, (state) => {
        state.state = "loading";
      })
      .addCase(deleteRouteContent.fulfilled, (state, action) => {
        const { contentId } = action.meta.arg;
        state.routeContents = state.routeContents.filter(
          (c) => c.contentId !== contentId
        );
      })
      .addCase(deleteRouteContent.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while deleting route content :(";
      })
      // Reparent Route
      .addCase(reparentRoutes.pending, (state) => {
        state.state = "loading";
        state.reparentingState = "loading";
      })
      .addCase(reparentRoutes.fulfilled, (state) => {
        state.state = "success";
        state.stateMessage = "Pages reparented successfully";
        state.reparentingState = "success";
      })
      .addCase(reparentRoutes.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while reparenting pages :(";
        state.reparentingState = "idle";
      })
      .addCase(toggleRouteVisibility.rejected, (state) => {
        state.state = "failed";
        state.stateMessage = "Error while updating route visibility :(";
      });
  },
});

//-------------------------Get new route paths---------------------------//
export const getRoutesInfo = createAsyncThunk(
  "pitstop/getRoutesInfo",
  async (routePath: string, { dispatch }) => {
    return new Promise<{
      routesInfo: RouteResponse[];
    }>((resolve, reject) => {
      ApiService.getInstance()
        .get(AppConfig.serviceUrls.createRouterPath) 
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(getPageData(routePath)).then(() => {
              resolve({
                routesInfo: resp.data,
              });
            });
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while fetching all page data :(",
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
//--------------------------------------------------------------------------//

//-------------------------Create a new route path--------------------------//

export const createNewRoute = createAsyncThunk(
  "pitstop/createRouterPath",
  async (
    payload: { newContent: RoutePayload; routePath: string },
    { dispatch }
  ) => {
    return new Promise<unknown>((resolve, reject) => {
      ApiService.getInstance()
        .post(AppConfig.serviceUrls.createRouterPath, payload.newContent)
        .then((resp) => {
          resolve({ requestResponse: resp.data });
          dispatch(
            enqueueSnackbarMessage({
              message: "You have successfully created a new page.",
              type: "success",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while creating a new page :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
          reject(resp);
        })
        .finally(() => {
          dispatch(getRoutesInfo(payload.routePath));
        });
    });
  }
);

//---------------------------------------------------------------------------//

//-------------------------Delete a particular route path--------------------------//

export const deleteRoute = createAsyncThunk(
  "pitstop/deleteRouterPath",
  async (payload: { routeId: number; routePath: string }, { dispatch }) => {
    return new Promise<unknown>((reject) => {
      ApiService.getInstance()
        .delete(AppConfig.serviceUrls.deleteRouterPath + payload.routeId)
        .then(() => {
          dispatch(
            enqueueSnackbarMessage({
              message: "You have successfully deleted the page.",
              type: "success",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while deleting the page :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
          reject(resp);
        })
        .finally(() => {
          dispatch(getRoutesInfo(payload.routePath));
        });
    });
  }
);

//---------------------------------------------------------------------------//

//---------------------Update a particular route path-----------------------//

export const updateRoute = createAsyncThunk(
  "pitstop/updatePage",
  async (
    payload: { page: UpdateRoutePayload; routePath: string },
    { dispatch }
  ) => {
    return new Promise<unknown>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.updateRouterPath, payload.page)
        .then((resp) => {
          resolve({ requestResponse: resp.data });
          dispatch(
            enqueueSnackbarMessage({
              message: "You have successfully edit the page details.",
              type: "success",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while updating the page :(",
              type: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            })
          );
          reject(resp);
        })
        .finally(() => {
          dispatch(getRoutesInfo(payload.routePath));
        });
    });
  }
);

//---------------------------------------------------------------------------//

//--------------------------Reordering the routes---------------------------//
export const reorderRoutes = createAsyncThunk(
  "pitstop/reorderRoutes",
  async (payload: ReorderRoutesPayload, { dispatch }) => {
    return new Promise<unknown>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.reorderRoutes, payload)
        .then((resp) => {
          resolve({ requestResponse: resp.data });
        })
        .catch((resp) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Something went wrong while reordering the routes :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(resp);
        });
    });
  }
);
//---------------------------------------------------------------------------//

//-----------------------------Get Route Contents---------------------------//
export const getRouteContents = createAsyncThunk(
  "routeContent/getRouteContents",
  async (_: void, { dispatch }) => {
    return new Promise<RouteContentItem[]>((resolve, reject) => {
      ApiService.getInstance()
        .get(`${AppConfig.serviceUrls.routeContents}`)
        .then((resp) => {
          if (resp.status === 200) {
            resolve(resp.data);
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while fetching Button :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);
//---------------------------------------------------------------------------//

//---------------------------Create Route Content---------------------------//
export const createRouteContent = createAsyncThunk(
  "routeContent/createRouteContent",
  async (
    payload: { content: RouteContentPayload; routeId: number },
    { dispatch }
  ) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .post(AppConfig.serviceUrls.routeContents, payload.content)
        .then((resp) => {
          if (resp.status === 201) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Button created successfully",
                type: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
            );
            resolve();
            dispatch(getRouteContents());
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while creating Button :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);
//---------------------------------------------------------------------------//

//---------------------------Update Route Content---------------------------//
export const updateRouteContent = createAsyncThunk(
  "routeContent/updateRouteContent",
  async (
    payload: { content: UpdateRouteContentPayload; routeId: number },
    { dispatch }
  ) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.routeContents, payload.content)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Button updated successfully",
                type: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
            );
            resolve();
            dispatch(getRouteContents());
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while updating Button :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);
//-----------------------------------------------------------------------------------//

//------------------------------Delete Route Content---------------------------------//
export const deleteRouteContent = createAsyncThunk(
  "routeContent/deleteRouteContent",
  async (payload: { contentId: number; routeId: number }, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .delete(`${AppConfig.serviceUrls.routeContents}/${payload.contentId}`)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Button deleted successfully",
                type: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
            );
            resolve();
            dispatch(getRouteContents());
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while deleting Button :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);
//-----------------------------------------------------------------------------------//

//------------------------------Reparent Routes---------------------------------//
export const reparentRoutes = createAsyncThunk(
  "pitstop/reparentRoutes",
  async (payload: reparentRoutesPayload, { dispatch }) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.reparentRoutes, payload)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Pages reparented successfully",
                type: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
            );
            resolve();
            dispatch(getRoutesInfo("/"));
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while reparenting pages :(",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);


export const toggleRouteVisibility = createAsyncThunk(
  "pitstop/toggleRouteVisibility",
  async (
    payload: { routeId: number; isRouteVisible: number; currentRoutePath: string },
    { dispatch }
  ) => {
    return new Promise<void>((resolve, reject) => {
      ApiService.getInstance()
        .patch(AppConfig.serviceUrls.toggleRouteVisibility(String(payload.routeId)), {
          isRouteVisible: payload.isRouteVisible,
        })

        .then((resp) => {
          if (resp.status === 200) {
            dispatch(
              enqueueSnackbarMessage({
                message: "Route visibility updated successfully.",
                type: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
            );
            
            dispatch(getRoutesInfo(payload.currentRoutePath));
            
            window.location.href = "/";
            resolve();
          }
        })
        .catch((error: Error) => {
          dispatch(
            enqueueSnackbarMessage({
              message: "Error while updating route visibility ",
              type: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right" },
            })
          );
          reject(error);
        });
    });
  }
);

export const { updateRouterPath, updateRouteId } = RouteSlice.actions;
export default RouteSlice.reducer;
