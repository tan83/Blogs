import { createHashRouter } from "react-router";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import BlogHome from "@/pages/BlogHome";
import PostDetail from "@/pages/PostDetail";
import About from "@/pages/About";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminEditor from "@/pages/AdminEditor";
import AdminSettings from "@/pages/AdminSettings";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: BlogHome },
      { path: "sobre-mi", Component: About },
      { path: "post/:slug", Component: PostDetail },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "posts", Component: AdminDashboard },
      { path: "posts/new", Component: AdminEditor },
      { path: "posts/:id/edit", Component: AdminEditor },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);
