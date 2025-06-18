// components/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { selectedPlanIdAtom } from "../atoms/mealPlanAtom";
import { useAtom } from "jotai";

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  backTo?: any | null;
  onBack?: () => void;
};

export default function Header({
  title = "",
  showBack = true,
  backTo = null,
  onBack,
}: HeaderProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useAtom(selectedPlanIdAtom);

  return (
    <View
      style={{
        // flex: 1,
        borderBottomColor: "#eee",
        marginTop: 70,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: showBack ? "flex-start" : "center",
      }}
    >
      {showBack && (
        <TouchableOpacity
          onPress={async () => {
            if (onBack) {
              onBack();
            } else if (backTo) {
              setSelectedPlanId(null);
            } else {
              console.log("entre a back");
              router.back();
            }
          }}
          style={{ marginRight: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#287D76" />
        </TouchableOpacity>
      )}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#287D76",
        }}
      >
        {title}
      </Text>
    </View>
  );
}
