// Copyright (c) // Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import se_wiki.types;

# Creating a route tree from a flat list.
#
# + allRoutes - Flat list of routes
# + return - Root routes with nested children
public isolated function buildRouteTree(types:Route[] allRoutes) returns types:RouteResponse[] {
    map<types:RouteResponse> routeMap =
        map from types:Route route in allRoutes
        let string key = route.routeId.toString()
        let types:RouteResponse value = {
            routeId: route.routeId,
            path: route.path,
            menuItem: route.menuItem,
            routeOrder: route.routeOrder,
            children: [],
            isRouteVisible: route.isRouteVisible
        }
        select [key, value];

    types:RouteResponse[] rootNodes = [];

    foreach types:Route route in allRoutes {
        string parentKey = route.parentId.toString();
        string childKey = route.routeId.toString();

        if route.parentId == 1 && routeMap.hasKey(childKey) {
            rootNodes.push(<types:RouteResponse>routeMap.get(childKey));
        } else if routeMap.hasKey(parentKey) && routeMap.hasKey(childKey) {
            types:RouteResponse parentRoute = routeMap.get(parentKey);
            types:RouteResponse childRoute = routeMap.get(childKey);
            parentRoute.children.push(childRoute);
        }
    }

    return rootNodes;
}
