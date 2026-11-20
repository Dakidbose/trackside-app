import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, PlayResponsibly, ScreenTitle, SectionTitle } from '../../components/ui';
import { DEPTH_NAME, money, price, slotLabels, type BetType, type Depth, type Mode } from '../../lib/calc';
import { useColors } from '../../lib/theme';

const TYPES: { v: BetType; label: string }[] = [
  { v: 'WPS', label: 'Win/Place/Show' },
  { v: 'VERT', label: 'Exacta/Tri/Super' },
  { v: 'DD', label: 'Daily Double' },
  { v: 'P3', label: 'Pick 3' },
  { v: 'P4', label: 'Pick 4' },
  { v: 'P5', label: 'Pick 5' },
  { v: 'P6', label: 'Pick 6' },
];
const BASES = [0.1, 0.2, 0.5, 1, 2];

function Chips<T extends string | number>({
  items,
  value,
  onChange,
  render,
}: {
  items: T[];
  value: T | T[];
  onChange: (v: T) => void;
  render?: (v: T) => string;
}) {
  const c = useColors();
  const isOn = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <View style={styles.chips}>
      {items.map((v) => {
        const on = isOn(v);
        return (
          <Pressable
            key={String(v)}
            onPress={() => onChange(v)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.chip, { borderColor: on ? c.red : c.line, backgroundColor: on ? c.red : c.card }]}
          >
            <Text style={{ color: on ? '#fff' : c.ink, fontWeight: '600' }}>{render ? render(v) : String(v)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CalculatorScreen() {
  const c = useColors();
  const [type, setType] = useState<BetType>('VERT');
  const [depth, setDepth] = useState<Depth>('TRI');
  const [mode, setMode] = useState<Mode>('BOX');
  const [pools, setPools] = useState({ W: true, P: false, S: false });
  const [base, setBase] = useState(1);
  const [lists, setLists] = useState<number[][]>([[]]);
  const [active, setActive] = useState(0);

  const labels = slotLabels({ type, mode, depth });
  const result = useMemo(() => price({ type, depth, mode, lists, pools, base }), [type, depth, mode, lists, pools, base]);

  const reset = (next: () => void) => {
    next();
    setLists([[]]);
    setActive(0);
  };

  const toggleHorse = (n: number) => {
    setLists((prev) => {
      const copy = labels.map((_, i) => [...(prev[i] ?? [])]);
      const slot = copy[active];
      const at = slot.indexOf(n);
      if (at >= 0) slot.splice(at, 1);
      else slot.push(n);
      slot.sort((a, b) => a - b);
      return copy;
    });
  };

  const current = lists[active] ?? [];
  const ticket = labels
    .map((l, i) => (lists[i]?.length ? lists[i].join(',') : '–'))
    .join(' / ');

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16 }} contentInsetAdjustmentBehavior="automatic">
      <ScreenTitle title="Ticket Calculator" subtitle="See what a ticket costs before you play it" />

      <SectionTitle>Bet type</SectionTitle>
      <Chips items={TYPES.map((t) => t.v)} value={type} onChange={(v) => reset(() => setType(v))} render={(v) => TYPES.find((t) => t.v === v)!.label} />

      {type === 'VERT' ? (
        <>
          <SectionTitle>Wager</SectionTitle>
          <Chips items={['EX', 'TRI', 'SUPER'] as Depth[]} value={depth} onChange={(v) => reset(() => setDepth(v))} render={(v) => DEPTH_NAME[v]} />
          <SectionTitle>Structure</SectionTitle>
          <Chips
            items={['BOX', 'KEY', 'WHEEL'] as Mode[]}
            value={mode}
            onChange={(v) => reset(() => setMode(v))}
            render={(v) => (v === 'BOX' ? 'Box' : v === 'KEY' ? 'Key' : 'Part-wheel')}
          />
        </>
      ) : null}

      {type === 'WPS' ? (
        <>
          <SectionTitle>Pools</SectionTitle>
          <Chips
            items={['W', 'P', 'S'] as const as unknown as ('W' | 'P' | 'S')[]}
            value={(['W', 'P', 'S'] as const).filter((p) => pools[p])}
            onChange={(p) => setPools((s) => ({ ...s, [p]: !s[p] }))}
            render={(p) => (p === 'W' ? 'Win' : p === 'P' ? 'Place' : 'Show')}
          />
        </>
      ) : null}

      <SectionTitle>Base amount</SectionTitle>
      <Chips items={BASES} value={base} onChange={setBase} render={(b) => (b < 1 ? `${Math.round(b * 100)}¢` : `$${b}`)} />

      <SectionTitle>Horses</SectionTitle>
      {labels.length > 1 ? (
        <Chips
          items={labels.map((_, i) => i)}
          value={active}
          onChange={setActive}
          render={(i) => `${labels[i]}${lists[i]?.length ? ` (${lists[i].length})` : ''}`}
        />
      ) : null}
      <View style={[styles.grid, { marginTop: labels.length > 1 ? 8 : 0 }]}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => {
          const on = current.includes(n);
          return (
            <Pressable
              key={n}
              onPress={() => toggleHorse(n)}
              accessibilityRole="button"
              accessibilityLabel={`Horse ${n}`}
              accessibilityState={{ selected: on }}
              style={[styles.num, { backgroundColor: on ? c.navy : c.card, borderColor: on ? c.red : c.line }]}
            >
              <Text style={{ color: on ? '#fff' : c.ink, fontWeight: '700', fontSize: 16 }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ marginTop: 16 }} accent={c.red}>
        <Text style={{ color: c.muted, fontSize: 13 }}>{result.label}</Text>
        <Text style={{ color: c.head, fontSize: 30, fontWeight: '800', marginTop: 2 }}>{money(result.cost)}</Text>
        <Text style={{ color: c.ink, marginTop: 4 }}>
          {result.combos} {result.combos === 1 ? 'combination' : 'combinations'} × {money(base)}
        </Text>
        <Text style={{ color: c.muted, marginTop: 6 }} selectable>
          {ticket}
        </Text>
      </Card>
      <Button kind="ghost" title="Clear ticket" onPress={() => reset(() => {})} />
      <View style={{ height: 12 }} />
      <PlayResponsibly />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  num: { width: 52, height: 48, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
