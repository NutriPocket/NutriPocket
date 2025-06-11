// components/SearchableDropdown.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Searchbar } from "react-native-paper";

interface Item {
  label: string;
  value: string;
}

interface Props {
  data: Item[];
  onSelect: (item: Item) => void;
  placeholder?: string;
  onChangeText?: (text: string) => void;
}

export const SearchableDropdown: React.FC<Props> = ({
  data,
  onSelect,
  placeholder = "Buscar",
  onChangeText,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (onChangeText) onChangeText(query); // El padre hace el fetch y pasa los datos por props
    setShowDropdown(true); // Siempre muestra el dropdown cuando hay texto
    //setFilteredData(data);

    // //Filtrado en el caso de que este mockeado
    // if (query.length > 0) {
    //   const filtered = data.filter((item) =>
    //     item.value.toLowerCase().includes(query.toLowerCase())
    //   );
    //   setFilteredData(filtered);
    //   setShowDropdown(true);
    // } else {
    //   setShowDropdown(false);
    // }
  };

  const handleSelect = (item: Item) => {
    setSearchQuery(item.value);
    setShowDropdown(false);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={data} // esto lo hago en el caso uso directamente los datos del padre
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{item.value}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  searchbar: {
    borderRadius: 8,
    backgroundColor: "#E0F2F1",
  },
  dropdown: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 58,
    zIndex: 9999,
    minWidth: 250,
    maxHeight: 200,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },
  dropdownItem: {
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
    backgroundColor: "#fff",
    padding: 12,

    borderColor: "#eee",
  },
  dropdownItemText: {
    color: "#287D76",
    fontWeight: "normal",
    fontSize: 16,
  },
});
