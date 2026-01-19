import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasAlerted = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const isAuth = await adminApi.checkAuth();
      if (isMounted) {
        setIsAuthenticated(isAuth);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // 로딩 중
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          minHeight: "100vh",
          backgroundColor: "#050814",
          color: "#fff",
        }}
      >
        인증 확인 중...
      </div>
    );
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    if (!hasAlerted.current) {
      hasAlerted.current = true;
      setTimeout(() => {
        alert("로그인이 필요합니다.");
      }, 0);
    }
    return <Navigate to="/admin/login" replace />;
  }

  // 인증되었으면 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
