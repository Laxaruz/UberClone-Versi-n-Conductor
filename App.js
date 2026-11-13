import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DriverProvider, useDriver } from './src/context/DriverContext';
import RootNavigator from './src/navigation/RootNavigator';
import { listenForRequestNotifications } from './src/services/pushNotifications';

function RequestNotificationNavigation({ navigationRef, navigationReady }) {
  const { authLoading, sessionClosed, driverUid } = useDriver();
  const [requestId, setRequestId] = useState(null);

  useEffect(() => listenForRequestNotifications(setRequestId), []);
  useEffect(() => {
    if (!requestId || !navigationReady || authLoading || sessionClosed || !driverUid) return;
    navigationRef.navigate('TripFlow', { screen: 'IncomingRequest', params: { requestId } });
    setRequestId(null);
  }, [requestId, navigationReady, authLoading, sessionClosed, driverUid, navigationRef]);
  return null;
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [navigationReady, setNavigationReady] = useState(false);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DriverProvider>
          <RequestNotificationNavigation navigationRef={navigationRef} navigationReady={navigationReady} />
          <NavigationContainer ref={navigationRef} onReady={() => setNavigationReady(true)}>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </DriverProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
