import { getDb } from "../db/database.js";
import {
  countWords,
  getSettingsMap,
  normalizeKeywordList,
  parseBoolean,
  stripHtml
} from "../utils/blog.js";

const TRANSITION_WORDS = [
  "however",
  "furthermore",
  "additionally",
  "moreover",
  "therefore",
  "meanwhile",
  "instead",
  "also",
  "because",
  "finally",
  "first",
  "next",
  "then"
];

function lower(value = "") {
  return String(value || "").toLowerCase();
}

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractParagraphs(content = "") {
  const matches = Array.from(content.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi));
  if (!matches.length) {
    const plain = stripHtml(content);
    return plain ? [plain] : [];
  }
  return matches.map((match) => stripHtml(match[1])).filter(Boolean);
}

function extractHeadings(content = "") {
  return Array.from(content.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)).map(
    (match) => ({
      level: match[1].toLowerCase(),
      text: stripHtml(match[2])
    })
  );
}

function extractImages(content = "") {
  return Array.from(content.matchAll(/<img\b[^>]*>/gi)).map((match) => {
    const node = match[0];
    const altMatch = node.match(/\balt=(?:"([^"]*)"|'([^']*)')/i);
    const srcMatch = node.match(/\bsrc=(?:"([^"]*)"|'([^']*)')/i);
    return {
      alt: altMatch?.[1] || altMatch?.[2] || "",
      src: srcMatch?.[1] || srcMatch?.[2] || ""
    };
  });
}

function extractLinks(content = "") {
  return Array.from(content.matchAll(/<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)).map(
    (match) => match[1] || match[2] || ""
  );
}

