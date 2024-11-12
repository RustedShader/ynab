import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";


const api_url = "https://api.ynab.in"
const { width, height } = Dimensions.get('window');

export interface LoginResponseInterface {
  message: string;
  user_account_linked: boolean;
  api_key: string;
}

const Login = () => {
  const router = useRouter();
  const [isUserVerified, setUserVerified] = useState<boolean>(false);
  const [isBankAccountLinked, setBankAccountLinked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  // Use useRef for animation values to prevent recreating them on each render
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakingAnimation = useRef(new Animated.Value(0)).current;

  // Handle initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    const handleKeyboardShow = () => {
      setKeyboardVisible(true);
      // Adjust opacity based on platform
      if (Platform.OS === 'web') {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    const handleKeyboardHide = () => {
      setKeyboardVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    // Add web-specific focus handlers
    if (Platform.OS === 'web') {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('focus', handleKeyboardShow);
        input.addEventListener('blur', handleKeyboardHide);
      });

      return () => {
        inputs.forEach(input => {
          input.removeEventListener('focus', handleKeyboardShow);
          input.removeEventListener('blur', handleKeyboardHide);
        });
      };
    }

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // Handle navigation based on verification
  useEffect(() => {
    if (isUserVerified) {
      if (isBankAccountLinked) {
        router.replace({
          pathname: "/dashboard",
          params: { username: username },
        });
      } else {
        router.replace({
          pathname: "/link_account",
          params: { username: username },
        });
      }
    }
  }, [isUserVerified, isBankAccountLinked]);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakingAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakingAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loginUser = async () => {
    if (!username || !password) {
      shakeAnimation();
      Alert.alert("Invalid Input", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${api_url}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Username: username,
          Password: password,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: LoginResponseInterface = await response.json();
      if (responseData.message === "user_verified") {
        await AsyncStorage.setItem('api_key', responseData.api_key);
        await AsyncStorage.setItem('username', username);
        setBankAccountLinked(responseData.user_account_linked);
        setUserVerified(true);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      Alert.alert("Authentication Failed", "Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.gradientBackground}
        />
        <ActivityIndicator size="large" color="#8257e5" />
        <Text style={styles.loadingText}>Verifying your credentials...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.gradientBackground}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            isKeyboardVisible && styles.scrollContainerKeyboard
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.loginContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakingAnimation }
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push({ pathname: '/' })}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8257e5', '#6833e4']}
                  style={styles.logoBackground}
                >
                  <Ionicons name="wallet-outline" size={40} color="#ffffff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to access your account</Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#8E8E93"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#8E8E93"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={loginUser}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8257e5', '#6833e4']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginLeft: 10
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  scrollContainerKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#8257e5',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;