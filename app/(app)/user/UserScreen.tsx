import React, { useState } from "react";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import UserPersonalDataSection from "./UserPersonalDataSection";
import UserObjectivesSection from "./UserObjectivesSection";
import UserRoutinesSection from "./UserRoutinesSection";
import Header from "@/components/Header";

export default function UserScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header showBack={false} />
      <View style={{ padding: 16, gap: 16 }}>
        {/* Tabs con SegmentedButtons */}
        <SegmentedButtons
          value={tabIndex.toString()}
          onValueChange={(v) => setTabIndex(Number(v))}
          buttons={[
            { value: "0", label: "Datos" },
            { value: "1", label: "Objetivos" },
            { value: "2", label: "Rutinas" },
          ]}
          theme={{
            colors: {
              secondaryContainer: "#287D76",
              onSecondaryContainer: "#fff",
              surfaceVariant: "#E0F2F1",
              onSurfaceVariant: "#287D76",
            },
          }}
        />
      </View>

      {/* Contenido según tab seleccionado */}
      <View style={{ flex: 1 }}>
        {tabIndex === 0 && <UserPersonalDataSection />}
        {tabIndex === 1 && <UserObjectivesSection />}
        {tabIndex === 2 && <UserRoutinesSection />}
      </View>
    </View>
  );
}
