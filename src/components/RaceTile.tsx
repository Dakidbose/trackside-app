import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Race } from '../lib/site';
import { useColors } from '../lib/theme';
import { Badge, Card, ProgramNumber } from './ui';

type Props = {
  race: Race;
  reminderOn?: boolean;
  canRemind?: boolean;
  onToggleReminder?: () => void;
};

export function RaceTile({ race, reminderOn, canRemind, onToggleReminder }: Props) {
  const c = useColors();
  const accent = race.status === 'cashed' ? c.win : race.status === 'missed' ? c.muted : c.red;
  return (
    <Card accent={accent}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.race, { color: c.head }]}>Race {race.number}</Text>
          {race.postTime || race.conditions ? (
            <Text style={{ color: c.muted, fontSize: 13, marginTop: 1 }}>
              {[race.postTime && `Post ${race.postTime}`, race.conditions].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        <Badge kind={race.badgeKind} label={race.badge} />
        {canRemind ? (
          <Pressable
            onPress={onToggleReminder}
            hitSlop={10}
            style={[styles.bell, { borderColor: reminderOn ? c.red : c.line, backgroundColor: reminderOn ? c.red : 'transparent' }]}
            accessibilityRole="button"
            accessibilityLabel={reminderOn ? `Cancel reminder for race ${race.number}` : `Remind me before race ${race.number}`}
          >
            <Text style={{ fontSize: 15, color: reminderOn ? '#fff' : c.muted }}>{reminderOn ? '🔔' : '🔕'}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ marginTop: 10, gap: 6 }}>
        {race.selections.map((s, i) => (
          <View key={`${s.program}-${i}`} style={styles.sel}>
            <ProgramNumber n={s.program} top={i === 0} />
            <Text style={[styles.horse, { color: c.ink }]} numberOfLines={1}>
              {s.horse || (i === 0 ? 'Top pick' : `Pick ${i + 1}`)}
            </Text>
            {s.ml ? <Text style={{ color: c.muted, fontSize: 13 }}>ML {s.ml}</Text> : null}
          </View>
        ))}
      </View>

      {race.official ? <Text style={[styles.res, { color: c.muted }]}>{race.official}</Text> : null}
      {race.notes.map((n, i) => (
        <Text key={i} style={[styles.res, { color: c.muted }]}>
          {n}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  race: { fontSize: 18, fontWeight: '800' },
  sel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  horse: { flex: 1, fontSize: 16, fontWeight: '600' },
  res: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  bell: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
