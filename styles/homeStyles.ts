import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 70,
  },

  formContainer: {  
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 40,
    marginBottom: 20,
    width: '100%',
  },
  formFields: {
    width: 350,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  listLabel: {
    flex: 1.2,
    fontSize: 15,
    color: '#287D76',
    fontWeight: '600',
  },
  listInput: {
    flex: 1.8,
    backgroundColor: 'transparent',
    fontSize: 15,
    borderRadius: 4,
    minHeight: 36,
    width: '100%',
  },
  zebra0: {
    backgroundColor: '#f7faf9',
  },
  zebra1: {
    backgroundColor: '#e6f1ee',
  },
  welcome: {
    fontSize: 24,
    color: '#287D76',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#287D76',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#287D76',
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});
