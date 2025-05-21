// components/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Header({ title = "", showBack = true }) {
  const router = useRouter();

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
          onPress={() => router.back()}
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
