import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HomePage from "@/pages/Home/HomePage";
import NoticePage from "@/pages/Notice/NoticePage.tsx";

export const router = createBrowserRouter([
    {
        element: <MainLayout children={undefined} />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/service", element: <NoticePage /> },
            { path: "/notice", element: <NoticePage /> },
        ],
    },
]);
