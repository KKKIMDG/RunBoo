import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/app/layout/MainLayout";
import HomePage from "@/pages/Home/HomePage";
import NoticePage from "@/pages/Notice/NoticePage";
import NoticeDetailPage from "@/pages/Notice/NoticeDetailPage";
import AdminLoginPage from "@/pages/Admin/AdminLoginPage";
import AdminNoticeListPage from "@/pages/Admin/AdminNoticeListPage";
import AdminNoticeFormPage from "@/pages/Admin/AdminNoticeFormPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/notice", element: <NoticePage /> },
      { path: "/notice/:id", element: <NoticeDetailPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/notices",
    element: <AdminNoticeListPage />,
  },
  {
    path: "/admin/notices/create",
    element: <AdminNoticeFormPage />,
  },
  {
    path: "/admin/notices/edit/:id",
    element: <AdminNoticeFormPage />,
  },
]);
