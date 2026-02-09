// Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.   
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
            "HTTP-Strict-Transport-Security",
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
