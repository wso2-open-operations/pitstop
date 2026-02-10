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

import se_wiki.constants;
import se_wiki.entity;
import se_wiki.types;

import ballerina/lang.regexp;
import ballerina/log;
import ballerina/sql;

# Create a route path.
#
# + route - Route details
# + return - Sql error if any
public isolated function addRoutePath(RoutePayload route) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addRoutePathQuery(route));

    if result is sql:Error {
        log:printError(constants:ADD_ROUTE_ERROR, result);
        return error(constants:ADD_ROUTE_ERROR);
    }
}

# Get all routes.
#
# + return - Route list or errorreturn results;
public isolated function getAllRoutesFlat() returns types:Route[]|error {
    stream<types:Route, sql:Error?> resultStream = dbClient->query(getAllRoutesFlatQuery());
    return from types:Route result in resultStream
        select result;
}

# Add a new content.
#
# + createdBy - Created by user email
# + content - Content details
# + return - Error or nil
public isolated function addContent(types:ContentPayload content, string createdBy) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addContentQuery(content, createdBy));

    if result is sql:Error {
        log:printError(constants:ADD_CONTENT_ERROR, result);
        return error(constants:ADD_CONTENT_ERROR);
    }
}

# Verify the presence of content.
#
# + contentLink - Link to navigate to the content
# + contentType - Type of the content
# + sectionId - Section ID of the content
# + contentId - Content ID of the content
# + return - Whether content exists or error
public isolated function checkContentExists(string? contentLink = (), string? contentType = (), int? sectionId = (),
        int? contentId = ()) returns boolean|error? {
    int|error result = dbClient->queryRow(getContentIdQuery(contentLink, contentType, sectionId, contentId));

    if result is error {
        if result is sql:NoRowsError {
            // This function handles a POST request. Error logging is intentionally omitted for this operation.
            return;
        }
    }
    return result is int;
}

# Verify the presence of section.
#
# + title - Section title
# + routeId - Route ID of the section
# + sectionId - Section ID of the section 
# + return - Whether section exists or error
public isolated function checkSectionExists(string? title = (), int? routeId = (), int? sectionId = ())
    returns boolean|error? {
    int|error result = dbClient->queryRow(getSectionIdQuery(title, routeId, sectionId));

    if result is error {
        if result is sql:NoRowsError {
            // This function handles a POST request. Error logging is intentionally omitted for this operation.
            return;
        }
    }
    return result is int;
}

# Add a new comment.
#
# + comment - Comment details
# + return - Error or nil
public isolated function addComment(types:Comment comment) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addCommentQuery(comment));

    if result is sql:Error {
        log:printError(constants:ADD_COMMENT_ERROR, result);
        return error(constants:ADD_COMMENT_ERROR);
    }
}

# Get all contents under a given section.
#
# + isUser - Whether the requester is from a normal user
# + sectionId - Section ID
# + userEmail - User email
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Contents or error
public isolated function getContentsBySectionId(boolean isUser, int sectionId, string userEmail, int 'limit,
        int 'offset) returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];
    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(
    getContentsBySectionIdQuery(isUser, sectionId, userEmail, 'limit, 'offset));

    error? e = from ContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};
            if customContentTheme is string {
                types:CustomTheme|error convertedCustomContentTheme = customContentTheme.fromJsonStringWithType();
                if convertedCustomContentTheme is error {
                    log:printError(constants:GET_CONTENTS_ERROR, convertedCustomContentTheme, sectionId = sectionId);
                    return error(constants:GET_CONTENTS_ERROR, sectionId = sectionId);
                }
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };

    if e is error {
        log:printError(constants:GET_CONTENTS_ERROR, e, sectionId = sectionId);
        return error(constants:GET_CONTENTS_ERROR, sectionId = sectionId);
    }
    return contents;
}

# Delete content under a given ID.
#
# + contentId - Content ID
# + return - Error or nil
public isolated function deleteContentById(int contentId) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(deleteContentByIdQuery(contentId));
    return result.affectedRowCount;
}

# Delete section under a given ID.
#
# + sectionId - Section ID
# + return - Error or nil
public isolated function deleteSectionById(int sectionId) returns int|error? {
    int? rowCount = ();
    transaction {
        sql:ExecutionResult result = check dbClient->execute(deleteSectionsQuery(sectionId));
        rowCount = result.affectedRowCount;

        if rowCount is int && rowCount > 0 {
            _ = check dbClient->execute(deleteContentsBySectionIdQuery(sectionId));
            check commit;
        } else {
            rollback;
        }
    }
    return rowCount;
}

