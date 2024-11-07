import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Link } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const titleAnim = new Animated.Value(0);
  const buttonsAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.gradientBackground}
      />

      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#8257e5', '#6833e4']}
          style={styles.logoBackground}
        >
          <Ionicons name="wallet-outline" size={48} color="#ffffff" />
        </LinearGradient>
      </View>

      <Animated.View style={[styles.titleContainer, { opacity: titleAnim }]}>
        <Text style={styles.title}>Welcome to YNAB</Text>
        <Text style={styles.subtitle}>Your personal finance companion</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.buttonContainer,
          {
            opacity: buttonsAnim,
            transform: [{ translateY: buttonsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}]
          }
        ]}
      >
        <BlurView intensity={20} tint="dark" style={styles.buttonsBlur}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <LinearGradient
                colors={['#8257e5', '#6833e4']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </Link>

          <Link href="/create_account" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Welcome Screen Styles
  container: {
    paddingTop: 100,
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonsBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
  },
  secondaryButtonText: {
    color: '#8257e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
