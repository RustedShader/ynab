import React, { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const api_url = "https://api.ynab.in"

// Define proper interfaces
export interface CreateAccountResponseInterface {
  message: string;
}

interface InputFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  maxLength,
  onFocus,
  onBlur
}) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={20} color="#8E8E93" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#8E8E93"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry && !showPassword}
      keyboardType={keyboardType}
      autoCapitalize="none"
      maxLength={maxLength}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    {showPasswordToggle && (
      <TouchableOpacity onPress={onTogglePassword} style={styles.passwordToggle}>
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#8E8E93"
        />
      </TouchableOpacity>
    )}
  </View>
);

const CreateAccount: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    emailId: "",
    mobileNumber: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Use useRef for animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  // Handle keyboard visibility and animations
  useEffect(() => {
    const handleKeyboardShow = () => {
      setKeyboardVisible(true);
      // Platform-specific opacity handling
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

    // Web-specific focus handlers
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

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const { username, password, confirmPassword, emailId, mobileNumber } = formData;

    if (!username || !password || !emailId || !mobileNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return false;
    }

    return true;
  };

  const createAccount = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${api_url}/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "username": formData.username,
          "password": formData.password,
          "email_id": formData.emailId,
          "mobile_number": formData.mobileNumber
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: CreateAccountResponseInterface = await response.json();
      if (responseData.message == "user_created") {
        Alert.alert("Created Account", "Account Created Succesfully !");
        router.push({
          pathname: "/login",
        });
      }
      else {
        Alert.alert("Error", "Failed to create account. Please try again.");
        router.back()
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
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
        <Text style={styles.loadingText}>Creating your account...</Text>
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
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us to manage your finances</Text>

              <View style={styles.inputContainer}>
                <InputField
                  icon="person-outline"
                  placeholder="Username"
                  value={formData.username}
                  onChangeText={handleInputChange("username")}
                />

                <InputField
                  icon="mail-outline"
                  placeholder="Email"
                  value={formData.emailId}
                  onChangeText={handleInputChange("emailId")}
                  keyboardType="email-address"
                />

                <InputField
                  icon="call-outline"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChangeText={handleInputChange("mobileNumber")}
                  keyboardType="numeric"
                  maxLength={10}
                />

                <InputField
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={handleInputChange("password")}
                  secureTextEntry
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <InputField
                  icon="lock-closed-outline"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={handleInputChange("confirmPassword")}
                  secureTextEntry
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={createAccount}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8257e5', '#6833e4']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.createButtonText}>Create Account</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Welcome Screen Styles
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
  scrollContainerKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 60,
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

  // Create Account Screen Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
  },
  inputContainer: {
    gap: 16,
    marginTop: 32,
    marginBottom: 24,
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
  createButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#8257e5',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateAccount;