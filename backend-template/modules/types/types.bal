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

import ballerina/constraint;
import ballerina/sql;
import ballerina/time;

# Route payload record.
public type RoutePayload record {|
    # Parent ID
    int parentId;
    # Page title
    string title;
    # Page description
    string? description = ();
    # Page thumbnail
    @constraint:String {pattern: constants:URL}
    string? thumbnail = ();
    # Navbar item name
    string label;
    # Page custom theme
    CustomTheme customPageTheme?;
    # Page visibility
    boolean isVisible;
|};

# Section payload record.
public type SectionPayload record {|
    # Route ID
    @sql:Column {name: "route_id"}
    int routeId;
    # Type of the section
    @sql:Column {name: "section_type"}
    string sectionType;
    # Image url
    @constraint:String {pattern: constants:URL}
    @sql:Column {name: "image_url"}
    string? imageUrl = ();
    # Redirect url
    @constraint:String {pattern: constants:URL}
    @sql:Column {name: "redirect_url"}
    string? redirectUrl = ();
    # Title
    @sql:Column {name: "title"}
    string title;
    # Description
    @sql:Column {name: "description"}
    string description?;
    # Section custom theme
    CustomTheme customSectionTheme?;
    # Tags associated with the section
    @sql:Column {name: "tags"}
    string tags?;
|};

# Content payload record.
public type ContentPayload record {|
    # Section ID
    int sectionId;
    # Link to redirect to the content
    @constraint:String {pattern: constants:URL}
    string contentLink;
    # Type of the content
    string contentType;
    # Content subtype of the content
    string contentSubtype?;
    # Thumbnail image url
    string thumbnail?;
    # Content notes
    string note?;
    # Content description
    string description;
    # Content custom theme 
    CustomTheme customContentTheme?;
    # Boolean value ro check the deletion of the content
    boolean isDeleted = false;
    # Content tags
    string tags;
    # Content reuse 
    boolean isReused = false;
|};

# Comment payload record.
public type CommentPayload record {|
    # Id of the content
    int contentId;
    # Provided comment for the post
    string comment;
|};

# Update route payload record.
public type UpdateRoutePayload record {|
    # route ID
    int routeId;
    # Page title
    string title?;
    # Page description
    string description?;
    # Page thumbnail
    string thumbnail?;
    # Navbar item name
    string menuItem?;
    # Page custom theme
    CustomTheme customPageTheme?;
    # Sub page visibility
    boolean isVisible;
|};

# Update section payload record.
public type UpdateSectionPayload record {|
    # Section ID
    int sectionId;
    # Type of the section
    string sectionType?;
    # Image url
    string imageUrl?;
    # Redirect url
    string redirectUrl?;
    # Title
    string title?;
    # Description
    string description?;
    # Section custom theme
    CustomTheme customSectionTheme?;
    # Vertical tags
    string tags?;
|};

# Update content payload record.
public type UpdateContentPayload record {|
    # Link to redirect to the content
    string? contentLink = ();
    # Thumbnail image url
    string thumbnail?;
    # Content notes
    string note?;
    # Type of the content
    string contentType?;
    # Content subtype of the content
    string contentSubtype?;
    # Content description
    string description?;
    # Content custom theme
    CustomTheme customContentTheme?;
    # Boolean value if verified content
    boolean verifyContent?;
    # Content tags
    string tags?;
    # Content visibility
    boolean isVisible?;
    # Content reuse
    boolean isReused?;
|};

# Route response record.
public type RouteResponse record {|
    # Route ID
    int routeId;
    # Route path
    string path;
    # Navbar item name
    string menuItem;
    # Route order
    int routeOrder;
    # Children route paths
    RouteResponse[] children;
    # Route visibility status
    boolean isRouteVisible?;
|};

# Page response record.
public type PageResponse record {|
    # Page title
    string title;
    # Page description
    string description?;
    # Page thumbnail
    string thumbnail?;
    # Page custom theme
    CustomTheme customPageTheme?;
    # Sub page visibility
    boolean isVisible;
|};

