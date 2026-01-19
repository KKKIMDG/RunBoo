import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/app/layout/MainLayout";
import HomePage from "@/pages/Home/HomePage";
import NoticePage from "@/pages/Notice/NoticePage";
import NoticeDetailPage from "@/pages/Notice/NoticeDetailPage";
import AdminLoginPage from "@/pages/Admin/AdminLoginPage";
import AdminNoticeListPage from "@/pages/Admin/AdminNoticeListPage";
import AdminNoticeFormPage from "@/pages/Admin/AdminNoticeFormPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
    element: (
      <ProtectedRoute>
        <AdminNoticeListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/notices/create",
    element: (
      <ProtectedRoute>
        <AdminNoticeFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/notices/edit/:id",
    element: (
      <ProtectedRoute>
        <AdminNoticeFormPage />
      </ProtectedRoute>
    ),
  },
]);