# Add like to a content.
#
# + likeContent - Like details
# + return - Error or nil
public isolated function addLike(types:LikeContent likeContent) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addLikeQuery(likeContent));

    if result is sql:Error {
        log:printError(constants:ADD_LIKE_ERROR, result);
        return error(constants:ADD_LIKE_ERROR);
    }
}

# Delete route path and corresponding sections of a given route ID.
#
# + routeId - Route ID
# + return - Error or nil
public isolated function deleteRoute(int routeId) returns int|error? {
    int? rowCount = ();
    transaction {
        sql:ExecutionResult res = check dbClient->execute(deleteRoutesQuery(routeId));
        rowCount = res.affectedRowCount;

        if rowCount is int && rowCount > 0 {
            _ = check dbClient->execute(deleteSectionsByRouteIdQuery(routeId));
            check commit;
        } else {
            rollback;
        }
    }
    return rowCount;
}

# Update route.
#
# + updateRoutePayload - New route details
# + return - Error or nil
public isolated function updateRoute(types:UpdateRoutePayload updateRoutePayload) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateRouteQuery(updateRoutePayload));
    return result.affectedRowCount;
}

# Get route details of a given path.
#
# + routeId - Route ID
# + return - Route details or error
public isolated function getRouteById(int routeId) returns types:Route|error? {
    types:Route|error result = dbClient->queryRow(getRouteByIdQuery(routeId));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("No route found", routeId = routeId);
            return;
        }
    }
    return result;
}

# Get basic information of a page.
#
# + routePath - Route path
# + return - Page details or error
public isolated function getPageDetails(string routePath) returns types:PageResponse|error? {
    PageResponse|error result = dbClient->queryRow(getPageDataQuery(routePath));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("Page not found", routePath = routePath);
            return;
        }
        return result;
    }

    PageResponse {customPageTheme, ...pageRest} = result;
    if customPageTheme is () {
        return {...pageRest};
    }
    types:CustomTheme|error convertedCustomPageTheme = customPageTheme.fromJsonStringWithType();
    if convertedCustomPageTheme is error {
        log:printError(constants:GET_PAGE_DATA_ERROR, convertedCustomPageTheme, routePath = routePath);
        return error(constants:GET_PAGE_DATA_ERROR, routePath = routePath);
    }
    return {...pageRest, customPageTheme: convertedCustomPageTheme};
}

# Update content.
#
# + contentId - Content ID 
# + updateContentPayload - New content details
# + userEmail - Email of the user for last verified by / updated by
# + return - Error or nil
public isolated function updateContent(int contentId, types:UpdateContentPayload updateContentPayload, string userEmail)
    returns int|error? {

    sql:ExecutionResult result = check dbClient->execute(updateContentQuery(contentId, updateContentPayload, userEmail));
    return result.affectedRowCount;
}

# Get section data using section ID.
#
# + sectionId - Section ID
# + return - Section data or error
public isolated function getSectionById(int sectionId) returns types:SectionPayload|error? {
    types:SectionPayload|error result = dbClient->queryRow(getSectionByIdQuery(sectionId));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("No section found", sectionId = sectionId);
            return;
        }
    }
    return result;
}

# Update section.
#
# + updateSectionPayload - New section details
# + return - Error or nil
public isolated function updateSection(types:UpdateSectionPayload updateSectionPayload) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateSectionQuery(updateSectionPayload));
    return result.affectedRowCount;
}

# Get section data of a given route path.
#
# + routePath - Route path
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + userEmail - User email to show pinned content section
# + return - Section id list or error
public isolated function getSectionByRoutePath(int 'limit, int 'offset, string? routePath, string? userEmail = ())
    returns types:Section[]|error {

    types:Section[] sections = [];

    stream<Section, sql:Error?> resultStream = dbClient->query(getSectionByRoutePathQuery('limit, 'offset, routePath));

    error? e = from Section {customSectionTheme, ...sectionRest} in resultStream
        do {
            types:Section convertedSection = {...sectionRest};
            if customSectionTheme is string {
                types:CustomTheme|error convertedCustomSectionTheme = customSectionTheme.fromJsonStringWithType();
                if convertedCustomSectionTheme is error {
                    log:printError(constants:GET_SECTION_ERROR, convertedCustomSectionTheme, routePath = routePath);
                    return error(constants:GET_SECTION_ERROR, routePath = routePath);
                }
                convertedSection.customSectionTheme = convertedCustomSectionTheme;
            }
            sections.push(convertedSection);
        };

    if e is error {
        log:printError(constants:GET_ALL_SECTION_IDS_ERROR, e, routePath = routePath);
        return error(constants:GET_ALL_SECTION_IDS_ERROR);
    }
    return sections;

}

