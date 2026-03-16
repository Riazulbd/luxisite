import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../hooks/useApi";
import { useViewport } from "../../hooks/useViewport";
import BlogCard from "./BlogCard";

export default function RelatedPosts({ postId }) {
  const { isMobile } = useViewport();
  const query = useQuery({
    queryKey: ["related-posts", postId],
    queryFn: () => apiFetch(`/api/posts/${postId}/related`),
    enabled: Boolean(postId)
  });

  if (!(query.data?.posts || []).length) {
    return null;
  }

  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontFamily: "Outfit, sans-serif", margin: "0 0 18px" }}>
        Related posts
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 180 : 220}px, 1fr))`,
          gap: 18
        }}
      >
        {query.data.posts.map((post) => (
          <BlogCard key={post.id} post={post} compact />
        ))}
      </div>
    </section>
  );
}

