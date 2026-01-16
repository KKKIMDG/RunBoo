import Header from "@/components/header/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
}
