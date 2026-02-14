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
public configurable AppRoles authorizedRoles = ?;

# To handle authorization for each resource function invocation.
public isolated service class JwtInterceptor {
    *http:RequestInterceptor;

    isolated resource function default [string... path](http:RequestContext ctx, http:Request req)
            returns http:NextService|http:Forbidden|http:InternalServerError|error? {

        if req.method == http:HTTP_OPTIONS {
            return ctx.next();
        }

        string|error idToken = req.getHeader(JWT_ASSERTION);
        if idToken is error {
            string errorMsg = "Missing invoker info header!";
            log:printError(errorMsg, idToken);
            return <http:InternalServerError>{
                body: {
                    message: errorMsg
                }
            };
        }

        [jwt:Header, jwt:Payload]|jwt:Error decoded = jwt:decode(idToken);
        if decoded is jwt:Error {
            string errorMsg = "Error while reading the invoker info!";
            log:printError(errorMsg, decoded);
            return <http:InternalServerError>{
                body: {
                    message: errorMsg
                }
            };
        }

        CustomJwtPayload|error userInfo = decoded[1].cloneWithType(CustomJwtPayload);
        if userInfo is error {
            string errorMsg = "Malformed invoker info object!";
            log:printError(errorMsg, userInfo);
            return <http:InternalServerError>{
                body: {
                    message: errorMsg
                }
            };
        }

        // Authorization check
        foreach anydata role in authorizedRoles.toArray() {
            if userInfo.groups.some(r => r === role) {
                ctx.set(REQUESTED_BY_USER_EMAIL, userInfo.email);
                ctx.set(REQUESTED_BY_USER_ROLES, userInfo.groups);

                return ctx.next();
            }
        }

        log:printError(string `${userInfo.email} is missing required permissions, only has ${userInfo.groups.toBalString()}`);

        return <http:Forbidden>{
            body: {
                message: "Insufficient privileges!"
            }
        };
    }
}
