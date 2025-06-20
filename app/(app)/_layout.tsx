import { Stack } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const window = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    height: 50,
    width: window.width,
  },
});

export default function HomeLayout() {
  return (
    <>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false, // Hide the header for all screens
          }}
        />
      </View>
    </>
  );
}