# Add a new section.
#
# + section - Section details
# + return - Error or nil
public isolated function addSection(types:SectionPayload section) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addSectionQuery(section));

    if result is sql:Error {
        log:printError(constants:ADD_SECTION_ERROR, result);
        return error(constants:ADD_SECTION_ERROR);
    }
}

# Get user ID using user email.
#
# + userEmail - User_email
# + return - User ID or error 
public isolated function getUserIdByUserEmail(string userEmail) returns int|error? {
    int|error result = dbClient->queryRow(getUserIdQuery(userEmail));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("User not found");
            return;
        }
        return result;
    }
    return result;
}

# Add a new user.
#
# + user - User details
# + return - Error or nil
public isolated function addUser(entity:Employee user) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(addUserQuery(user));

    if result is sql:Error {
        log:printError(constants:ADD_USER_ERROR, result);
        return error(constants:ADD_USER_ERROR);
    }
}

# Get comments by content ID.
#
# + contentId - Content ID
# + return - Comments or error
public isolated function getCommentsByContentId(int contentId) returns types:CommentResponse[]|error {
    stream<types:CommentResponse, sql:Error?> resultStream = dbClient->query(
        getCommentsByContentIdQuery(contentId));
    types:CommentResponse[]|error results = from types:CommentResponse result in resultStream
        select result;

    if results is error {
        log:printError(constants:GET_COMMENTS_ERROR, results);
        return error(constants:GET_COMMENTS_ERROR);
    }
    return results;
}

# Get all the contents that contains a particular text.
#
# + userInput - User input
# + userEmail - User email
# + return - Contents or error
public isolated function getContentsByText(string userInput, string userEmail)
    returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];
    string text = "%" + userInput + "%";

    ContentFilter filter = {
        userEmail,
        mode: TEXT,
        text,
        'limit: DEFAULT_CONTENTS_LIMIT,
        'offset: DEFAULT_CONTENTS_OFFSET
    };

    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(searchContentsQuery(filter));

    check from ContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};
            if customContentTheme is string {
                types:CustomTheme|error convertedCustomContentTheme = customContentTheme.fromJsonStringWithType();
                if convertedCustomContentTheme is error {
                    log:printError(constants:GET_CONTENTS_BY_TEXT_ERROR, convertedCustomContentTheme);
                    return error(constants:GET_CONTENTS_BY_TEXT_ERROR);
                }
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };
    return contents;
}

# Get all content that contains a particular tag/s.
#
# + inputTags - Input tags
# + userEmail - User email
# + return - Contents or error
public isolated function getContentsByTags(string[] inputTags, string userEmail)
    returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];

    ContentFilter filter = {
        userEmail,
        mode: TAGS,
        tags: inputTags,
        'limit: DEFAULT_CONTENTS_LIMIT,
        'offset: DEFAULT_CONTENTS_OFFSET
    };

    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(searchContentsQuery(filter));

    check from ContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};
            if customContentTheme is string {
                types:CustomTheme|error convertedCustomContentTheme = customContentTheme.fromJsonStringWithType();
                if convertedCustomContentTheme is error {
                    log:printError(constants:GET_CONTENTS_ERROR, convertedCustomContentTheme);
                    return error(constants:GET_CONTENTS_ERROR);
                }
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };
    return contents;
}

# Reorder contents in the database.
#
# + reorderPayload - Reorder content payload
# + return - Error or nil
public isolated function reorderContents(types:ReorderContentPayload reorderPayload) returns error? {

    if reorderPayload.reorderContents.length() == 0 {
        return;
    }

    transaction {
        sql:ParameterizedQuery query = reorderContentsQuery(reorderPayload);
        sql:ExecutionResult|sql:Error result = dbClient->execute(query);

        if result is sql:Error {
            rollback;
            return error(constants:UPDATE_CONTENTS_ORDER_ERROR, result);
        } else {
            check commit;
        }
    }
    return;
}

