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
};

export default function Header({
  title = "",
  showBack = true,
  backTo = null,
}: HeaderProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useAtom(selectedPlanIdAtom);

  return (
    <View
      style={{
        borderBottomColor: "#eee",
        marginTop: 70,
        paddingHorizontal: 15,
        flexDirection: "row",
      }}
    >
      {showBack && (
        <TouchableOpacity
          onPress={async () => {
            if (backTo) {
              console.log("backTo: ", backTo);
              console.log("selectedPlanId: ", selectedPlanId);
              setSelectedPlanId(null);
              //await router.push(backTo);
            } else {
              router.back();
            }
          }}
          style={{ marginRight: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#287D76" />
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#287D76" }}>
        {title}
      </Text>
    </View>
  );
}
