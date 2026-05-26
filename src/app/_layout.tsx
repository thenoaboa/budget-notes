import { Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey="phc_x7DdCANjZVq5N2vLrm4mGF3GMVRqgDaF7chXnfHeLrgg"
      options={{
        host: "https://us.i.posthog.com",
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}
