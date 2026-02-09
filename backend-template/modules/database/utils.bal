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

import se_wiki.types;

import ballerina/lang.regexp;
import ballerina/log;
import ballerina/sql;

# Build the database update query with dynamic attributes.
#
# + mainQuery - Main query without the new sub query  
# + subQueries - Sub Query array which needed to be appended with the main query
# + return - Dynamically build sql:ParameterizedQuery
isolated function buildSqlUpdateQuery(sql:ParameterizedQuery mainQuery, sql:ParameterizedQuery[] subQueries)
    returns sql:ParameterizedQuery {

    sql:ParameterizedQuery updatedQuery = mainQuery;
    int i = 0;
    foreach var subQuery in subQueries {
        i += 1;
        if i == 1 {
            updatedQuery = sql:queryConcat(updatedQuery, subQuery);
            continue;
        }
        updatedQuery = sql:queryConcat(updatedQuery, ` , `, subQuery);
    }
    return updatedQuery;
}

# Determines whether to show suggested content section based on pinned contents.
#
# + userEmail - User email
# + suggestedContentsLimit - Number of records to retrieve
# + suggestedContentsThreshold - Minimum number of suggestions required to show the section
# + return - Whether to show suggested section or error
public isolated function hasSuggestedContentFromPinnedContents(string userEmail, int suggestedContentsLimit,
        int suggestedContentsThreshold) returns boolean|error {

    types:ContentResponse[]|error result = getSuggestionsFromPinnedContents(userEmail, suggestedContentsLimit, 0);

    if result is types:ContentResponse[] {
        if result.length() > suggestedContentsThreshold {
            return true;
        }
    } else {
        log:printWarn("Failed to fetch suggestions from pinned contents for user ", result,
            userEmail = userEmail);
    }
    return false;
}

# Extract unique tags from content responses.
#
# + contents - Content responses
# + return - Array of unique tags
isolated function extractUniqueTags(types:ContentResponse[] contents) returns string[] {
    map<boolean> tagMap = {};

    foreach var content in contents {
        string[]? tags = content.tags;
        if tags is string[] {
            foreach string tag in tags {
                tagMap[tag] = true;
            }
        }
    }

    string[] uniqueTags = tagMap.keys();
    log:printDebug("Unique tags extracted", count = uniqueTags.length());
    return tagMap.keys();
}

# Get related contents based on tags and keywords.
#
# + userEmail - User email
# + uniqueTags - Unique tags
# + searchedKeywords - Searched keywords
# + 'limit - Number of records to retrieve
# + return - Related contents or error
isolated function getRelatedContents(string userEmail, string[] uniqueTags, string[] searchedKeywords, int 'limit)
    returns types:ContentResponse[]|error {

    if uniqueTags.length() == 0 && searchedKeywords.length() == 0 {
        log:printDebug("No tags or keywords for related contents");
        return [];
    }

    types:ContentResponse[] contents = check getContentsByTagsAndKeywords(
        userEmail, uniqueTags, searchedKeywords, 'limit, 0);
    log:printDebug("Related contents fetched", count = contents.length());
    return contents;
}

# Merge and deduplicate contents with fallback to pinned suggestions.
#
# + viewedBasedContents - Contents based on viewed items
# + relatedContents - Contents based on tags and keywords
# + userEmail - User email
# + 'limit - Maximum number of contents to return
# + return - Final merged and deduplicated contents or error
isolated function mergeAndDeduplicateContents(types:ContentResponse[] viewedBasedContents,
        types:ContentResponse[] relatedContents, string userEmail, int 'limit)
    returns types:ContentResponse[]|error {

    map<boolean> uniqueContentIds = {};
    types:ContentResponse[] finalContents = [];

    // Add viewed-based contents first
    foreach var content in viewedBasedContents {
        string key = content.contentId.toString();
        if !uniqueContentIds.hasKey(key) {
            uniqueContentIds[key] = true;
            finalContents.push(content);
        }
    }

    // Add related contents
    foreach var content in relatedContents {
        string key = content.contentId.toString();
        if !uniqueContentIds.hasKey(key) {
            uniqueContentIds[key] = true;
            finalContents.push(content);
            if finalContents.length() >= 'limit {
                log:printDebug("Final suggested contents", count = finalContents.length(), email = userEmail);
                return finalContents;
            }
        }
    }

    // Fallback: pinned suggestions if still under limit
    if finalContents.length() < 'limit {
        int remaining = 'limit - finalContents.length();
        types:ContentResponse[] fallback = check getSuggestionsFromPinnedContents(userEmail, remaining, 0);

        foreach var content in fallback {
            string key = content.contentId.toString();
            if !uniqueContentIds.hasKey(key) {
                finalContents.push(content);
                uniqueContentIds[key] = true;
                if finalContents.length() >= 'limit {
                    break;
                }
            }
        }
    }

    log:printDebug("Final suggested contents", count = finalContents.length(), email = userEmail);
    return finalContents;
}

# Parse tags from comma-separated string.
#
# + tagsString - Tags as string or ()
# + return - Array of parsed tags
isolated function parseTagsFromString(string? tagsString) returns string[] {
    if tagsString is () {
        log:printDebug("No tags string provided");
        return [];
    }

    string tagsStr = <string>tagsString;
    if (tagsStr.trim().length() == 0) {
        log:printDebug("Empty tags string after trimming");
        return [];
    }

    regexp:RegExp comma = re `,`;
    string[] tags = comma.split(tagsStr);

    return from string part in tags
        let string trimmed = part.trim()
        where trimmed.length() > 0
        select trimmed;
}

# Trim whitespace and filter out empty strings from an array.
#
# + arr - Input string array
# + return - Trimmed array
isolated function trimArray(string[] arr) returns string[] =>
    from string element in arr
let string trimmed = element.trim()
where trimmed.length() > 0
select trimmed;
