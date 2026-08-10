import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Sentry.init({
  dsn: "https://e3da9e67549fcae6a7e12ea2426bf8b8@o4511457882472448.ingest.us.sentry.io/4511457890795520",
  tracesSampleRate: 0.1,
});

function RootLayout() {
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
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
