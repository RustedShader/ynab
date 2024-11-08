import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="graphs"
        options={{
          headerShown: false,
          headerBackTitle: "Dashboard",
          title: "Graphs",
        }}
      />
      <Stack.Screen
        name="analysis"
        options={{
          headerShown: false,
          headerBackTitle: "Dashboard",
          title: "Analysis",
        }}
      />
      <Stack.Screen
        name="chatbot"
        options={{
          headerShown: false,
          headerBackTitle: "Dashboard",
          title: "Chatbot",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          headerBackTitle: "Dashboard",
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          headerShown: false,
          headerBackTitle: "Dashboard",
          title: "Transactions",
        }}
      />
    </Stack>
  );
}