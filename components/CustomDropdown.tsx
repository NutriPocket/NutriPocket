import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Menu, Checkbox, List } from "react-native-paper";

interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: DropdownItem[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}

export const CustomDropdown = ({
  label,
  options,
  selected,
  onChange,
  multiple = false,
}: Props) => {
  const [visible, setVisible] = useState(false);

  const toggleItem = (value: string) => {
    if (multiple) {
      const newValues = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(newValues);
    } else {
      onChange([value]);
      setVisible(false); // cerrar menú en selección única
    }
  };

  const getDisplayValue = () => {
    if (selected.length === 0) return "";
    const labels = options
      .filter((opt) => selected.includes(opt.value))
      .map((opt) => opt.label);
    return multiple ? labels.join(", ") : labels[0];
  };

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <View style={{ borderRadius: 16 }}>
            <TextInput
              label={label}
              value={getDisplayValue()}
              editable={false}
              right={
                <TextInput.Icon
                  icon={visible ? "menu-up" : "menu-down"}
                  onPress={() => setVisible((v) => !v)}
                />
              }
              style={{
                backgroundColor: "#E0F2F1",
                borderRadius: 8,
              }}
              mode="flat"
              underlineColor="transparent"
              onPressIn={() => setVisible(true)}
            />
          </View>
        }
        contentStyle={{
          backgroundColor: "#fff",
          borderRadius: 16,
        }}
        anchorPosition="bottom"
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => toggleItem(option.value)}
            titleStyle={{
              flexDirection: "row",
              fontSize: 16,
            }}
            style={{
              borderRadius: 12,
              marginHorizontal: 4,
              marginVertical: 2,
              backgroundColor: selected.includes(option.value)
                ? "#E0F2F1"
                : "#fff",
            }}
            title={
              <List.Item
                title={option.label}
                titleStyle={{
                  color: "#287D76",
                  fontWeight: "normal",
                  fontSize: 16,
                }}
                left={() =>
                  multiple ? (
                    <Checkbox
                      status={
                        selected.includes(option.value)
                          ? "checked"
                          : "unchecked"
                      }
                      color="#287D76"
                    />
                  ) : null
                }
              />
            }
          />
        ))}
      </Menu>
    </View>
  );
};