# Reorder sections in the database.
#
# + reorderPayload - Reorder section payload
# + return - Error or nil
public isolated function reorderSections(types:ReorderSectionPayload reorderPayload) returns error? {

    if reorderPayload.reorderSections.length() == 0 {
        return;
    }

    transaction {
        sql:ParameterizedQuery query = reorderSectionsQuery(reorderPayload);
        sql:ExecutionResult|sql:Error result = dbClient->execute(query);

        if result is sql:Error {
            rollback;
            return error(constants:UPDATE_SECTIONS_ORDER_ERROR, result);
        } else {
            check commit;
        }
    }
    return;
}

# Reorder routes in the database.
#
# + reorderRoutesPayload - Reorder routes payload
# + return - Error or nil
public isolated function reorderRoutes(types:ReorderRoutesPayload reorderRoutesPayload) returns error? {
    if reorderRoutesPayload.reorderRoutes.length() == 0 {
        return;
    }

    transaction {
        sql:ParameterizedQuery query = reorderRoutesQuery(reorderRoutesPayload);
        sql:ExecutionResult|sql:Error result = dbClient->execute(query);

        if result is sql:Error {
            rollback;
            return error(constants:UPDATE_ROUTES_ORDER_ERROR, result);
        } else {
            check commit;
        }
    }
}

# Get content details for content report.
#
# + return - Content or error
public isolated function getContentDetails() returns types:ContentReport[]|error {
    stream<types:ContentReport, sql:Error?> resultStream = dbClient->query(getContentDetailsQuery());
    types:ContentReport[]|error results = from types:ContentReport result in resultStream
        select result;

    if results is error {
        log:printError(constants:GET_CONTENT_REPORT_ERROR, results);
        return error(constants:GET_CONTENT_REPORT_ERROR);
    }
    return results;
}

# Get content title by content id.
#
# + contentId - content id
# + return - content description
public isolated function getContentDetailById(int contentId) returns types:ContentResponseById|error? {
    types:ContentResponseById|error result = dbClient->queryRow(getContentDetailsByIdQuery(contentId));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("No content found", contentId = contentId);
            return;
        }
    }
    return result;
}

# Get all tags.
#
# + return - Tags or error
public isolated function getAllTags() returns types:TagResponse[]|error {
    stream<types:TagResponse, error?> resultStream = dbClient->query(getAllTagsQuery());
    return from types:TagResponse result in resultStream
        select result;
}

# Add a new tag.
#
# + tag - Tag details
# + return - Error or nil
public isolated function addTag(types:TagPayload tag) returns error? {
    _ = check dbClient->execute(addTagQuery(tag));
}

# Delete a Tag.
# + tagName - Tag details
# + return - Error or nil
public isolated function deleteTag(string tagName) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(deleteTagQuery(tagName));
    return result.affectedRowCount;
}

# Get route content details by route ID.
#
# + return - Array of route content items or error
public isolated function getRouteContentDetails() returns types:RouteContentItem[]|error {
    stream<types:RouteContentItem, sql:Error?> resultStream = dbClient->query(getRouteContentByRouteIdQuery());
    return from types:RouteContentItem result in resultStream
        select result;
}

# Add a new content for a route ID.
#
# + content - Content details
# + return - Error or nil
public isolated function addRouteContent(types:RouteContentPayload content) returns error? {
    _ = check dbClient->execute(addRouteContentQuery(content));
}

# Update content for a given content ID.
#
# + content - Update content details
# + return - Error or nil
public isolated function updateRouteContent(types:UpdateRouteContentPayload content) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateRouteContentQuery(content));
    return result.affectedRowCount;
}

# Delete a content in a route.
#
# + contentId - Content ID
# + return - Error or nil
public isolated function DeleteRouteContent(int contentId) returns error? {
    _ = check dbClient->execute(DeleteRouteContentQuery(contentId));
}

# Reparent routes to a new parent route.
#
# + payload - Route reparenting payload
# + return - Error or nil
public isolated function reparentRoutes(types:ReParentRoutesPayload payload) returns error? {
    transaction {
        sql:ParameterizedQuery[] reparentQueries = from int routeId in payload.routeIds
            select reparentRoutesQuery(payload.newParentId, routeId);

        _ = check dbClient->batchExecute(reparentQueries);
        check commit;
    }
}

