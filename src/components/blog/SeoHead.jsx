import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://automationpaths.com";

function toAbsoluteUrl(value = "") {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${SITE_URL}${String(value).startsWith("/") ? value : `/${value}`}`;
}

export default function SeoHead({
  title,
  description,
  canonical,
  keywords = [],
  og = {},
  twitter = {},
  children
}) {
  const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(", ") : keywords;
  const canonicalUrl = toAbsoluteUrl(canonical);
  const ogUrl = toAbsoluteUrl(og.url);
  const ogImage = toAbsoluteUrl(og.image);
  const twitterImage = toAbsoluteUrl(twitter.image);

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywordContent ? <meta name="keywords" content={keywordContent} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta property="og:type" content={og.type || "website"} />
      {og.title ? <meta property="og:title" content={og.title} /> : null}
      {og.description ? <meta property="og:description" content={og.description} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
      {og.publishedTime ? (
        <meta property="article:published_time" content={og.publishedTime} />
      ) : null}
      {og.modifiedTime ? (
        <meta property="article:modified_time" content={og.modifiedTime} />
      ) : null}
      {og.section ? <meta property="article:section" content={og.section} /> : null}
      {Array.isArray(og.tags)
        ? og.tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)
        : null}
      <meta name="twitter:card" content={twitter.card || "summary_large_image"} />
      {twitter.title ? <meta name="twitter:title" content={twitter.title} /> : null}
      {twitter.description ? (
        <meta name="twitter:description" content={twitter.description} />
      ) : null}
      {twitterImage ? <meta name="twitter:image" content={twitterImage} /> : null}
      {children}
    </Helmet>
  );
}
