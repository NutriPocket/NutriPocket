import useAxiosInstance from "@/hooks/useAxios";
import { homeStyles } from "@/styles/homeStyles";
import { mealPlanListStyles } from "@/styles/mealStyles";
import { useEffect, useState, useRef } from "react";
import { Text, StyleSheet, View, FlatList } from "react-native";
import {
  Button,
  TextInput,
  FAB,
  TouchableRipple,
  ActivityIndicator,
} from "react-native-paper";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { GroupType } from "@/types/groupType";
import { Formik } from "formik";
import { router } from "expo-router";

export default function GroupScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const axiosInstance = useAxiosInstance("group");
  const scrollRef = useRef<FlatList>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const userId = auth?.id;
      if (!userId || !auth?.token) return;
      const response = await axiosInstance.get(`/users/${userId}/groups`);
      setGroups(response.data.data);
      setError(null);
    } catch {
      setError("Error al obtener los grupos");
    } finally {
      setLoading(false);
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
          router.push({
            pathname: "/groups/[id]",
            params: { id: response.data.data.id },
          });
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
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} color="#287D76" size="large" />
        </View>
      ) : (
        <>
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
              alignItems: "center",
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
                <TouchableRipple
                  key={item.id}
                  onPress={() => {
                    router.push({
                      pathname: "/groups/[id]",
                      params: { id: item.id },
                    });
                  }}
                >
                  <View style={styles.groupCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardDescription}>
                        {item.description}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>
                      Creado el {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableRipple>
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
        </>
      )}
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
    alignItems: "center",
    gap: 16,
    backgroundColor: "red",
    justifyContent: "center",
  },
  groupCard: {
    width: 260,
    height: 300,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    gap: 4,
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
    marginBottom: 2,
    color: "#287D76",
    textAlign: "left",
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    textAlign: "left",
  },
  cardDate: {
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    marginBottom: 0,
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
