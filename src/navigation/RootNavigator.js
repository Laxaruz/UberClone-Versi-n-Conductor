import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { appVisuals as visual } from '../config/appVisuals';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';
import HomeScreen from '../screens/HomeScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import EarningsScreen from '../screens/EarningsScreen';
import IncomingRequestScreen from '../screens/IncomingRequestScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import TripPreviewScreen from '../screens/TripPreviewScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import TripCompletedScreen from '../screens/TripCompletedScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { useDriver } from '../context/DriverContext';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function registrationTabOptions(title, icon) {
  return {
    title,
    tabBarIcon: ({ focused }) => <View style={[styles.tabIcon, focused && styles.activeTabIcon]}>
      <AppIcon name={icon} color={focused ? visual.accent : visual.muted} size={22} />
    </View>,
    tabBarLabel: ({ focused }) => <Text numberOfLines={2}
      style={[styles.tabLabel, focused && styles.activeTabLabel]}>{title}</Text>,
  };
}

function PersonalScreen() {
  return <RegistrationScreen section="personal" />;
}

function VehicleScreen() {
  return <RegistrationScreen section="vehicle" />;
}

function DocumentsScreen() {
  return <RegistrationScreen section="documents" />;
}

function RegistrationTabs() {
  const t = useTranslation();
  const { showRegistrationErrors } = useDriver();
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: visual.accent,
      tabBarInactiveTintColor: visual.muted, tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabItem, tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="Personal" component={PersonalScreen}
        options={registrationTabOptions(t('personal'), 'person')} listeners={{ blur: showRegistrationErrors }} />
      <Tabs.Screen name="Vehicle" component={VehicleScreen}
        options={registrationTabOptions(t('vehicle'), 'car')} listeners={{ blur: showRegistrationErrors }} />
      <Tabs.Screen name="Documents" component={DocumentsScreen}
        options={registrationTabOptions(t('documents'), 'document')} listeners={{ blur: showRegistrationErrors }} />
    </Tabs.Navigator>
  );
}

function MainDrawer() {
  const t = useTranslation();
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: visual.accent,
        drawerInactiveTintColor: visual.muted,
        drawerActiveBackgroundColor: visual.accentSoft,
        drawerStyle: styles.drawer,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: styles.drawerLabel,
        headerTintColor: visual.ink,
        headerTitleAlign: 'center',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: visual.surface },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: t('home'),
        drawerIcon: ({ color }) => <AppIcon name="home" color={color} /> }} />
      <Drawer.Screen
        name="Registration"
        component={RegistrationTabs}
        options={{ title: t('registration'), drawerIcon: ({ color }) => <AppIcon name="registration" color={color} /> }}
      />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: t('earnings'),
        drawerIcon: ({ color }) => <AppIcon name="earnings" color={color} /> }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: t('history'),
        drawerIcon: ({ color }) => <AppIcon name="history" color={color} /> }} />
      <Drawer.Screen name="Payment" component={PaymentScreen} options={{ title: t('payment'),
        drawerIcon: ({ color }) => <AppIcon name="payment" color={color} /> }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile'),
        drawerIcon: ({ color }) => <AppIcon name="person" color={color} /> }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings'),
        drawerIcon: ({ color }) => <AppIcon name="settings" color={color} /> }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: visual.surface, borderTopColor: visual.border, borderTopWidth: 1,
    paddingTop: 8, paddingBottom: 8, minHeight: 78 },
  tabItem: { paddingHorizontal: 2 },
  tabIcon: { width: 42, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activeTabIcon: { backgroundColor: visual.accentSoft },
  tabLabel: { color: visual.muted, fontSize: 11, lineHeight: 14, fontWeight: '600',
    textAlign: 'center', maxWidth: 118, marginTop: 3 },
  activeTabLabel: { color: visual.accent, fontWeight: '800' },
  drawer: { backgroundColor: visual.surface, width: 300 },
  drawerItem: { borderRadius: 14, marginHorizontal: 12, marginVertical: 3 },
  drawerLabel: { fontSize: 15, fontWeight: '700', marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
});

function TripStack() {
  const t = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="IncomingRequest" component={IncomingRequestScreen} options={{ title: t('incomingRequest') }} />
      <Stack.Screen name="TripPreview" component={TripPreviewScreen} options={{ title: t('trip') }} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ title: t('trip') }} />
      <Stack.Screen name="TripCompleted" component={TripCompletedScreen} options={{ title: t('tripSummary') }} />
      <Stack.Screen
        name="PaymentPreview"
        component={PaymentScreen}
        options={{ title: t('payment') }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const t = useTranslation();
  const { authLoading, sessionClosed } = useDriver();
  if (authLoading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator color={colors.primary} />
  </View>;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sessionClosed ? <Stack.Screen name="Login" component={LoginScreen} /> : <>
        <Stack.Screen name="MainDrawer" component={MainDrawer} />
        <Stack.Screen name="TripFlow" component={TripStack} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen}
          options={{ headerShown: true, title: t('historyDetail'), headerBackTitle: t('history'), headerTintColor: colors.text }} />
      </>}
    </Stack.Navigator>
  );
}
