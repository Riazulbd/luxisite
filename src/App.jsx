import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AutomationPathsSite from "../automation-paths-final.jsx";

const BlogArchive = lazy(() => import("./components/blog/BlogArchive.jsx"));
const BlogSingle = lazy(() => import("./components/blog/BlogSingle.jsx"));
const CategoryArchive = lazy(() => import("./components/blog/CategoryArchive.jsx"));
const TagArchive = lazy(() => import("./components/blog/TagArchive.jsx"));
const BlogSearch = lazy(() => import("./components/blog/BlogSearch.jsx"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.jsx"));
const BlogDashboard = lazy(() => import("./components/admin/blog/BlogDashboard.jsx"));
const PostList = lazy(() => import("./components/admin/blog/PostList.jsx"));
const PostEditor = lazy(() => import("./components/admin/blog/PostEditor.jsx"));
const CategoryManager = lazy(() => import("./components/admin/blog/CategoryManager.jsx"));
const TagManager = lazy(() => import("./components/admin/blog/TagManager.jsx"));
const MediaLibrary = lazy(() => import("./components/admin/blog/MediaLibrary.jsx"));
const SeoSettings = lazy(() => import("./components/admin/blog/SeoSettings.jsx"));
const BlogAnalytics = lazy(() => import("./components/admin/blog/BlogAnalytics.jsx"));

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "Manrope, sans-serif",
        color: "#1A1A2E",
        background: "#FAFAF8"
      }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<AutomationPathsSite />} />
        <Route path="/blog" element={<BlogArchive />} />
        <Route path="/blog/search" element={<BlogSearch />} />
        <Route path="/blog/category/:slug" element={<CategoryArchive />} />
        <Route path="/blog/tag/:slug" element={<TagArchive />} />
        <Route path="/blog/:slug" element={<BlogSingle />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<BlogDashboard />} />
          <Route path="posts" element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="tags" element={<TagManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="seo-settings" element={<SeoSettings />} />
          <Route path="analytics" element={<BlogAnalytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
