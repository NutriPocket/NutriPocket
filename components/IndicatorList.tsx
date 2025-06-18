import { FlatList, View } from "react-native";
import { Text } from "react-native-paper";
import { Indicator, IndicatorProps } from "./Indicator";

interface IndicatorListProps {
  title: string;
  indicators: IndicatorProps[];
}

export const IndicatorList: React.FC<IndicatorListProps> = ({
  title,
  indicators,
}) => (
  <>
    {title !== "" && (
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        {title}
      </Text>
    )}
    <FlatList
      data={indicators}
      keyExtractor={(item) => item.label}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 16 }}
      contentContainerStyle={{ gap: 16 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <Indicator {...item} />
        </View>
      )}
    />
  </>
);
