import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const COLORS = {
  background: "#101820",
  border: "#294157",
  green: "#2ECC71",
  blue: "#4EA8FF",
  purple: "#A855F7",
  inactive: "#8A98A8",
};

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="spending"
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: Platform.OS === "ios" ? 92 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="spending"
        options={{
          title: "Spending",
          tabBarActiveTintColor: COLORS.green,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="savings"
        options={{
          title: "Savings",
          tabBarActiveTintColor: COLORS.blue,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bill-note"
        options={{
          title: "Bills",
          tabBarActiveTintColor: COLORS.purple,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