# Updates the text of an existing comment in the database.
#
# + payload - Update comment details
# + updatedBy - Email of the user who updated the comment
# + return - Error or nil
public isolated function updateComment(types:UpdateCommentPayload payload, string updatedBy) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateCommentQuery(payload, updatedBy));
    return result.affectedRowCount;
}

# Deletes a comment from the database.
#
# + payload - Update comment details
# + updatedBy - Email of the user who deleted the comment
# + return - Error or nil
public isolated function deleteComment(types:UpdateCommentPayload payload, string updatedBy) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(deleteCommentQuery(payload, updatedBy));
    return result.affectedRowCount;
}

# Get comment data for a given comment ID and email.
#
# + commentId - parameter description  
# + email - parameter description
# + return - return value description
public isolated function getCommentData(int commentId, string email) returns types:CommentData|error? {
    types:CommentData|error result = dbClient->queryRow(getCommentDataQuery(commentId, email));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("Comment data not found", commentId = commentId, email = email);
            return;
        }
    }
    return result;
}

# Update the visibility of a route by ID.
#
# + routeId - Route ID to update visibility
# + payload - Route ID to update visibility
# + return - error? if operation fails
public isolated function updateRouteVisibility(int routeId, types:Routes payload) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateRouteVisibilityQuery(routeId, payload));
    return result.affectedRowCount;
}

# Add a new custom button.
#
# + button - Custom button create payload
# + return - Error 
public isolated function addCustomButton(CustomButtonCreatePayload button) returns int|error {
    sql:ExecutionResult result = check dbClient->execute(addCustomButtonQuery(button));
    return result.lastInsertId.ensureType(int);
}

# Get all custom buttons for a content.
#
# + contentId - Content ID
# + return - Custom button list or error
public isolated function getCustomButtons(string contentId) returns CustomButton[]|error {
    stream<CustomButton, sql:Error?> resultStream = dbClient->query(getCustomButtonsQuery(contentId));
    return from CustomButton result in resultStream
        select result;
}

# Update a custom button.
#
# + id - Custom button ID
# + button - Custom button update payload
# + return - Error or nil
public isolated function updateCustomButton(int id, CustomButtonUpdatePayload button) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(updateCustomButtonQuery(id, button));
    return result.affectedRowCount;
}

# Delete a custom button.
#
# + buttonId - Button ID
# + return - Error or nil
public isolated function deleteCustomButton(int buttonId) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(deleteCustomButtonQuery(buttonId));
    return result.affectedRowCount;
}

# Check if a custom button exists.
#
# + buttonId - Button ID
# + return - Whether button exists or error
public isolated function getCustomButton(int buttonId) returns CustomButton|error? {
    CustomButton|error result = dbClient->queryRow(getCustomButtonByIdQuery(buttonId));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("Custom button not found", buttonId = buttonId);
            return;
        }
    }
    return result;
}

# Get recent content created within the last month.
#
# + userEmail - User email
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Recent contents or error
public isolated function getRecentContents(string userEmail, int 'limit, int 'offset)
    returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];
    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(
        getRecentContentsQuery(userEmail, 'limit, 'offset));

    check from ContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};
            if customContentTheme is string {
                types:CustomTheme|error convertedCustomContentTheme = customContentTheme.fromJsonStringWithType();
                if convertedCustomContentTheme is error {
                    log:printError(constants:GET_RECENT_CONTENT_ERROR, convertedCustomContentTheme);
                    return error(constants:GET_RECENT_CONTENT_ERROR);
                }
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };

    return contents;
}

# Pin or update pin timestamp for a content.
#
# + pinContents - Pin details
# + return - Error or nil
public isolated function pinContents(types:PinContents pinContents) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(pinContentsQuery(pinContents));
    return result.affectedRowCount;
}

# Unpin a content.
#
# + pinContents - Pin details
# + return - Error or nil
public isolated function unpinContents(types:PinContents pinContents) returns error? {
    sql:ExecutionResult|sql:Error result = dbClient->execute(unpinContentsQuery(pinContents));

    if result is sql:Error {
        log:printError(constants:PIN_CONTENT_ERROR, result);
        return error(constants:PIN_CONTENT_ERROR);
    }
}

