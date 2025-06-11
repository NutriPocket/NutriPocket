import { View } from "react-native";
import { Text, Icon } from "react-native-paper";

export interface IndicatorProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

export const Indicator: React.FC<IndicatorProps> = ({
  icon,
  value,
  label,
  color,
}) => {
  return (
    <View
      style={{
        borderRadius: 16,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 6,
        borderWidth: 2,
        borderColor: color,
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon source={icon} size={36} color={color} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color,
            textAlign: "center",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#666",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
