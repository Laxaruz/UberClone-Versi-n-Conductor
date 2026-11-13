import { StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';
import { appVisuals as visual } from '../config/appVisuals';

export default function ScreenHero({ icon, eyebrow, title, description, children }) {
  return <View style={styles.hero}>
    <View style={styles.top}>
      <View style={styles.icon}><AppIcon name={icon} color={visual.surface} size={24} /></View>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    </View>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {children}
  </View>;
}

export function StatusPill({ label, tone = 'info' }) {
  const palette = {
    info: [visual.accent, visual.accentSoft],
    success: [visual.success, visual.successSoft],
    warning: [visual.gold, visual.goldSoft],
    danger: [visual.danger, visual.dangerSoft],
  }[tone];
  return <Text style={[styles.pill, { color: palette[0], backgroundColor: palette[1] }]}>{label}</Text>;
}

export function InfoBanner({ children, tone = 'warning' }) {
  const palette = tone === 'danger' ? [visual.danger, visual.dangerSoft]
    : tone === 'info' ? [visual.accent, visual.accentSoft] : [visual.gold, visual.goldSoft];
  return <View style={[styles.banner, { backgroundColor: palette[1] }]}>
    <Text style={[styles.bannerText, { color: palette[0] }]}>{children}</Text>
  </View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: visual.hero, borderRadius: 26, padding: 22, marginBottom: 18 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#31565D',
    alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: visual.heroMuted, fontSize: 12, fontWeight: '800', letterSpacing: 0.7,
    textAlign: 'right', marginLeft: 10, flexShrink: 1 },
  title: { color: visual.surface, fontSize: 29, fontWeight: '800', marginTop: 18 },
  description: { color: visual.heroMuted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  pill: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 12, fontSize: 13, fontWeight: '800' },
  banner: { padding: 14, borderRadius: 14, marginTop: 14 },
  bannerText: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
});
