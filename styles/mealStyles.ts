import { StyleSheet } from "react-native";

export const mealPlanListStyles = StyleSheet.create({
  planCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: 340,
    alignSelf: "center",
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#287D76",

  },
  planDescription: {
    fontSize: 15,
    color: "#555",
  },
  planButtonCreate: {
    backgroundColor: "#287D76",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },

});
