import { NativeTabs } from 'expo-router/native-tabs';
import { useColors } from '../../lib/theme';

// Native iOS tab bar (SF Symbols) with Material icons on Android.
export default function TabsLayout() {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.red}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Picks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'flag.checkered', selected: 'flag.checkered' }} md="flag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="results">
        <NativeTabs.Trigger.Label>Results</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'list.number', selected: 'list.number' }} md="format_list_numbered" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calculator">
        <NativeTabs.Trigger.Label>Calculator</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'plusminus.circle', selected: 'plusminus.circle.fill' }} md="calculate" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }} md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
