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

import ballerina/mime;

configurable AnalyticsRequestParams analyticsRequestParams = ?;

const SEARCH = "search";
const EVENT = "event";

# Get trending contents from the analytics service.
#
# + return - Trending content names in a string array or error
public isolated function getTrendingContents() returns map<Event[]>|error {
    return analyticsClient->/index\.php.post(
        {
            "module": "API",
            "token_auth": analyticsRequestParams.tokenAuth,
            "method": "Events.getName",
            "idSite": analyticsRequestParams.idSite,
            "period": "day",
            "date": analyticsRequestParams.date,
            "filter_limit": analyticsRequestParams.filterLimit,
            "format": "json"
        },
        headers = {"Content-Type": "application/x-www-form-urlencoded"},
        mediaType = mime:APPLICATION_FORM_URLENCODED
    );
}

# Get recent activity of a user from the analytics.
#
# + email - Email of the user
# + return - Visit summary or error
public isolated function getRecentActivityForUser(string email) returns Visit[]|error {
    return analyticsClient->/index\.php.post(
        {
            "module": "API",
            "token_auth": analyticsRequestParams.tokenAuth,
            "method": "Live.getLastVisitsDetails",
            "idSite": analyticsRequestParams.idSite,
            "period": "day",
            "date": analyticsRequestParams.date,
            "format": "json",
            "segment": "userId==" + email
        },
        headers = {"Content-Type": "application/x-www-form-urlencoded"},
        mediaType = mime:APPLICATION_FORM_URLENCODED
    );
}
