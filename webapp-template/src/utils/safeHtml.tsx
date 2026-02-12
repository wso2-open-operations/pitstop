// Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from "html-react-parser";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "span",
  "a",
]);

// Allowed CSS properties for inline styles
const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "backgroundColor",
  "font-weight",
  "fontWeight",
  "font-style",
  "fontStyle",
  "text-decoration",
  "textDecoration",
]);

// Sanitize inline style attribute
const sanitizeStyle = (styleString: string): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  if (!styleString || typeof styleString !== "string") return sanitized;

  // Parse CSS style string into key-value pairs
  const styles = styleString.split(";").filter(Boolean);

  for (const style of styles) {
    const [rawProp, rawValue] = style.split(":").map((s) => s.trim());
    if (!rawProp || !rawValue) continue;

    const prop = rawProp.toLowerCase();

    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;

    const lowerValue = rawValue.toLowerCase();
    if (
      lowerValue.includes("javascript:") ||
      lowerValue.includes("expression(") ||
      lowerValue.includes("url(") ||
      lowerValue.includes("@import")
    ) {
      continue;
    }

    const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    sanitized[camelProp] = rawValue;
  }

  return sanitized;
};

// Only allow safe URL protocols
const isSafeHref = (href: string) => {
  const value = href.trim().toLowerCase();

  // allow anchors + relative links
  if (value.startsWith("#") || value.startsWith("/")) return true;

  // allow http(s), mailto, tel
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  );
};

export const safeHtmlParserOptions: HTMLReactParserOptions = {
  replace: (node) => {
    // Only handle HTML tags
    if (node.type !== "tag") return;

    const el = node as Element;
    const tag = el.name?.toLowerCase();

    // Drop obviously dangerous tags entirely
    if (
      tag === "script" ||
      tag === "style" ||
      tag === "iframe" ||
      tag === "object" ||
      tag === "embed"
    ) {
      return <></>;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      return <>{domToReact(el.children as DOMNode[], safeHtmlParserOptions)}</>;
    }

    const props: Record<string, unknown> = {};

    // Handle inline styles for all allowed tags
    if (el.attribs?.style) {
      const sanitizedStyle = sanitizeStyle(el.attribs.style);
      if (Object.keys(sanitizedStyle).length > 0) {
        props.style = sanitizedStyle;
      }
    }

    if (tag === "a") {
      const href = el.attribs?.href;
      if (href && isSafeHref(href)) {
        props.href = href;
        props.target = "_blank";
        props.rel = "noopener noreferrer";
      } else {
        return (
          <>{domToReact(el.children as DOMNode[], safeHtmlParserOptions)}</>
        );
      }
    }

    return React.createElement(
      tag,
      props,
      domToReact(el.children as DOMNode[], safeHtmlParserOptions)
    );
  },
};

export const safeParseHtml = (html?: string) => {
  if (!html) return null;
  return parse(html, safeHtmlParserOptions);
};
