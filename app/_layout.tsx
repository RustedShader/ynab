import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="link_account"
        options={{
          title: "Link Account",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="create_account"
        options={{
          title: "Create Account",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