# Section response record.
public type SectionResponse record {|
    # Section id
    int sectionId;
    # Section title
    string title;
    # Section description
    string description?;
    # Type of the section
    string sectionType;
    # Image url
    string imageUrl?;
    # Redirect url
    string redirectUrl?;
    # Section order
    int sectionOrder;
    # Section content
    ContentResponse[] contentData;
    # Section custom theme
    CustomTheme customSectionTheme?;
    # Vertical tags
    string tags?;
|};

# Content response record.
public type ContentResponse record {|
    # Content ID
    int contentId;
    # Route ID
    int sectionId;
    # Link to redirect to the content
    string contentLink;
    # Type of the content
    string contentType;
    # Content subtype of the content
    string? contentSubtype;
    # Thumbnail image url
    string thumbnail?;
    # Content notes
    string note?;
    # Content description
    string description;
    # Likes count of the content
    int likesCount;
    # likes for the content
    boolean status?;
    # Content order
    int contentOrder;
    # Custom theme for the content
    CustomTheme customContentTheme?;
    # content creaeted date
    string createdOn;
    # number of comments
    int commentCount;
    # Content tags
    string[] tags?;
    # Content visibility
    boolean isVisible;
    # Content reuse
    boolean isReused;
|};

# Comment response record.
public type CommentResponse record {|
    # Id of the comment
    int commentId;
    # Provided comment for the post
    string comment;
    # Created on date
    string createdOn;
    # User name 
    string userName;
    # User email 
    string userEmail;
    # User thumbnail
    string? userThumbnail;
|};

# Tag response record.
public type TagResponse record {|
    # Tag name
    string tagName;
    # Tag color
    string color;
|};

# Route helper record.
public type Route record {|
    # Route ID
    @sql:Column {name: "route_id"}
    int routeId;
    # Parent Route ID
    @sql:Column {name: "parent_id"}
    int parentId?;
    # Route path
    @sql:Column {name: "route_path"}
    string path;
    # Route Menu Item
    @sql:Column {name: "menu_item"}
    string menuItem;
    # Route order
    @sql:Column {name: "route_order"}
    int routeOrder;
    # Page title
    string title;
    # Page description
    string description?;
    # Page thumbnail
    string thumbnail?;
    # Sub page visibility
    boolean isVisible;
    # Route visibility status
    boolean isRouteVisible?;
|};

# Section helper record.
public type Section record {|
    # Section Id
    int sectionId;
    # Section title
    string title;
    # Section description
    string description?;
    # Type of the section
    string sectionType;
    # Image url
    string imageUrl?;
    # Redirect url
    string redirectUrl?;
    # Section order
    int sectionOrder;
    # Custom section theme
    CustomTheme customSectionTheme?;
    # Tags associated with the section
    string tags?;
|};

# Comment helper record.
public type Comment record {|
    # Id of the content
    int contentId;
    # Id of the user 
    int userId;
    # Provided comment for the post
    string comment;
|};

# Like helper record.
public type LikeContent record {|
    # Content id
    int contentId;
    # User id
    int userId;
    # Boolean value for check whether user liked content or not
    boolean status = false;
|};

# Pin helper record.
public type PinContents record {|
    # Content id
    int contentId;
    # User email
    string userEmail;
|};

public enum SectionType {
    IMAGE = "image",
    SECTION = "section",
    RECENT_CONTENT = "recent_content",
    PINNED_CONTENT = "pinned_content"
}

# Custom theme record.
public type CustomTheme record {|
    # Custom title theme
    CustomStylingInfo title?;
    # Custom description theme
    CustomStylingInfo description?;
    # Custom note theme
    CustomStylingInfo note?;
    # Custom cropped image
    CroppedImageSizing cropSizing?;
|};

