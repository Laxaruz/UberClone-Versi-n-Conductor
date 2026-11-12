import { useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import IncomingTripCard from '../components/IncomingTripCard';
import { colors } from '../config/theme';
import useTripRequests from '../hooks/useTripRequests';
import useTranslation from '../i18n/useTranslation';
import { createDemoTripRequestSource } from '../services/demoTripRequests';

export default function IncomingRequestScreen() {
  const t = useTranslation();
  const isFocused = useIsFocused();
  const [source] = useState(createDemoTripRequestSource);
  const { request, remainingSeconds, accept, reject, restartDemo, active } = useTripRequests(source, isFocused);
  const canDecide = active && request?.status === 'requested' && remainingSeconds > 0;
  const statusKey = {
    requested: 'requestPending', accepted: 'requestAcceptedDemo',
    rejected: 'requestRejectedDemo', expired: 'requestExpiredDemo',
  }[request?.status];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('incomingRequest')}</Text>
      <Text style={styles.badge}>{t('mockMode')}</Text>
      <Text style={styles.notice}>{t('demoRequestNotice')}</Text>
      {request ? (
        <>
          <IncomingTripCard request={request} />
          <Text style={styles.timer}>{t('secondsRemaining')}: {remainingSeconds} s</Text>
          <Text style={styles.status}>{statusKey ? t(statusKey) : null}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={!canDecide}
              style={[styles.action, styles.accept, !canDecide && styles.disabled]} onPress={accept}>
              <Text style={styles.acceptText}>{t('acceptRequest')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={!canDecide}
              style={[styles.action, styles.reject, !canDecide && styles.disabled]} onPress={reject}>
              <Text style={styles.rejectText}>{t('rejectRequest')}</Text>
            </Pressable>
          </View>
        </>
      ) : <Text style={styles.empty}>{t('noIncomingRequests')}</Text>}
      <Pressable accessibilityRole="button" disabled={!active} style={styles.newButton} onPress={restartDemo}>
        <Text style={styles.newButtonText}>{t('newDemoRequest')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  badge: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: colors.warningSoft, color: colors.warning, borderRadius: 20, fontWeight: '700' },
  notice: { marginVertical: 16, color: colors.warning, lineHeight: 22 },
  timer: { marginTop: 20, fontSize: 24, fontWeight: '800', color: colors.text },
  status: { marginTop: 8, marginBottom: 16, color: colors.primary, fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  accept: { backgroundColor: colors.primary },
  reject: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  disabled: { opacity: 0.45 },
  acceptText: { color: colors.surface, fontWeight: '700' },
  rejectText: { color: colors.primary, fontWeight: '700' },
  newButton: { padding: 16, marginTop: 20, alignItems: 'center' },
  newButtonText: { color: colors.primary, fontWeight: '700' },
  empty: { marginTop: 20, color: colors.muted },
});
