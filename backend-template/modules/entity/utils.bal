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

import ballerina/graphql;
import ballerina/log;

# Log GraphQL query result field errors (if exists) in the given GraphQL error object array.
#
# + clientError - Graphql client error
# + return - Error as an error type
isolated function handleGraphQlResultError(graphql:ClientError clientError) returns error {
    if clientError is graphql:PayloadBindingError {
        graphql:ErrorDetail[]? errors = clientError.detail().errors;
        log:printError(clientError.message(), clientError.cause(), info = errors);
    } else if clientError is graphql:InvalidDocumentError {
        graphql:ErrorDetail[]? errors = clientError.detail().errors;
        log:printError(clientError.message(), clientError.cause(), info = errors);
    } else if clientError is graphql:HttpError {
        anydata body = clientError.detail().body;
        log:printError(clientError.message(), clientError.cause(), info = body);
    } else {
        log:printError(clientError.message(), clientError.cause());
    }
    return clientError;
}
