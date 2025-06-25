// components/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { selectedPlanIdAtom } from "../atoms/mealPlanAtom";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/atoms/authAtom";

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  backTo?: any | null;
  onBack?: () => void;
};

export default function Header({
  title = "",
  showBack = true,
  showLogout = false,
  backTo = null,
  onBack,
}: HeaderProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useAtom(selectedPlanIdAtom);

  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);

  const handleLogout = () => {
    if (!auth) return;
    setIsAuthenticated(null);
    setSelectedPlanId(null);
    router.replace("/login");
  };

  return (
    <View
      style={{
        borderBottomColor: "#eee",
        marginTop: 70,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: showBack ? "space-between" : "center",
      }}
    >
      {showBack && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={async () => {
              if (onBack) {
                onBack();
              } else if (backTo) {
                setSelectedPlanId(null);
              } else {
                router.back();
              }
            }}
            style={{ marginRight: 12 }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#287D76"
            />
          </TouchableOpacity>
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
      )}

      {!showBack && (
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#287D76",
          }}
        >
          {title}
        </Text>
      )}

      {showLogout && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ position: "absolute", right: 15 }}
        >
          <MaterialCommunityIcons name="logout" size={28} color="#287D76" />
        </TouchableOpacity>
      )}
    </View>
  );
}
