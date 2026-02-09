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

import ballerina/http;
import ballerina/jwt;
import ballerina/log;

# JWT Configurations.
configurable string[] authorizedRoles = ?;

# Decode Asgardeo issued JWT.
#
# + jwtString - JWT token
# + return - AsgardeoJwt or error
public isolated function decodeAsgardeoJwt(string jwtString) returns AsgardeoJwt|error {
    [jwt:Header, jwt:Payload] [_, payload] = check jwt:decode(jwtString);
    return payload.cloneWithType();
}

# Decode the given JWT and return the user information. (Email, Roles)
#
# + jwtString - JWT token  
# + authorizedRoles - Array of authorized roles
# + return - User information
public isolated function getUserInfo(string jwtString, string[] authorizedRoles) returns CustomJwtPayload|error {
    log:printDebug("Retrieving user info from the given JWT.");
    AsgardeoJwt {email, groups} = check decodeAsgardeoJwt(jwtString).ensureType();

    if email.length() == 0 {
        return error("No email found in the given JWT");
    }

    foreach string authorizedRole in authorizedRoles {
        if groups.indexOf(authorizedRole) !is () {
            return {email, groups};
        }
    }
    log:printError(string `${email} is missing a group, only has ${groups.toBalString()}`);
    return error("Insufficient Privileges");
}

# To handle authorization for each resource function invocation.
public isolated service class JwtInterceptor {
    *http:RequestInterceptor;
    isolated resource function default [string... path](http:RequestContext ctx, http:Request req)
        returns http:NextService|http:Unauthorized|http:Forbidden|error? {

        if req.method == http:HTTP_OPTIONS {
            return ctx.next();
        }

        CustomJwtPayload {email, groups} = check getUserInfo(check req.getHeader(JWT_ASSERTION), authorizedRoles);
        ctx.set(REQUESTED_BY_USER_EMAIL, email);
        ctx.set(REQUESTED_BY_USER_ROLES, groups);
        return ctx.next();
    }
}
