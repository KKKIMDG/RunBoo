/**
 * 성능 측정 유틸리티
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: {
    arrayLength?: number;
    estimatedSize?: number;
  };
}

class PerformanceLogger {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__; // 개발 모드에서만 활성화

  /**
   * 작업 시작 시간 기록
   */
  start(name: string, metadata?: any) {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
    };

    this.metrics.set(name, metric);
    console.log(`⏱️ [성능] ${name} 시작`, metadata || "");
  }

  /**
   * 작업 종료 시간 기록 및 소요 시간 출력
   */
  end(name: string, metadata?: any) {
    if (!this.enabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ [성능] ${name} - start()가 호출되지 않음`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    const duration = metric.duration.toFixed(2);
    const emoji =
      metric.duration > 1000 ? "🐌" : metric.duration > 500 ? "⚠️" : "✅";

    console.log(`${emoji} [성능] ${name} 완료: ${duration}ms`, metadata || "");

    this.metrics.delete(name);
  }

  /**
   * 메모리 사용량 기록 (배열 크기 추적)
   */
  logMemory(name: string, arrayLength: number, itemSizeEstimate: number = 100) {
    if (!this.enabled) return;

    const estimatedSize = (arrayLength * itemSizeEstimate) / 1024; // KB
    const emoji =
      estimatedSize > 1024 ? "🔴" : estimatedSize > 512 ? "🟡" : "🟢";

    console.log(
      `${emoji} [메모리] ${name}: ${arrayLength}개 항목, 약 ${estimatedSize.toFixed(2)}KB`,
    );
  }

  /**
   * 배열 크기 변화 추적
   */
  trackArrayGrowth(
    name: string,
    currentLength: number,
    threshold: number = 1000,
  ) {
    if (!this.enabled) return;

    if (currentLength % 100 === 0) {
      // 100개마다 로그
      const emoji =
        currentLength > threshold
          ? "🔴"
          : currentLength > threshold / 2
            ? "🟡"
            : "🟢";
      console.log(`${emoji} [배열] ${name}: ${currentLength}개`);
    }

    if (currentLength > threshold) {
      console.warn(
        `⚠️ [배열] ${name}이 임계값(${threshold})을 초과했습니다: ${currentLength}개`,
      );
    }
  }

  /**
   * 함수 실행 시간 측정 래퍼
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: true });
      throw error;
    }
  }

  /**
   * 동기 함수 실행 시간 측정 래퍼
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();

    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: true });
      throw error;
    }
  }

  /**
   * 성능 요약 출력
   */
  summary() {
    if (!this.enabled) return;

    console.log("📊 [성능 요약] 실행 중인 작업:", this.metrics.size);
    this.metrics.forEach((metric, name) => {
      const elapsed = performance.now() - metric.startTime;
      console.log(`  - ${name}: ${elapsed.toFixed(2)}ms 경과 (종료되지 않음)`);
    });
  }

  /**
   * 모든 메트릭 초기화
   */
  clear() {
    this.metrics.clear();
    console.log("🧹 [성능] 메트릭 초기화");
  }
}

export const perfLogger = new PerformanceLogger();

/**
 * 간편 사용 함수들
 */
export const logTaskStart = (name: string, metadata?: any) =>
  perfLogger.start(name, metadata);
export const logTaskEnd = (name: string, metadata?: any) =>
  perfLogger.end(name, metadata);
export const logMemory = (
  name: string,
  arrayLength: number,
  itemSize?: number,
) => perfLogger.logMemory(name, arrayLength, itemSize);
export const trackArray = (name: string, length: number, threshold?: number) =>
  perfLogger.trackArrayGrowth(name, length, threshold);
