import React from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, animatedValue]);
  
  const toggleBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#374151']
  });
  
  const toggleTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22]
  });
  
  const iconOpacity = {
    sun: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.3]
    }),
    moon: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1]
    })
  };
  
  return (
    <Pressable onPress={toggleTheme} style={styles.container}>
      <Animated.View style={[styles.track, { backgroundColor: toggleBackgroundColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX: toggleTranslateX }] }]} />
        
        <View style={styles.iconsContainer}>
          {/* Sun Icon */}
          <Animated.View style={[styles.iconContainer, { opacity: iconOpacity.sun }]}>
            <View style={styles.sunCenter} />
            <View style={[styles.sunRay, styles.ray0]} />
            <View style={[styles.sunRay, styles.ray1]} />
            <View style={[styles.sunRay, styles.ray2]} />
            <View style={[styles.sunRay, styles.ray3]} />
          </Animated.View>
          
          {/* Moon Icon */}
          <Animated.View style={[styles.iconContainer, styles.moonContainer, { opacity: iconOpacity.moon }]}>
            <View style={styles.moon} />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 56,
  },
  track: {
    width: 48,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  iconsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iconContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonContainer: {
    transform: [{ rotate: '-30deg' }],
  },
  sunCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#f59e0b',
    borderRadius: 1,
  },
  ray0: {
    top: -3,
    left: 6,
    transform: [{ rotate: '0deg' }],
  },
  ray1: {
    top: 1.5,
    right: -1,
    transform: [{ rotate: '90deg' }],
  },
  ray2: {
    bottom: -3,
    left: 6,
    transform: [{ rotate: '0deg' }],
  },
  ray3: {
    top: 1.5,
    left: -1,
    transform: [{ rotate: '90deg' }],
  },
  moon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f8fafc',
    shadowColor: '#f8fafc',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 2,
    elevation: 2,
  },
});