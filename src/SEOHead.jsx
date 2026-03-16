import { useEffect } from "react";

const PRIMARY_ORIGIN = "https://automationpaths.com";

const normalizePath = (value = "/") => {
  const [pathWithoutHash] = value.split("#");
  const [pathname] = pathWithoutHash.split("?");

  if (!pathname || pathname === "/") {
    return "/";
  }

  const trimmedPath = pathname.replace(/\/+$/, "");
  return trimmedPath || "/";
};

const buildCanonicalUrl = (pathname) =>
  pathname === "/" ? PRIMARY_ORIGIN : `${PRIMARY_ORIGIN}${pathname}`;

const upsertMetaTag = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
  return element;
};

const upsertLinkTag = (selector, attributes, href) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
  return element;
};

const upsertStructuredData = (schemas) => {
  const managedNodes = Array.from(
    document.head.querySelectorAll('script[data-seo-schema="automation-paths"]')
  );

  schemas.forEach((item, index) => {
    let element = managedNodes[index];

    if (!element) {
      element = document.createElement("script");
      element.setAttribute("type", "application/ld+json");
      element.setAttribute("data-seo-schema", "automation-paths");
      document.head.appendChild(element);
    }

    element.textContent = JSON.stringify(item);
  });

  managedNodes.slice(schemas.length).forEach((node) => node.remove());
};

export default function SEOHead({
  title,
  description,
  path,
  noindex = false,
  publicPaths = ["/"],
  schema = [],
}) {
  const schemaItems = Array.isArray(schema) ? schema : [schema];
  const publicPathKey = publicPaths.join("|");
  const schemaKey = JSON.stringify(schemaItems);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const allowedPaths = new Set(publicPaths.map((item) => normalizePath(item)));
    const currentPath = normalizePath(path ?? window.location.pathname);
    const isPublicPath = allowedPaths.has(currentPath);
    const shouldNoindex = noindex || !isPublicPath;
    const canonicalPath = isPublicPath ? currentPath : "/";
    const canonicalUrl = buildCanonicalUrl(canonicalPath);

    document.title = title;

    upsertMetaTag('meta[name="description"]', { name: "description" }, description);
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMetaTag(
      'meta[property="og:description"]',
      { property: "og:description" },
      description
    );
    upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, "website");
    upsertMetaTag(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image"
    );
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    upsertMetaTag(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      description
    );
    upsertLinkTag('link[rel="canonical"]', { rel: "canonical" }, canonicalUrl);

    const robotsTag = document.head.querySelector('meta[name="robots"]');
    if (shouldNoindex) {
      upsertMetaTag(
        'meta[name="robots"]',
        { name: "robots" },
        "noindex, nofollow"
      );
    } else if (robotsTag) {
      robotsTag.remove();
    }

    if (shouldNoindex) {
      upsertStructuredData([]);
    } else {
      upsertStructuredData(schemaItems);
    }

    return undefined;
  }, [description, noindex, path, publicPathKey, schemaKey, title]);

  return null;
}
