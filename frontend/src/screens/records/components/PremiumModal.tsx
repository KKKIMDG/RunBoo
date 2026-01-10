import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "@/screens/records/components/PremiumModal.styles";

const { width } = Dimensions.get("window");

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onStartPremium: () => void;
}

const PremiumModal = ({
  visible,
  onClose,
  onStartPremium,
}: PremiumModalProps) => {
  const colorScheme = useColorScheme() ?? "light";

  const styles = useMemo(() => {
    return getStyles(colorScheme);
  }, [colorScheme]);

  const features = [
    {
      title: "무제한 AI 분석",
      desc: "언제든지 상세한 러닝 분석",
      icon: "checkmark-circle",
    },
    {
      title: "맞춤형 코칭",
      desc: "AI 기반 개인화 훈련 계획",
      icon: "checkmark-circle",
    },
    {
      title: "고급 통계",
      desc: "상세한 성과 분석 리포트",
      icon: "checkmark-circle",
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/icon.png")}
              width={width * 0.3}
              style={styles.logo}
            />
            <Text style={styles.title}>RunBoo Premium</Text>
            <Text style={styles.subtitle}>
              무료 AI 분석 횟수를 모두 사용했습니다
            </Text>
          </View>

          {/* Feature List */}
          <View style={styles.featureList}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={item.icon as any} size={24} color="#3F4E96" />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing Info */}
          <View style={styles.pricingContainer}>
            <Text style={styles.priceLabel}>월 구독</Text>
            <Text style={styles.priceValue}>₩4,900</Text>
            <Text style={styles.trialText}>7일 무료 체험</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onStartPremium}
            >
              <Text style={styles.primaryButtonText}>프리미엄 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>나중에</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PremiumModal;
