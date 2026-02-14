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

# [Configurable] HR entity configuration.
type EmployeeServiceConfig record {|
    # URL
    string apiEndpoint;
    # Token Endpoint
    string tokenUrl;
    # Client ID
    string clientId;
    # Client Secret
    string clientSecret;
|};

// Get employee graphQL service Responses.
# [HR Entity] Return record for single employee.
public type Employee record {|
    # First Name
    string firstName;
    # Last Name
    string lastName;
    # WSO2 Email
    string workEmail;
    # Employee Thumbnail URL
    string? employeeThumbnail = ();
    # Employee Department
    string department;
    # Employee Location
    string location;
    # Employee team
    string? team = ();
|};

# [HR Entity] Inner record for single employee.
type EmployeeData record {|
    # Employee Object
    Employee? employee = ();
|};

# [HR Entity] GraphQL return record for single employee.
type EmployeeResults record {|
    # Employee Data Object
    EmployeeData data;
|};

# List of employee statuses.
public enum EmployeeStatus {
    Active,
    Left,
    Marked\ leaver
}
