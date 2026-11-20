import { useColorScheme } from 'react-native';

// Brand colors match the website's style.css (light and dark).
const light = {
  bg: '#f5f6f8',
  card: '#ffffff',
  ink: '#1b2233',
  head: '#14213d',
  muted: '#5a6377',
  line: '#d9dee7',
  soft: '#eceff5',
  navy: '#14213d',
  red: '#b8232b',
  link: '#26385f',
  win: '#1b7f3b',
  winBg: '#e7f5ec',
  missBg: '#eceff3',
  rgBg: '#fdf1f1',
};

const dark: typeof light = {
  bg: '#0e1420',
  card: '#172033',
  ink: '#e6e9f0',
  head: '#f1f4fa',
  muted: '#a7b0c2',
  line: '#2c3850',
  soft: '#1f2a40',
  navy: '#26385f',
  red: '#e0424b',
  link: '#93b4ff',
  win: '#4ade80',
  winBg: '#13301f',
  missBg: '#2a3242',
  rgBg: '#3a1a1e',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
