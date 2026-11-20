import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../lib/theme';
import { Button } from './ui';

export function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const c = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
      <Text style={[styles.title, { color: c.head }]}>Trackside Selections</Text>
      <Text style={[styles.body, { color: c.ink }]}>
        Free horse racing picks, results and handicapping guides. This app is for adults: you must be 21 or older (or the
        legal age where you live) to use it.
      </Text>
      <Text style={[styles.body, { color: c.muted, fontSize: 14 }]}>
        Trackside Selections does not take bets. Picks are opinions, not guarantees.
      </Text>
      <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 12 }}>
        <Button title="I'm 21 or older" onPress={onConfirm} />
        <Button kind="ghost" title="Gambling help: 1-800-GAMBLER" onPress={() => Linking.openURL('tel:18004262537')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  logo: { width: 96, height: 96, borderRadius: 22, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 23, textAlign: 'center', marginBottom: 10 },
});