# Get pinned content for a user.
#
# + userEmail - User email
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Pinned contents or error
public isolated function getPinnedContents(string userEmail, int 'limit, int 'offset)
    returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];
    stream<PinnedContentResponse, sql:Error?> resultStream = dbClient->query(
        getPinnedContentsQuery(userEmail, 'limit, 'offset));

    check from PinnedContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {
                contentId: contentRest.contentId,
                sectionId: contentRest.sectionId,
                contentLink: contentRest.contentLink,
                contentType: contentRest.contentType,
                contentSubtype: contentRest.contentSubtype,
                thumbnail: contentRest.thumbnail,
                note: contentRest.note,
                description: contentRest.description,
                likesCount: contentRest.likesCount,
                status: contentRest.status,
                contentOrder: contentRest.contentOrder,
                createdOn: contentRest.createdOn,
                commentCount: contentRest.commentCount,
                customContentTheme: (),
                tags: (),
                isVisible: contentRest.isVisible,
                isReused: contentRest.isReused
            };
            if customContentTheme is string {
                types:CustomTheme|error convertedCustomContentTheme = customContentTheme.fromJsonStringWithType();
                if convertedCustomContentTheme is error {
                    log:printError(constants:GET_PINNED_CONTENT_ERROR, convertedCustomContentTheme);
                    return error(constants:GET_PINNED_CONTENT_ERROR);
                }
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };

    return contents;
}

# Check if user has any pinned content.
#
# + userEmail - User email
# + return - Boolean indicating if user has pinned content or error
public isolated function hasPinnedContent(string userEmail) returns boolean|error {
    stream<ContentIdResponse, sql:Error?> resultStream = dbClient->query(getPinnedContentIdsQuery(userEmail));

    ContentIdResponse[] ids = check from ContentIdResponse id in resultStream
        select id;
    return ids.length() > 0;
}

# Get trending contents from the database.
#
# + userEmail - User email 
# + names - Names of trending contents
# + return - Array of ContentResponse or error
public isolated function getTrendingContents(string userEmail, string[] names)
    returns types:ContentResponse[]|error {

    if names.length() == 0 {
        log:printDebug("No trending content names provided, returning empty result", userEmail = userEmail);
        return [];
    }

    types:ContentResponse[] contents = [];

    ContentFilter filter = {
        userEmail,
        mode: TRENDING,
        trendingDescriptions: names,
        'limit: DEFAULT_TRENDING_CONTENTS_LIMIT,
        'offset: DEFAULT_TRENDING_CONTENTS_OFFSET
    };

    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(searchContentsQuery(filter));

    check from ContentResponse {customContentTheme, tags, ...rest} in resultStream
        do {
            types:ContentResponse item = {...rest};
            if customContentTheme is string {
                item.customContentTheme = check customContentTheme.fromJsonStringWithType();
            }
            if tags is string {
                item.tags = (re `,`).split(tags);
            }
            contents.push(item);
        };

    return contents;
}

# Get content based on tags from user's pinned content.
#
# + userEmail - User email
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Suggested contents or error
public isolated function getSuggestionsFromPinnedContents(string userEmail, int 'limit, int 'offset)
    returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];
    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(
        getSuggestedContentsQuery(userEmail, 'limit, 'offset));

    check from ContentResponse {customContentTheme, tags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};
            if customContentTheme is string {
                types:CustomTheme convertedCustomContentTheme = check customContentTheme.fromJsonStringWithType();
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }
            if tags is string {
                regexp:RegExp separator = re `,`;
                string[] tagsArray = separator.split(tags);
                convertedContent.tags = tagsArray;
            }
            contents.push(convertedContent);
        };
    return contents;
}

# Get contents by tags and keywords. 
#
# + userEmail - User email
# + tags - Tags to search for
# + searchedKeywords - Keywords to search in description/note
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Contents or error
public isolated function getContentsByTagsAndKeywords(string userEmail, string[] tags, string[] searchedKeywords,
        int 'limit, int 'offset) returns types:ContentResponse[]|error {

    types:ContentResponse[] contents = [];

    ContentFilter filter = {
        userEmail,
        mode: TAGS_AND_KEYWORDS,
        tags,
        keywords: searchedKeywords
    };

    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(searchContentsQuery(filter));

    check from ContentResponse {customContentTheme, tags: contentTags, ...contentRest} in resultStream
        do {
            types:ContentResponse convertedContent = {...contentRest};

            if customContentTheme is string {
                types:CustomTheme convertedCustomContentTheme = check customContentTheme.fromJsonStringWithType();
                convertedContent.customContentTheme = convertedCustomContentTheme;
            }

            if contentTags is string {
                regexp:RegExp separator = re `,`;
                convertedContent.tags = separator.split(contentTags);
            }

            contents.push(convertedContent);
        };

    return contents;
}

