import React from "react";
import { Helmet } from "react-helmet-async";

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

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywordContent ? <meta name="keywords" content={keywordContent} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content={og.type || "website"} />
      {og.title ? <meta property="og:title" content={og.title} /> : null}
      {og.description ? <meta property="og:description" content={og.description} /> : null}
      {og.image ? <meta property="og:image" content={og.image} /> : null}
      {og.url ? <meta property="og:url" content={og.url} /> : null}
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
      {twitter.image ? <meta name="twitter:image" content={twitter.image} /> : null}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css"
      />
      {children}
    </Helmet>
  );
}
