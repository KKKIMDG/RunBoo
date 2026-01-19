import React, { Component, ReactNode } from "react";
import ErrorFallback from "@/components/ui/ErrorFallback";

interface Props {
  children: ReactNode;
  /**
   * 에러 발생 시 표시할 메시지
   * @default "문제가 발생했어요"
   */
  fallbackMessage?: string;
  /**
   * 재시도 버튼 표시 여부
   * @default true
   */
  showRetryButton?: boolean;
  /**
   * 홈 버튼 표시 여부
   * @default true
   */
  showHomeButton?: boolean;
  /**
   * 에러 발생 시 실행할 콜백 (로깅 등)
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리
 *
 * React 컴포넌트 트리에서 발생하는 모든 에러를 잡아서
 * ErrorFallback UI를 표시합니다.
 *
 * @example
 * ```tsx
 * // App.tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // 커스텀 메시지와 함께
 * <ErrorBoundary
 *   fallbackMessage="앱에 문제가 발생했습니다"
 *   onError={(error, errorInfo) => {
 *     // 에러 로깅 서비스로 전송 (선택사항)
 *     // logErrorToService(error, errorInfo);
 *   }}
 * >
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 상태를 업데이트하여 fallback UI를 표시
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅을 여기서 수행할 수 있습니다
    // 예: 에러 추적 서비스로 전송

    // 사용자 정의 에러 핸들러 실행
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 개발 환경에서만 콘솔에 출력 (선택사항)
    if (__DEV__) {
      console.log("Error caught by ErrorBoundary:", error);
      console.log("Error Info:", errorInfo);
    }
  }

  handleRetry = () => {
    // 상태를 리셋하여 정상 UI를 다시 렌더링
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          message={this.props.fallbackMessage || "문제가 발생했어요"}
          onRetry={this.handleRetry}
          showRetryButton={this.props.showRetryButton ?? true}
          showHomeButton={this.props.showHomeButton ?? true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
