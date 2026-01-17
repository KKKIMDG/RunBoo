import { useEffect, useState } from "react";
import "./Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");

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

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      alert("로그아웃되었습니다.");
      navigate("/admin/login");
    } catch (err) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <header className={`header ${hidden ? "header--hidden" : ""}`}>
      <div className="header-inner">
        {isAdminPage ? (
          <div className="logo">
            <img src="/ghost.png" alt="runboo" className="logo-icon" />
            <span className="logo-text">RunBoo</span>
          </div>
        ) : (
          <Link to="/" className="logo">
            <img src="/ghost.png" alt="runboo" className="logo-icon" />
            <span className="logo-text">RunBoo</span>
          </Link>
        )}

        <nav className="nav">
          {isAdminPage ? (
            <>
              <Link to="/admin/notices">공지사항 관리</Link>
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/">서비스 소개</a>
              <Link to="/notice">공지사항</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
