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

# Response interceptor to add security headers for the response.
public isolated service class ResponseInterceptor {
    *http:ResponseInterceptor;

    isolated remote function interceptResponse(http:RequestContext ctx, http:Response res)
        
        returns http:NextService|error? {

        res.setHeader("X-Frame-Options", "deny");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Permitted-Cross-Domain-Policies", "None");
        res.setHeader(
            "Content-Security-Policy",
            "upgrade-insecure-requests; frame-ancestors 'none'; default-src 'self'; child-src 'self' block-all-mixed-content;"
        );
        res.setHeader(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        );
        res.setHeader("Referrer-Policy", "strict-origin");
        res.setHeader(
            "Permissions-Policy",
            string `accelerometer=(), autoplay=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(self), usb=(), web-share=(), xr-spatial-tracking=()`
        );
        return ctx.next();
    }

}
