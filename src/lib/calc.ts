// Ticket cost math, ported from the website's ticket-calc.js so both give the same numbers.

export type BetType = 'WPS' | 'VERT' | 'DD' | 'P3' | 'P4' | 'P5' | 'P6';
export type Depth = 'EX' | 'TRI' | 'SUPER';
export type Mode = 'BOX' | 'KEY' | 'WHEEL';

export const DEPTH_K: Record<Depth, number> = { EX: 2, TRI: 3, SUPER: 4 };
export const DEPTH_NAME: Record<Depth, string> = { EX: 'Exacta', TRI: 'Trifecta', SUPER: 'Superfecta' };
export const LEGS: Record<Exclude<BetType, 'WPS' | 'VERT'>, number> = { DD: 2, P3: 3, P4: 4, P5: 5, P6: 6 };

export const uniq = <T,>(a: T[]): T[] => [...new Set(a)];

export function perm(n: number, k: number): number {
  if (k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

/** Distinct-horse permutations across positional lists (key / part-wheel). */
export function positional(lists: number[][]): number {
  const ls = lists.map(uniq);
  let count = 0;
  const used = new Set<number>();
  const go = (i: number) => {
    if (i === ls.length) {
      count++;
      return;
    }
    for (const h of ls[i]) {
      if (used.has(h)) continue;
      used.add(h);
      go(i + 1);
      used.delete(h);
    }
  };
  go(0);
  return count;
}

export const box = (horses: number[], k: number) => perm(uniq(horses).length, k);

export function key(keys: number[], others: number[], k: number): number {
  const l = [keys];
  for (let i = 1; i < k; i++) l.push(others);
  return positional(l);
}

export const multi = (legs: number[][]) => (legs.length ? legs.reduce((p, l) => p * uniq(l).length, 1) : 0);

export type TicketInput = {
  type: BetType;
  depth: Depth;
  mode: Mode;
  lists: number[][];
  pools: { W: boolean; P: boolean; S: boolean };
  base: number;
};

export function slotLabels(t: Pick<TicketInput, 'type' | 'mode' | 'depth'>): string[] {
  if (t.type === 'WPS') return ['Horses'];
  if (t.type === 'VERT') {
    if (t.mode === 'BOX') return ['Horses'];
    if (t.mode === 'KEY') return ['Key horse(s)', 'With'];
    return ['1st', '2nd', '3rd', '4th'].slice(0, DEPTH_K[t.depth]);
  }
  return Array.from({ length: LEGS[t.type] }, (_, i) => `Leg ${i + 1}`);
}

export function price(t: TicketInput): { combos: number; cost: number; label: string } {
  const L = t.lists;
  let combos = 0;
  let label: string;
  if (t.type === 'WPS') {
    const pools = (['W', 'P', 'S'] as const).filter((p) => t.pools[p]);
    combos = uniq(L[0] ?? []).length * pools.length;
    label = pools.length ? pools.join('/') : 'Pick Win, Place or Show';
  } else if (t.type === 'VERT') {
    const k = DEPTH_K[t.depth];
    const nm = DEPTH_NAME[t.depth];
    if (t.mode === 'BOX') {
      combos = box(L[0] ?? [], k);
      label = `${nm} box`;
    } else if (t.mode === 'KEY') {
      combos = key(L[0] ?? [], L[1] ?? [], k);
      label = `${nm} key`;
    } else {
      combos = positional(Array.from({ length: k }, (_, i) => L[i] ?? []));
      label = `${nm} part-wheel`;
    }
  } else {
    const n = LEGS[t.type];
    combos = multi(Array.from({ length: n }, (_, i) => L[i] ?? []));
    label = t.type === 'DD' ? 'Daily Double' : `Pick ${t.type.slice(1)}`;
  }
  return { combos, cost: Math.round(combos * t.base * 100) / 100, label };
}

export const money = (n: number) => `$${n.toFixed(2)}`;
