import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { TextInput } from "react-native-paper";

interface OptionPickerProps {
  label: string;
  value: string;
  items: { label: string; value: string }[];
  setValue: (value: string) => void;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  setValue,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ width: "100%" }}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TextInput
            label={label}
            value={items.find((item) => item.value === value)?.label || ""}
            editable={false}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => setMenuVisible(true)}
                forceTextInputFocus={false}
              />
            }
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
            }}
          />
        }
      >
        {items.map((item) => (
          <Menu.Item
            key={item.value}
            onPress={() => {
              setValue(item.value);
              setMenuVisible(false);
            }}
            title={item.label}
            style={{ backgroundColor: "#f9f9f9" }}
            titleStyle={{ color: "#287D76" }}
          />
        ))}
      </Menu>
    </View>
  );
};

export default OptionPicker;
