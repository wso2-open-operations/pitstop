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

import { RouterProvider, createBrowserRouter, RouteObject } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorHandler from "@component/common/ErrorHandler";
import PreLoader from "@component/common/PreLoader";
import Layout from "@layout/Layout";
import NotFoundPage from "@layout/pages/404";
import MaintenancePage from "@layout/pages/Maintenance";
import { RootState, store, useAppSelector } from "@slices/store";
import { isIncludedRole } from "@utils/utils";
import { routes } from "../route";
import type { RouteObjectWithRole } from "../types/types";


const createRouteLoader = (allowedRoles?: string[]) => {
  return () => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return null;
    }

    const state = store.getState();
    const userRoles = state.auth.roles;

    if (!isIncludedRole(userRoles, allowedRoles)) {
      throw new Response("Unauthorized", { status: 403 });
    }

    return null;
  };
};

const convertRoutesToStaticRoutes = (
  routes: RouteObjectWithRole[],
): RouteObject[] => {
  return routes.map((route) => ({
    path: route.path,
    element: route.element,
    loader: createRouteLoader(route.allowRoles),
    errorElement: route.errorElement,
    children: route.children ? convertRoutesToStaticRoutes(route.children) : undefined,
  }));
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: convertRoutesToStaticRoutes(routes),
  },
]);

const AppHandler = () => {
  const [appState, setAppState] = useState<"loading" | "success" | "failed" | "maintenance">(
    "loading",
  );

  const auth = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth.mode === "maintenance") {
      setAppState("maintenance");
    } else if (auth.status === "loading") {
      setAppState("loading");
    } else if (auth.status === "success") {
      setAppState("success");
    } else if (auth.status === "failed") {
      setAppState("failed");
    }
  }, [auth.status, auth.mode]);

  const renderApp = () => {
    switch (appState) {
      case "loading":
        return <PreLoader isLoading={true} message={"We are getting things ready ..."} />;

      case "failed":
        return <ErrorHandler message={auth.statusMessage} />;

      case "success":
        return <RouterProvider router={router} />;

      case "maintenance":
        return <MaintenancePage />;
    }
  };

  return <>{renderApp()}</>;
};

export default AppHandler;
