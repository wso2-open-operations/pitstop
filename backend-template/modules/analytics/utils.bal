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

import ballerina/lang.regexp;

configurable int topActivitiesCount = 6; // Number of top activities to consider

# Extract content name from the event label (Split by "Content: " to get the content name).
#
# + name - Event label string
# + return - Extracted content name or empty string if not found
isolated function getContentName(string name) returns string {
    regexp:RegExp contentRegex = re `Content: `;
    return contentRegex.split(name).length() > 1 ? contentRegex.split(name)[1] : "";
}

# Process trending contents to extract unique content names.
#
# + return - Array of unique trending content names (highest number of visits first) or error
public isolated function processTrendingContents() returns string[]|error {
    map<Event[]> response = check getTrendingContents();
    map<int> visitorCountMap = {};

    // Response shape: { "2025-09-21": [], "2025-09-22": [ {label: "", nb_visits: 5, ...}, ... ] }
    foreach [string, Event[]] [_, events] in response.entries() {
        foreach Event event in events {
            string contentName = getContentName(event.label);
            if contentName != "" {
                visitorCountMap[contentName] = (visitorCountMap[contentName] ?: 0) + event.nb_uniq_visitors;
            }
        }
    }
    return from var [name, count] in visitorCountMap.entries()
        order by count descending
        select name;
}

# Process recent activity of a user to extract searched keywords and viewed content names.
#
# + email - Email of the user
# + return - Visit summary or error
public isolated function processRecentActivityForUser(string email) returns VisitSummary|error {
    Visit[] visits = check getRecentActivityForUser(email);
    int i = 0;
    string[] searchedKeywords = [];
    string[] viewedContentNames = [];
    foreach Visit visit in visits {
        foreach ActionDetail actionDetail in visit.actionDetails {
            if i > topActivitiesCount {
                break;
            }
            match actionDetail.'type {
                SEARCH => {
                    // Check if subtitle is not empty and not already in the array
                    if actionDetail.subtitle != "" &&
                        searchedKeywords.indexOf(actionDetail.subtitle.toLowerAscii()) is () {
                        searchedKeywords.push(actionDetail.subtitle.toLowerAscii());
                        i += 1;
                    }
                }
                EVENT => {
                    string? contentName = actionDetail.eventName;
                    // Check if content name is not null, not empty and not already in the array
                    if contentName is string && getContentName(contentName) != "" &&
                        viewedContentNames.indexOf(getContentName(contentName)) is () {
                        viewedContentNames.push(getContentName(contentName));
                        i += 1;
                    }
                }
                _ => {
                }
            }
        }
    }
    return {searchedKeywords, viewedContentNames};
}
