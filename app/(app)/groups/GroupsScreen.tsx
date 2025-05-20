import useAxiosInstance from "@/hooks/useAxios";
import { homeStyles } from "@/styles/homeStyles";
import { mealPlanListStyles } from "@/styles/mealStyles";
import { useEffect, useState, useRef } from "react";
import { Text, StyleSheet, View, FlatList } from "react-native";
import { Button, Card, TextInput, FAB } from "react-native-paper";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { GroupType } from "@/types/groupTypes";
import { Formik } from "formik";

export default function GroupScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const axiosInstance = useAxiosInstance("group");
  const scrollRef = useRef<FlatList>(null);

  const fetchGroups = async () => {
    try {
      const userId = auth?.id;
      if (!userId || !auth?.token) return;
      const response = await axiosInstance.get(`/users/${userId}/groups`);
      setGroups(response.data.data);
      setError(null);
    } catch {
      setError("Error al obtener los grupos");
    }
  };

  // Footer para crear grupo usando Formik
  const renderFooter = () => (
    <Formik
      initialValues={{ name: "", description: "" }}
      enableReinitialize
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        if (!values.name.trim() || !values.description.trim()) {
          setCreateError("Completá todos los campos");
          setSubmitting(false);
          return;
        }
        setCreating(true);
        try {
          const userId = auth?.id;
          if (!userId || !auth?.token) return;
          const groupData = {
            name: values.name,
            description: values.description,
            owner_id: userId,
          };
          const response = await axiosInstance.post("/groups", groupData);
          setGroups([...groups, response.data.data]);
          resetForm();
          setCreateError(null);
        } catch {
          setCreateError("Error al crear el grupo");
        }
        setCreating(false);
      }}
    >
      {({ handleChange, handleBlur, values, isSubmitting, handleSubmit }) => (
        <View style={styles.addGroupCard}>
          <Text style={styles.cardTitle}>Nuevo grupo</Text>
          <View style={{ flex: 1, gap: 8 }}>
            <TextInput
              label="Nombre"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              style={styles.input}
              mode="outlined"
              activeOutlineColor="#287D76"
            />
            <TextInput
              label="Descripción"
              value={values.description}
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
              style={styles.input}
              mode="outlined"
              activeOutlineColor="#287D76"
              multiline
              numberOfLines={4}
            />
          </View>

          {createError && <Text style={{ color: "red" }}>{createError}</Text>}
          <Button
            mode="contained"
            style={mealPlanListStyles.planButtonCreate}
            onPress={() => {
              handleSubmit();
            }}
            loading={creating || isSubmitting}
            disabled={creating || isSubmitting}
          >
            Guardar
          </Button>
        </View>
      )}
    </Formik>
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <View>
        <Text style={homeStyles.sectionTitle}>Grupos</Text>
        {error && (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        )}
        <Text style={homeStyles.info}>Elegí un grupo o creá uno nuevo</Text>
      </View>

      <View
        style={{
          gap: 16,
        }}
      >
        <FlatList
          ref={scrollRef}
          data={groups}
          horizontal
          contentContainerStyle={{ gap: 16 }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.groupCard}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Card>
          )}
          ListFooterComponent={renderFooter}
        />
      </View>
      <FAB
        icon="plus"
        label="Crear grupo"
        style={styles.fab}
        onPress={() => {
          if (scrollRef.current) {
            scrollRef.current.scrollToEnd({
              animated: true,
            });
          }
        }}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 16,
    gap: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: "red",
    justifyContent: "center",
  },
  groupCard: {
    width: 260,
    height: 300,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addGroupCard: {
    width: 260,
    height: 300,
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#287D76",
    backgroundColor: "#f0faf9",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#287D76",
    zIndex: 10,
  },
});
