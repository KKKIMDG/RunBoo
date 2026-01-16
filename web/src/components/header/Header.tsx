import { useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 아래로 스크롤 → 숨김
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setHidden(true);
            }
            // 위로 스크롤 → 표시
            else {
                setHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`header ${hidden ? "header--hidden" : ""}`}>
            <div className="header-inner">
                <div className="logo">
                    <img src="/header-logo.png" alt="runboo" className="logo-icon" />
                </div>

                <nav className="nav">
                    <a href="/">서비스 소개</a>
                    <Link to="/notice">공지사항</Link>
                </nav>
            </div>
        </header>
    );
}
