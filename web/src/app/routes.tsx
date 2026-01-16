import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/app/layout/MainLayout";
import HomePage from "@/pages/Home/HomePage";
import NoticePage from "@/pages/Notice/NoticePage";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/notice", element: <NoticePage /> },
        ],
    },
]);
