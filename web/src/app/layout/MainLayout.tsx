import Header from "@/components/header/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {/* 헤더 높이만큼 밀기 */}
            <main>{children}</main>
        </>
    );
}
