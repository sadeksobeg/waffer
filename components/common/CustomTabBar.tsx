import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Route, NavigationState, SceneRendererProps } from 'react-native-tab-view';

type Props<T extends Route> = SceneRendererProps & {
  navigationState: NavigationState<T>;
  style?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  activeColor?: string;
  inactiveColor?: string;
  labelStyle?: StyleProp<TextStyle>;
};

export default function CustomTabBar<T extends Route>({
  navigationState,
  position,
  jumpTo,
  style,
  indicatorStyle,
  activeColor = '#000',
  inactiveColor = '#888',
  labelStyle,
}: Props<T>) {
  return (
    <View style={[styles.tabBar, style]}>
      {navigationState.routes.map((route, i) => {
        const isActive = i === navigationState.index;
        const color = isActive ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={`tab-${i}`}
            style={styles.tabItem}
            onPress={() => jumpTo(route.key)}
          >
            <Text style={[styles.label, labelStyle, { color }]}>
              {route.title}
            </Text>
            {isActive && <View style={[styles.indicator, indicatorStyle]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 48,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '80%',
    backgroundColor: '#000',
  },
});
