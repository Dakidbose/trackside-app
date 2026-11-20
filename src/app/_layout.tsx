import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AgeGate } from '../components/AgeGate';
import '../lib/reminders'; // registers the foreground notification handler
import { useColors } from '../lib/theme';
import { useReminderTap } from '../lib/useReminderTap';

SplashScreen.preventAutoHideAsync().catch(() => {});

const AGE_KEY = 'age-confirmed-v1';

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = useColors();
  const [ageOk, setAgeOk] = useState<boolean | null>(null);
  const tappedFile = useReminderTap();

  useEffect(() => {
    AsyncStorage.getItem(AGE_KEY)
      .then((v) => setAgeOk(v === 'yes'))
      .catch(() => setAgeOk(false))
      .finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  // Tapping a post time reminder opens that card.
  useEffect(() => {
    if (ageOk && tappedFile) router.push({ pathname: '/card/[file]', params: { file: tappedFile } });
  }, [tappedFile, ageOk]);

  if (ageOk === null) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, primary: c.red, background: c.bg, card: c.card, text: c.head, border: c.line } };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      {ageOk ? (
        <Stack screenOptions={{ headerTintColor: c.red, headerTitleStyle: { color: c.head }, headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="card/[file]" options={{ title: 'Picks' }} />
          <Stack.Screen name="web" options={{ title: '' }} />
        </Stack>
      ) : (
        <AgeGate
          onConfirm={() => {
            AsyncStorage.setItem(AGE_KEY, 'yes').catch(() => {});
            setAgeOk(true);
          }}
        />
      )}
    </ThemeProvider>
  );
}
