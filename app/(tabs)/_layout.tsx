import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import TopBar from '@/components/common/TopBar';
import SnackBar from '@/components/common/SnackBar';
import { authGuard } from '@/lib/utils';
import { UserRole } from '@/lib/defines';
import { post_event } from '@/lib/mediator';

const botIconsProps = { size: 24 };

const TOPBAR_TITLE_MAP: Record<string, string> = {
  'home': 'House Rooms',
  'scenes': 'Smart Scenes',
  'stats': 'Devices Stats',
  'settings': 'System Settings',
  '': 'NONE',
};

export default function TabLayout() {
  const theme = useTheme();
  const { primary, background } = theme.colors;

  useEffect(() => authGuard(UserRole.USER), []);

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <TopBar />
      <SnackBar />
      <Tabs
        screenOptions={{ headerShown: false, tabBarActiveTintColor: primary, tabBarShowLabel: false, tabBarStyle: { backgroundColor: background } }}
        screenListeners={{
          tabPress: e => post_event('changeTopBarLabel', { newLabel: TOPBAR_TITLE_MAP[e.target?.split('-')[0] ?? ''] }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Feather name="home" color={color} {...botIconsProps} />,
          }}
        />
        <Tabs.Screen
          name="scenes"
          options={{
            title: 'Scenes',
            tabBarIcon: ({ color }) => <Feather name="moon" color={color} {...botIconsProps} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <Feather name="bar-chart" color={color} {...botIconsProps} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Feather name="settings" color={color} {...botIconsProps} />,
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}
