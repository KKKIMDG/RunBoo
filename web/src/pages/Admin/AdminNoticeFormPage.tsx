import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import Header from "../../components/header/Header";
import "./AdminNoticeFormPage.css";

const AdminNoticeFormPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchNotice();
    }
  }, [id]);

  const fetchNotice = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const notices = await adminApi.getAllNotices();
      const notice = notices.find((n) => n.id === Number(id));

      if (notice) {
        setFormData({
          title: notice.title,
          content: notice.content,
        });
      } else {
        alert("공지사항을 찾을 수 없습니다.");
        navigate("/admin/notices");
      }
    } catch (err) {
      alert("공지사항을 불러오는데 실패했습니다.");
      navigate("/admin/notices");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      alert("로그아웃되었습니다.");
      navigate("/admin/login");
    } catch (err) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isEditing && id) {
        // 수정
        await adminApi.updateNotice(Number(id), formData);
        alert("공지사항이 수정되었습니다.");
      } else {
        // 생성
        await adminApi.createNotice(formData);
        alert("공지사항이 생성되었습니다.");
      }

      navigate("/admin/notices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "작업에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    navigate("/admin/notices");
  };

  if (loading) {
    return (
      <div className="admin-notice-page">
        <Header />
        <div className="admin-content">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notice-page">
      <Header />

      <div className="admin-content">
        <div className="notice-form-section">
          <h2>{isEditing ? "공지사항 수정" : "새 공지사항 작성"}</h2>
          <form onSubmit={handleSubmit} className="notice-form">
            <div className="form-group">
              <label htmlFor="title">제목</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">내용</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="공지사항 내용을 입력하세요"
                rows={15}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {isEditing ? "수정하기" : "작성하기"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeFormPage;