function splitSentences(text = "") {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function countSyllables(word = "") {
  const normalized = lower(word).replace(/[^a-z]/g, "");
  if (!normalized) {
    return 0;
  }

  const stripped = normalized.replace(/e\b/g, "");
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFromScore(score) {
  if (score >= 90) {
    return "pass";
  }
  if (score >= 50) {
    return "warning";
  }
  return "fail";
}

function keywordCount(text, keyword) {
  if (!keyword) {
    return 0;
  }

  const matches = lower(text).match(
    new RegExp(`\\b${escapeRegExp(lower(keyword))}\\b`, "g")
  );
  return matches?.length || 0;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getNumberSetting(settings, key, fallback) {
  const parsed = Number(settings[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasRepeatedSentenceStarts(sentences, maxRepeatedStarts = 2) {
  let streak = 1;
  let previous = "";

  for (const sentence of sentences) {
    const start = lower(sentence).match(/[a-z0-9]+/)?.[0] || "";
    if (!start) {
      continue;
    }

    if (start === previous) {
      streak += 1;
      if (streak > maxRepeatedStarts) {
        return true;
      }
    } else {
      streak = 1;
      previous = start;
    }
  }

  return false;
}

function hasLongSentenceStreak(
  sentenceWordCounts,
  longSentenceWordCount = 25,
  maxConsecutiveLongSentences = 2
) {
  let streak = 0;

  for (const count of sentenceWordCounts) {
    if (count > longSentenceWordCount) {
      streak += 1;
      if (streak > maxConsecutiveLongSentences) {
        return true;
      }
    } else {
      streak = 0;
    }
  }

  return false;
}

function fleschReadingEase(wordCount, sentenceCount, syllableCount) {
  if (!wordCount || !sentenceCount) {
    return 0;
  }

  return (
    206.835 -
    1.015 * (wordCount / sentenceCount) -
    84.6 * (syllableCount / wordCount)
  );
}

function makeCheck({
  id,
  name,
  weight,
  score,
  passMessage,
  warningMessage,
  failMessage,
  fix
}) {
  const normalizedScore = clampScore(score);
  const status = statusFromScore(normalizedScore);

  return {
    id,
    name,
    weight,
    score: normalizedScore,
    status,
    message:
      status === "pass"
        ? passMessage
        : status === "warning"
          ? warningMessage || failMessage
          : failMessage,
    fix: status === "pass" ? undefined : fix
  };
}

function weightedAverage(checks) {
  if (!checks.length) {
    return 0;
  }

  const weightTotal = checks.reduce((sum, check) => sum + check.weight, 0);
  const scoreTotal = checks.reduce(
    (sum, check) => sum + check.score * check.weight,
    0
  );
  return scoreTotal / weightTotal;
}

export function analyzeSeo(input = {}) {
  const db = getDb();
  const settings = getSettingsMap(db);

  const title = input.title || "";
  const content = input.content || "";
  const contentRaw = input.contentRaw || stripHtml(content);
  const slug = input.slug || "";
  const focusKeyword = (input.focusKeyword || "").trim();
  const secondaryKeywords = normalizeKeywordList(input.secondaryKeywords);
  const metaTitle = input.metaTitle || "";
  const metaDescription = input.metaDescription || "";
  const ogTitle = input.ogTitle || "";
  const ogDescription = input.ogDescription || "";
  const ogImage = input.ogImage || "";
  const twitterTitle = input.twitterTitle || "";
  const twitterDescription = input.twitterDescription || "";
  const twitterImage = input.twitterImage || "";
  const featuredImage = input.featuredImage || "";
  const featuredImageAlt = input.featuredImageAlt || "";
  const excerpt = input.excerpt || "";
  const schemaJson = input.schemaJson || "";
  const canonicalUrl = input.canonicalUrl || "";

  const paragraphs = extractParagraphs(content);
  const headings = extractHeadings(content);
  const h2Headings = headings.filter((heading) => heading.level === "h2");
  const h3Headings = headings.filter((heading) => heading.level === "h3");
  const headingText = headings.map((heading) => heading.text).join(" ");
  const images = extractImages(content);
  const links = extractLinks(content);
  const words = contentRaw.split(/\s+/).filter(Boolean);
  const sentences = splitSentences(contentRaw);
  const sentenceWordCounts = sentences.map((sentence) => countWords(sentence));
  const paragraphWordCounts = paragraphs.map((paragraph) => countWords(paragraph));
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const readingEase = fleschReadingEase(
    words.length,
    sentences.length || 1,
    syllableCount || 1
  );
  const averageSentenceLength = average(sentenceWordCounts);
  const firstHundredWords = words.slice(0, 100).join(" ");
  const keywordHits = keywordCount(contentRaw, focusKeyword);
  const keywordDensity = focusKeyword && words.length
    ? (keywordHits / words.length) * 100
    : 0;
  const passiveVoiceCount = sentences.filter((sentence) =>
    /\b(am|is|are|was|were|be|been|being)\s+\w+(ed|en)\b/i.test(sentence)
  ).length;
  const passiveVoicePercentage = sentences.length
    ? (passiveVoiceCount / sentences.length) * 100
    : 0;
  const internalLinkCount = links.filter(
    (href) =>
      href.startsWith("/") ||
      href.startsWith("#") ||
      href.startsWith(process.env.SITE_URL || "https://automationpaths.com")
  ).length;
  const externalLinkCount = links.filter(
    (href) =>
      /^https?:\/\//i.test(href) &&
      !href.startsWith(process.env.SITE_URL || "https://automationpaths.com")
  ).length;
  const transitionWordCount = TRANSITION_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(contentRaw)
  ).length;
  const secondaryKeywordHits = secondaryKeywords.filter(
    (keyword) => keywordCount(contentRaw, keyword) > 0
  );

  const keyword = {
    density: Number(keywordDensity.toFixed(2)),
    inTitle: keywordCount(title, focusKeyword) > 0,
    inFirstParagraph: keywordCount(firstHundredWords, focusKeyword) > 0,
    inHeadings: keywordCount(headingText, focusKeyword) > 0,
    inMetaTitle: keywordCount(metaTitle, focusKeyword) > 0,
    inMetaDescription: keywordCount(metaDescription, focusKeyword) > 0,
    inSlug: keywordCount(slug.replace(/-/g, " "), focusKeyword) > 0,
    inImageAlt:
      keywordCount(featuredImageAlt, focusKeyword) > 0 ||
      images.some((image) => keywordCount(image.alt, focusKeyword) > 0),
    count: keywordHits
  };

  const meta = {
    titleLength: metaTitle.length,
    descriptionLength: metaDescription.length,
    slugLength: slug.length,
    hasCanonical: Boolean(canonicalUrl),
    hasOgTags: Boolean((ogTitle || metaTitle) && (ogDescription || metaDescription) && ogImage),
    hasTwitterCards: Boolean(
      (twitterTitle || ogTitle || metaTitle) &&
        (twitterDescription || ogDescription || metaDescription) &&
        twitterImage
    ),
    hasSchema: Boolean(schemaJson)
  };

  const contentMetrics = {
    wordCount: words.length,
    headingCount: headings.length,
    paragraphCount: paragraphs.length,
    imageCount: images.length + (featuredImage ? 1 : 0),
    internalLinkCount,
    externalLinkCount,
    averageSentenceLength: Number(averageSentenceLength.toFixed(2))
  };

  const minWordCount = getNumberSetting(settings, "min_word_count", 300);
  const minWordCountWarningRatio = getNumberSetting(
    settings,
    "min_word_count_warning_ratio",
    0.7
  );
  const keywordDensityMin = getNumberSetting(settings, "keyword_density_min", 0.5);
  const keywordDensityMax = getNumberSetting(settings, "keyword_density_max", 2.5);
  const keywordDensityWarningMin = getNumberSetting(
    settings,
    "keyword_density_warning_min",
    0.25
  );
  const keywordDensityWarningMax = getNumberSetting(
    settings,
    "keyword_density_warning_max",
    3.5
  );
  const minHeadings = getNumberSetting(settings, "min_headings", 3);
  const minInternalLinks = getNumberSetting(settings, "min_internal_links", 2);
  const minExternalLinks = getNumberSetting(settings, "min_external_links", 1);
  const minImages = getNumberSetting(settings, "min_images", 1);
  const imageAltRequired = parseBoolean(settings.image_alt_required || "true");
  const paragraphMaxWords = getNumberSetting(settings, "paragraph_max_words", 150);
  const paragraphWarningWords = getNumberSetting(settings, "paragraph_warning_words", 200);
  const avgSentenceMaxWords = getNumberSetting(settings, "avg_sentence_max_words", 20);
  const avgSentenceWarningWords = getNumberSetting(
    settings,
    "avg_sentence_warning_words",
    24
  );
  const transitionWordsMin = getNumberSetting(settings, "transition_words_min", 3);
  const longSentenceWordCount = getNumberSetting(settings, "long_sentence_word_count", 25);
  const maxConsecutiveLongSentences = getNumberSetting(
    settings,
    "max_consecutive_long_sentences",
    2
  );
  const metaTitleMinLength = getNumberSetting(settings, "meta_title_min_length", 30);
  const metaTitleMaxLength = getNumberSetting(settings, "meta_title_max_length", 60);
  const metaTitleWarningMinLength = getNumberSetting(
    settings,
    "meta_title_warning_min_length",
    25
  );
  const metaTitleWarningMaxLength = getNumberSetting(
    settings,
    "meta_title_warning_max_length",
    65
  );
  const metaDescMinLength = getNumberSetting(settings, "meta_desc_min_length", 120);
  const metaDescMaxLength = getNumberSetting(settings, "meta_desc_max_length", 160);
  const metaDescWarningMinLength = getNumberSetting(
    settings,
    "meta_desc_warning_min_length",
    100
  );
  const metaDescWarningMaxLength = getNumberSetting(
    settings,
    "meta_desc_warning_max_length",
    170
  );
  const slugMaxLength = getNumberSetting(settings, "slug_max_length", 75);
  const passiveVoiceMaxPercent = getNumberSetting(
    settings,
    "passive_voice_max_percent",
    10
  );
  const passiveVoiceWarningPercent = getNumberSetting(
    settings,
    "passive_voice_warning_percent",
    20
  );
  const fleschGoodMin = getNumberSetting(settings, "flesch_good_min", 60);
  const fleschWarningMin = getNumberSetting(settings, "flesch_warning_min", 45);
  const sentenceStartRepetitionMax = getNumberSetting(
    settings,
    "sentence_start_repetition_max",
    2
  );

  const checks = [
    makeCheck({
      id: "keyword_in_seo_title",
      name: "Focus keyword in SEO title",
      weight: 9,
      score: keyword.inMetaTitle ? 100 : focusKeyword ? 0 : 40,
      passMessage: "The SEO title includes the focus keyword.",
      failMessage: "The SEO title is missing the focus keyword.",
      fix: "Add the focus keyword near the beginning of the SEO title."
    }),
    makeCheck({
      id: "keyword_in_meta_description",
      name: "Focus keyword in meta description",
      weight: 8,
      score: keyword.inMetaDescription ? 100 : focusKeyword ? 0 : 40,
      passMessage: "The meta description includes the focus keyword.",
      failMessage: "The meta description is missing the focus keyword.",
      fix: "Add the focus keyword to the meta description."
    }),
    makeCheck({
      id: "keyword_in_h1",
      name: "Focus keyword in H1/title",
      weight: 9,
      score: keyword.inTitle ? 100 : focusKeyword ? 0 : 40,
      passMessage: "The title includes the focus keyword.",
      failMessage: "The title does not include the focus keyword.",
      fix: "Add the focus keyword to the main title."
    }),
    makeCheck({
      id: "keyword_in_first_paragraph",
      name: "Focus keyword in first 100 words",
      weight: 7,
      score: keyword.inFirstParagraph ? 100 : focusKeyword ? 0 : 40,
      passMessage: "The focus keyword appears early in the content.",
      failMessage: "The focus keyword is missing from the first paragraph.",
      fix: "Use the focus keyword naturally in the opening paragraph."
    }),
    makeCheck({
      id: "keyword_in_slug",
      name: "Focus keyword in slug",
      weight: 7,
      score: keyword.inSlug ? 100 : focusKeyword ? 0 : 40,
      passMessage: "The slug includes the focus keyword.",
      failMessage: "The slug is missing the focus keyword.",
      fix: "Adjust the slug to include the focus keyword."
    }),
    makeCheck({
      id: "keyword_in_h2",
      name: "Focus keyword in H2",
      weight: 6,
      score:
        h2Headings.some((heading) => keywordCount(heading.text, focusKeyword) > 0)
          ? 100
          : focusKeyword
            ? 0
            : 40,
      passMessage: "An H2 heading uses the focus keyword.",
      failMessage: "No H2 heading includes the focus keyword.",
      fix: "Add the focus keyword to a natural H2 heading."
    }),
    makeCheck({
      id: "keyword_in_image_alt",
      name: "Focus keyword in image alt text",
      weight: 5,
      score: keyword.inImageAlt ? 100 : contentMetrics.imageCount ? 25 : 60,
      passMessage: "An image alt text uses the focus keyword.",
      warningMessage: "Images exist, but alt text does not yet use the focus keyword.",
      failMessage: "Add the focus keyword to a relevant image alt text.",
      fix: "Update an image alt text to include the focus keyword."
    }),
    makeCheck({
      id: "keyword_density_range",
      name: "Keyword density between min and max",
      weight: 8,
      score:
        !focusKeyword || !words.length
          ? 40
          : keywordDensity >= keywordDensityMin && keywordDensity <= keywordDensityMax
            ? 100
            : keywordDensity >= keywordDensityWarningMin &&
                keywordDensity <= keywordDensityWarningMax
              ? 55
              : 0,
      passMessage: "Keyword density is within the target range.",
      warningMessage: "Keyword density is close but not ideal.",
      failMessage: "Keyword density is outside the target range.",
      fix: `Aim for ${keywordDensityMin}% to ${keywordDensityMax}% keyword density.`
    }),
    makeCheck({
      id: "keyword_not_stuffed",
      name: "Focus keyword not overused",
      weight: 7,
      score:
        !focusKeyword
          ? 40
          : keywordDensity <= keywordDensityMax
            ? 100
            : keywordDensity <= keywordDensityWarningMax
              ? 50
              : 0,
      passMessage: "Keyword usage looks natural.",
      warningMessage: "Keyword usage may be slightly heavy.",
      failMessage: "Keyword usage looks over-optimized.",
      fix: "Replace repeated keyword usage with natural variations."
    }),
    makeCheck({
      id: "secondary_keywords_present",
      name: "Secondary keywords present",
      weight: 4,
      score:
        !secondaryKeywords.length
          ? 45
          : secondaryKeywordHits.length === secondaryKeywords.length
            ? 100
            : secondaryKeywordHits.length
              ? 60
              : 0,
      passMessage: "Secondary keywords appear in the content.",
      warningMessage: "Only some secondary keywords appear in the content.",
      failMessage: "Add more secondary keywords to the article.",
      fix: "Use more secondary keywords where they fit naturally."
    }),
    makeCheck({
      id: "min_word_count",
      name: "Word count meets minimum",
      weight: 7,
      score:
        words.length >= minWordCount
          ? 100
          : words.length >= Math.round(minWordCount * minWordCountWarningRatio)
            ? 60
            : 0,
      passMessage: "The article meets the recommended minimum length.",
      warningMessage: "The article is close to the target word count.",
      failMessage: "The article is too short for the target SEO depth.",
      fix: `Expand the article to at least ${minWordCount} words.`
    }),
    makeCheck({
      id: "has_h2_h3",
      name: "Has H2 and H3 subheadings",
      weight: 6,
      score:
        h2Headings.length && h3Headings.length
          ? 100
          : h2Headings.length || h3Headings.length
            ? 55
            : 0,
      passMessage: "The article has both H2 and H3 headings.",
      warningMessage: "The article has some heading structure, but it needs more depth.",
      failMessage: "Add both H2 and H3 headings to improve structure.",
      fix: "Add H2 sections and supporting H3 subheadings."
    }),
    makeCheck({
      id: "heading_count",
      name: "Minimum heading count",
      weight: 5,
      score:
        headings.length >= minHeadings
          ? 100
          : headings.length > 0
            ? Math.round((headings.length / minHeadings) * 100)
            : 0,
      passMessage: "The article has enough headings.",
      warningMessage: "A few more headings would improve scanability.",
      failMessage: "The article needs more headings.",
      fix: `Add at least ${minHeadings} H2 or H3 headings.`
    }),
    makeCheck({
      id: "paragraph_length",
      name: "Paragraphs are not too long",
      weight: 4,
      score:
        paragraphWordCounts.every((count) => count <= paragraphMaxWords)
          ? 100
          : paragraphWordCounts.some((count) => count > paragraphWarningWords)
            ? 0
            : 60,
      passMessage: "Paragraph lengths are reader-friendly.",
      warningMessage: "Some paragraphs are getting long.",
      failMessage: "Break up long paragraphs for readability.",
      fix: `Keep paragraphs under ${paragraphMaxWords} words when possible.`
    }),
    makeCheck({
      id: "sentence_length",
      name: "Average sentence length under target",
      weight: 5,
      score:
        averageSentenceLength < avgSentenceMaxWords
          ? 100
          : averageSentenceLength < avgSentenceWarningWords
            ? 60
            : 0,
      passMessage: "Average sentence length is in a healthy range.",
      warningMessage: "Some sentences are a bit long.",
      failMessage: "Average sentence length is too high.",
      fix: `Keep average sentence length under ${avgSentenceMaxWords} words.`
    }),
    makeCheck({
      id: "transition_words",
      name: "Uses transition words",
      weight: 3,
      score:
        transitionWordCount >= transitionWordsMin ? 100 : transitionWordCount > 0 ? 60 : 0,
      passMessage: "Transition words support the article flow.",
      warningMessage: "A few more transition words would improve flow.",
      failMessage: "Add more transition words between ideas.",
      fix: `Use at least ${transitionWordsMin} transition words across the article.`
    }),
    makeCheck({
      id: "has_images",
      name: "Has at least one image",
      weight: 5,
      score:
        contentMetrics.imageCount >= minImages
          ? 100
          : contentMetrics.imageCount > 0
            ? 60
            : 0,
      passMessage: "The article includes helpful imagery.",
      warningMessage: "One more image would strengthen the article.",
      failMessage: "Add at least one relevant image.",
      fix: `Add at least ${minImages} image${minImages > 1 ? "s" : ""}.`
    }),
    makeCheck({
      id: "image_alt_text",
      name: "All images have alt text",
      weight: 6,
      score:
        !imageAltRequired
          ? 100
          : (!contentMetrics.imageCount || images.every((image) => image.alt.trim())) &&
              (!featuredImage || featuredImageAlt)
            ? 100
            : 0,
      passMessage: "All images have alt text.",
      warningMessage: "There are no images to evaluate yet.",
      failMessage: "Some images are missing alt text.",
      fix: "Add descriptive alt text to every image."
    }),
    makeCheck({
      id: "internal_links",
      name: "Has internal links",
      weight: 6,
      score:
        internalLinkCount >= minInternalLinks
          ? 100
          : internalLinkCount > 0
            ? Math.round((internalLinkCount / minInternalLinks) * 100)
            : 0,
      passMessage: "The article includes enough internal links.",
      warningMessage: "Add another internal link to strengthen relevance.",
      failMessage: "The article needs more internal links.",
      fix: `Add at least ${minInternalLinks} internal links to other site pages.`
    }),
    makeCheck({
      id: "external_links",
      name: "Has external links",
      weight: 4,
      score:
        externalLinkCount >= minExternalLinks
          ? 100
          : externalLinkCount > 0
            ? 60
            : 0,
      passMessage: "The article includes credible external references.",
      warningMessage: "One more external reference would help.",
      failMessage: "The article needs an external supporting link.",
      fix: `Add at least ${minExternalLinks} trusted external source link.`
    }),
    makeCheck({
      id: "long_sentence_streak",
      name: "No consecutive long sentences",
      weight: 3,
      score:
        hasLongSentenceStreak(
          sentenceWordCounts,
          longSentenceWordCount,
          maxConsecutiveLongSentences
        )
          ? 0
          : 100,
      passMessage: "The article avoids streaks of long sentences.",
      failMessage: "Several long sentences appear back-to-back.",
      fix: `Avoid more than ${maxConsecutiveLongSentences} consecutive sentences over ${longSentenceWordCount} words.`
    }),
    makeCheck({
      id: "meta_title_length",
      name: "Meta title length is in range",
      weight: 8,
      score:
        metaTitle.length >= metaTitleMinLength && metaTitle.length <= metaTitleMaxLength
          ? 100
          : metaTitle.length >= metaTitleWarningMinLength &&
              metaTitle.length <= metaTitleWarningMaxLength
            ? 60
            : 0,
      passMessage: "Meta title length is in the ideal range.",
      warningMessage: "Meta title length is close to ideal.",
      failMessage: "Meta title length needs adjustment.",
      fix: `Keep the meta title between ${metaTitleMinLength} and ${metaTitleMaxLength} characters.`
    }),
    makeCheck({
      id: "meta_description_length",
      name: "Meta description length is in range",
      weight: 8,
      score:
        metaDescription.length >= metaDescMinLength &&
          metaDescription.length <= metaDescMaxLength
          ? 100
          : metaDescription.length >= metaDescWarningMinLength &&
              metaDescription.length <= metaDescWarningMaxLength
            ? 60
            : 0,
      passMessage: "Meta description length is in the ideal range.",
      warningMessage: "Meta description length is close to ideal.",
      failMessage: "Meta description length needs adjustment.",
      fix: `Keep the meta description between ${metaDescMinLength} and ${metaDescMaxLength} characters.`
    }),
    makeCheck({
      id: "slug_quality",
      name: "Slug is concise",
      weight: 6,
      score:
        slug.length > 0 && slug.length < slugMaxLength && keyword.inSlug
          ? 100
          : slug.length > 0 && slug.length < slugMaxLength
            ? 60
            : 0,
      passMessage: "The slug is concise and on-topic.",
      warningMessage: "The slug is concise but could align more closely with the keyword.",
      failMessage: "The slug is too long or unfocused.",
      fix: `Use a short slug under ${slugMaxLength} characters that includes the focus keyword.`
    }),
    makeCheck({
      id: "has_canonical",
      name: "Has canonical URL",
      weight: 5,
      score: meta.hasCanonical ? 100 : 0,
      passMessage: "A canonical URL is available.",
      failMessage: "No canonical URL is set.",
      fix: "Set the canonical URL for this post."
    }),
    makeCheck({
      id: "has_og_tags",
      name: "Has Open Graph tags",
      weight: 5,
      score: meta.hasOgTags ? 100 : 0,
      passMessage: "Open Graph metadata is present.",
      failMessage: "Open Graph metadata is incomplete.",
      fix: "Add Open Graph title, description, and image."
    }),
    makeCheck({
      id: "has_twitter_cards",
      name: "Has Twitter Card tags",
      weight: 4,
      score: meta.hasTwitterCards ? 100 : 0,
      passMessage: "Twitter card metadata is present.",
      failMessage: "Twitter card metadata is incomplete.",
      fix: "Add Twitter title, description, and image metadata."
    }),
    makeCheck({
      id: "has_schema",
      name: "Has JSON-LD schema markup",
      weight: 7,
      score: meta.hasSchema ? 100 : 0,
      passMessage: "Structured data is present.",
      failMessage: "Structured data is missing.",
      fix: "Generate or paste JSON-LD schema for this post."
    }),
    makeCheck({
      id: "featured_image",
      name: "Featured image is set",
      weight: 6,
      score: featuredImage ? 100 : 0,
      passMessage: "A featured image is set.",
      failMessage: "No featured image is assigned.",
      fix: "Upload and assign a featured image."
    }),
    makeCheck({
      id: "excerpt_set",
      name: "Excerpt is set",
      weight: 4,
      score: excerpt ? 100 : 0,
      passMessage: "An excerpt is set for this post.",
      failMessage: "The post needs an excerpt.",
      fix: "Write or generate an excerpt."
    }),
    makeCheck({
      id: "flesch_readability",
      name: "Flesch reading ease",
      weight: 5,
      score:
        readingEase >= fleschGoodMin
          ? 100
          : readingEase >= fleschWarningMin
            ? 60
            : 0,
      passMessage: "Readability is strong.",
      warningMessage: "Readability is acceptable but could improve.",
      failMessage: "Readability is too difficult for most readers.",
      fix: "Use shorter sentences and simpler phrasing."
    }),
    makeCheck({
      id: "passive_voice",
      name: "Passive voice under target",
      weight: 4,
      score:
        passiveVoicePercentage < passiveVoiceMaxPercent
          ? 100
          : passiveVoicePercentage < passiveVoiceWarningPercent
            ? 60
            : 0,
      passMessage: "Passive voice stays within the target range.",
      warningMessage: "Passive voice is slightly high.",
      failMessage: "Passive voice is too frequent.",
      fix: `Keep passive voice under ${passiveVoiceMaxPercent}% of sentences.`
    }),
    makeCheck({
      id: "sentence_start_variety",
      name: "Sentence start variety",
      weight: 3,
      score:
        hasRepeatedSentenceStarts(sentences, sentenceStartRepetitionMax)
          ? 0
          : 100,
      passMessage: "Sentence openings feel varied.",
      failMessage: "Several sentences start with the same word in a row.",
      fix: "Vary sentence openings to improve rhythm."
    })
  ];

  const overallScore = weightedAverage(checks);
  const readabilityScore = weightedAverage(
    checks.filter((check) =>
      [
        "paragraph_length",
        "sentence_length",
        "transition_words",
        "long_sentence_streak",
        "flesch_readability",
        "passive_voice",
        "sentence_start_variety"
      ].includes(check.id)
    )
  );
  const technicalSeoScore = weightedAverage(
    checks.filter((check) =>
      [
        "meta_title_length",
        "meta_description_length",
        "slug_quality",
        "has_canonical",
        "has_og_tags",
        "has_twitter_cards",
        "has_schema",
        "featured_image",
        "excerpt_set"
      ].includes(check.id)
    )
  );

  return {
    overallScore: clampScore(overallScore),
    readabilityScore: clampScore(readabilityScore),
    technicalSeoScore: clampScore(technicalSeoScore),
    checks,
    suggestions: checks
      .filter((check) => check.status !== "pass" && check.fix)
      .map((check) => check.fix),
    keyword,
    content: contentMetrics,
    meta
  };
}
