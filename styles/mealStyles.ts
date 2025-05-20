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
    height: 400,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  addPlanCard: {
    width: 320,
    marginRight: 16,
    borderStyle: 'dashed',
    borderColor: '#287D76',
    borderWidth: 2,
    flexShrink: 0,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#287D76",
  },
  planDescription: {
    fontSize: 15,
    color: "#555",
  },
  planButtonCreate: {
    backgroundColor: "#287D76",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    marginBottom: 15,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardsContainer:{
    paddingVertical: 20, 
    paddingHorizontal: 10, 
    alignItems: 'flex-start', 
    flexDirection: 'row'
  },
    title: {
    fontSize: 24,
    color: '#287D76',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#287D76',
    textAlign: 'center',
    marginBottom: 100,
  },
  selection: {
    color: "#287D76",
    fontWeight: "bold",
  },

});


