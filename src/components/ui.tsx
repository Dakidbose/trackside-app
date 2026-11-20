import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useColors } from '../lib/theme';

export function ProgramNumber({ n, top }: { n: string; top?: boolean }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.pn,
        { backgroundColor: c.navy },
        top && { borderWidth: 2, borderColor: c.red },
      ]}
      accessibilityLabel={`Program number ${n}`}
    >
      <Text style={styles.pnText}>{n}</Text>
    </View>
  );
}

export function Badge({ kind, label }: { kind: string; label: string }) {
  const c = useColors();
  const bg = kind === 'cash' ? c.winBg : kind === 'miss' ? c.missBg : c.soft;
  const fg = kind === 'cash' ? c.win : c.muted;
  if (!label) return null;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style, accent }: { children: React.ReactNode; style?: ViewStyle; accent?: string }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.line },
        accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.section, { color: c.muted }]}>{children}</Text>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.title, { color: c.head }]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={{ color: c.muted, fontSize: 15, marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function Loading() {
  const c = useColors();
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <ActivityIndicator color={c.red} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const c = useColors();
  return (
    <Card>
      <Text style={{ color: c.ink, fontSize: 15 }}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={[styles.button, { backgroundColor: c.red, marginTop: 12 }]}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export function Button({ title, onPress, kind = 'primary' }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost' }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' ? { backgroundColor: c.red } : { borderWidth: 1, borderColor: c.line, backgroundColor: c.card },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.buttonText, kind === 'ghost' && { color: c.head }]}>{title}</Text>
    </Pressable>
  );
}

/** Shown at the bottom of every betting-related screen, mirroring the website footer. */
export function PlayResponsibly() {
  const c = useColors();
  return (
    <View style={[styles.rg, { backgroundColor: c.rgBg, borderLeftColor: c.red }]}>
      <Text style={{ color: c.ink, fontSize: 13, lineHeight: 19 }}>
        <Text style={{ fontWeight: '700' }}>Play responsibly. </Text>
        You must be 21+ (or the legal age where you live) to wager. Picks are opinions, not guarantees, and this app
        does not take bets. Gambling problem? Call or text{' '}
        <Text style={{ color: c.link, fontWeight: '700' }} onPress={() => Linking.openURL('tel:18004262537')}>
          1-800-GAMBLER
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pn: { minWidth: 30, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  pnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginBottom: 12 },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 8, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800' },
  button: { minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rg: { borderLeftWidth: 4, borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 24 },
});
