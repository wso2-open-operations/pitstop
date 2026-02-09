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


# Event.
public type Event record {|
    # Label
    string label;
    # Number of unique visitors
    int  nb_uniq_visitors;
    json...;
|};

# Request structure for analytics.
public type AnalyticsRequestParams record {|
    # Token for authentication
    string tokenAuth;
    # Site ID
    string idSite = "1";
    # Date range
    string date = "last30";
    # Limit for filtering
    string filterLimit = "2";
|};

# Detail of an action performed by a user.
public type ActionDetail record {|
    # Type of action
    string 'type;
    # Subtitle of the action
    string subtitle;
    # Event name
    string eventName?;
    json...;
|};

# Visit details of a user.
public type Visit record {|
    # User ID
    string userId;
    # Array of action details
    ActionDetail[] actionDetails;
    json...;
|};

# Summary of a user's visit.
public type VisitSummary record {|
    # Array of searched keywords
    string[] searchedKeywords;
    # Array of viewed content names
    string[] viewedContentNames;
|};