# Cropped image sizing information record.
public type CroppedImageSizing record {|
    # Cropped image width
    int width;
    # Cropped image height
    int height;
    # Cropped image x coordinate
    int x;
    # Cropped image y coordinate
    int y;
|};

# Styling information record.
public type CustomStylingInfo record {|
    # Background color
    string background?;
    # Font size
    int fontSize?;
    # Font family
    string fontFamily?;
    # Font weight
    string fontWeight?;
    # Font style
    string fontStyle?;
    # Text underline
    boolean underline?;
    # Text color
    string color?;
    # Flag to indicate if using rich text
    boolean richText?;
    # HTML content
    string htmlContent?;
|};

# Update content order record.
public type SwapContentOrders record {|
    # Content ID
    int contentId;
    # Content Order
    int contentOrder;
|};

# Payload for reordering contents.
public type ReorderContentPayload record {|
    # Section ID
    int sectionId;
    # Array of content items to reorder
    SwapContentOrders[] reorderContents;
|};

# Update section order record.
public type SwapSectionOrders record {|
    # Section ID
    int sectionId;
    # Section Order
    int sectionOrder;
|};

# Payload for reordering sections.
public type ReorderSectionPayload record {|
    # Array of section items to reorder
    SwapSectionOrders[] reorderSections;
|};

# Update route order record.
public type ReorderRouteItem record {|
    # Route ID
    int routeId;
    # Route Order
    int routeOrder;
    # Route visibility status
    int isRouteVisible?;
|};

# Payload for reordering sections.
public type ReorderRoutesPayload record {|
    # Parent ID
    int? parentId;
    # Array of routes items to reorder
    ReorderRouteItem[] reorderRoutes;
|};

# Get all available content record.
public type ContentReport record {|
    # Content description
    string contentName;
    # Link to redirect to the content
    string contentLink;
    # Page name
    string pageName;
    # Section name
    string sectionName;
    # Created by user
    string? createdBy;
    # Created on date
    string createdDate;
    # Last verified by user
    string? lastVerifiedBy;
    # Last verified on date
    string lastVerifiedDate;
|};

# Content response record.
public type ContentResponseById record {|
    # Content ID
    int contentId;
    # Section ID
    int sectionId;
    # Content description
    string description;
    # Route path
    string routePath;
|};

# Tag payload record.
public type TagPayload record {|
    # Tag Name
    string tagName;
|};

# Individual route content item.
public type RouteContentItem record {|
    # Content ID
    int contentId;
    # Route ID
    int routeId;
    # Content link
    string contentLink;
    # Content description
    string description;
    # Type of the content
    string contentType;
|};

# Payload for creating content under a route.
public type RouteContentPayload record {|
    # Route ID
    int routeId;
    # Content link
    string contentLink;
    # Content description
    string description;
|};

# Payload for updating content under a route.
public type UpdateRouteContentPayload record {|
    # Content ID
    int contentId;
    # Content link
    string contentLink;
    # Content description
    string description;
|};

# Payload for reparenting routes.
public type ReParentRoutesPayload record {|
    # Parent ID
    int newParentId;
    # Array of route IDs to reparent
    int[] routeIds;
|};

# Update comment payload record.
public type UpdateCommentPayload record {|
    # Id of the comment
    int commentId;
    # Id of the content
    int contentId;
    # Provided comment for the post
    string comment;
|};

# Comment data record.
public type CommentData record {|
    # The ID of the user who created the comment
    @sql:Column {name: "created_by"}
    int createdBy;
    # The timestamp when the comment was created
    @sql:Column {name: "created_on"}
    time:Utc createdOn;
|};

# Update route visibility payload record.
public type Routes record {|
    # Route visibility status
    int isRouteVisible;
|};

# Pin content payload record.
public type PinContentPayload record {|
    # Content ID to pin
    int contentId;
|};

# Application information record.
public type AppInfo record {|
    # List of URLs that cannot be embedded in iframes
    string[] blockedIframeUrls;
|};
