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

# Employee Entity GraphQl Client.
configurable EmployeeServiceConfig employeeServiceConfigs = ?;

# Initialize Employee Service EndPoint.
#
# + return - Employee Service Client.
public isolated function initializeEmployeeServiceClient() returns graphql:Client|error {

    return check new (employeeServiceConfigs.apiEndpoint, {
        auth: {
            tokenUrl: employeeServiceConfigs.tokenUrl,
            clientId: employeeServiceConfigs.clientId,
            clientSecret: employeeServiceConfigs.clientSecret
        },
        retryConfig: {
            count: CONSTANT_RETRY_COUNT,
            interval: CONSTANT_RETRY_INTERVAL,
            backOffFactor: CONSTANT_RETRY_BACKOFF_FACTOR,
            maxWaitInterval: CONSTANT_RETRY_MAX_INTERVAL
        }
    });
}