# Get suggested contents for a user based on their recent activity.
#
# + userEmail - User email
# + searchedKeywords - Keywords searched by the user
# + viewedContentNames - Names of contents recently viewed by the user
# + 'limit - Number of records to retrieve
# + 'offset - Number of records to offset
# + return - Suggested contents or error
public isolated function getSuggestionsFromRecentActivity(string userEmail, string[] searchedKeywords,
        string[] viewedContentNames, int 'limit, int 'offset) returns types:ContentResponse[]|error {

    log:printDebug("Fetched analytics data", searchedKeywords = searchedKeywords,
        viewedContentNames = viewedContentNames);

    if searchedKeywords.length() == 0 && viewedContentNames.length() == 0 {
        log:printDebug("No recent activity from analytics");
        return getSuggestionsFromPinnedContents(userEmail, 'limit, 'offset);
    }

    types:ContentResponse[] viewedBasedContents = check getViewedContents(userEmail, viewedContentNames);
    string[] uniqueTags = extractUniqueTags(viewedBasedContents);
    types:ContentResponse[] relatedContents = check getRelatedContents(userEmail, uniqueTags, searchedKeywords, 'limit);

    return mergeAndDeduplicateContents(viewedBasedContents, relatedContents, userEmail, 'limit);
}

# Get contents based on viewed content names.
#
# + userEmail - User email
# + viewedContentNames - Names of viewed contents
# + return - Viewed based contents or error
isolated function getViewedContents(string userEmail, string[] viewedContentNames)
    returns types:ContentResponse[]|error {

    if viewedContentNames.length() == 0 {
        log:printDebug("No viewed content names provided, returning empty result", userEmail = userEmail);
        return [];
    }

    types:ContentResponse[] contents = [];

    ContentFilter filter = {
        userEmail,
        mode: TRENDING,
        trendingDescriptions: viewedContentNames
    };

    stream<ContentResponse, sql:Error?> resultStream = dbClient->query(searchContentsQuery(filter));

    check from ContentResponse {customContentTheme, tags, ...rest} in resultStream
        do {
            types:ContentResponse item = {...rest};
            if customContentTheme is string {
                item.customContentTheme = check customContentTheme.fromJsonStringWithType();
            }
            if tags is string {
                item.tags = (re `,`).split(tags);
            }
            contents.push(item);
        };

    log:printDebug("Viewed based contents fetched", count = contents.length());
    return contents;
}

# Get all customer testimonials (admin view).
#
# + return - Array of testimonials or error
public isolated function getAllTestimonials() returns CustomerTestimonial[]|error {
    stream<CustomerTestimonial, sql:Error?> resultStream = dbClient->query(getAllTestimonialsQuery());
    return from CustomerTestimonial result in resultStream
        select result;
}

# Create a new customer testimonial.
#
# + testimonial - Testimonial create payload
# + createdBy - User email who created
# + return - Inserted testimonial ID or error
public isolated function createTestimonial(CustomerTestimonialCreatePayload testimonial, string createdBy)
    returns int|error {

    sql:ExecutionResult result = check dbClient->execute(createTestimonialQuery(testimonial, createdBy));
    return result.lastInsertId.ensureType(int);
}

# Update a customer testimonial.
#
# + id - Testimonial ID
# + testimonial - Testimonial update payload
# + updatedBy - User email who updated
# + return - Affected row count or error
public isolated function updateTestimonial(int id, CustomerTestimonialUpdatePayload testimonial, string updatedBy)
    returns int|error? {

    sql:ExecutionResult result = check dbClient->execute(updateTestimonialQuery(id, testimonial, updatedBy));
    return result.affectedRowCount;
}

# Delete a customer testimonial.
#
# + id - Testimonial ID
# + return - Affected row count or error
public isolated function deleteTestimonialById(int id) returns int|error? {
    sql:ExecutionResult result = check dbClient->execute(deleteTestimonialQuery(id));
    return result.affectedRowCount;
}

# Get testimonial by ID.
#
# + id - Testimonial ID
# + return - Testimonial or error
public isolated function getTestimonialById(int id) returns CustomerTestimonial|error? {
    CustomerTestimonial|error result = dbClient->queryRow(getTestimonialByIdQuery(id));

    if result is error {
        if result is sql:NoRowsError {
            log:printError("Testimonial not found", id = id);
            return;
        }
    }
    return result;
}
