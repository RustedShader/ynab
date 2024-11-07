import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Pressable, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface accountLinkedApiResponse {
  message: string;
}

interface BankData {
  [id: string]: string;
}

const LinkAccount = () => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername]  = useState<string>('')
  const [api_key, setApiKey] = useState<string>('')
 
  const getSecureUserData = async () => {
    const api_key = await AsyncStorage.getItem('api_key')
    const username = await AsyncStorage.getItem('username')
if (api_key && username){
    setUsername(username);
    setApiKey(api_key);
} 
}

  const linkBankAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.ynab.in/link_bank_account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Username: username,
          "X-API-Key": api_key
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: accountLinkedApiResponse = await response.json();
        if (responseData.message === "bank_account_linked") {
          router.push({
            pathname: "/login",
          });
        }
    } catch (error) {
      console.error("Error fetching account data:", error);
      Alert.alert("Authentication Failed", "Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };


  const bank_data: BankData = {
    "Axis Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/axis_bank_logo.png",
    "Bank of Baroda": "https://cdn-kqwjkkg45njv.vultrcdn.com/bank_of_baroda_bank_logo.png",
    "Canara Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/canra_bank_logo.png",
    "HDFC Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/hdfc_bank_logo.png",
    "ICICI Bank Limited": "https://cdn-kqwjkkg45njv.vultrcdn.com/icici_bank_logo.png",
    "IDFC First Bank Limited": "https://cdn-kqwjkkg45njv.vultrcdn.com/idfc_bank_logo.png",
    "Indian Overseas Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/indian_overseas_bank_logo.png",
    "Kotak Mahindra Bank Limited": "https://cdn-kqwjkkg45njv.vultrcdn.com/kotak_bank_logo.png",
    "Punjab National Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/pnb_bank_logo.png",
    "RBL Bank Limited": "https://cdn-kqwjkkg45njv.vultrcdn.com/rbl_bank_logo.png",
    "South Indian Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/south_indian_bank_logo.png",
    "State Bank of India": "https://cdn-kqwjkkg45njv.vultrcdn.com/state_bank_of_india_logo.png",
    "Union Bank of India": "https://cdn-kqwjkkg45njv.vultrcdn.com/union_bank_logo.png",
    "Yes Bank": "https://cdn-kqwjkkg45njv.vultrcdn.com/yes_bank_logo.png"
  };

  useEffect( () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await getSecureUserData();
    };
    fetchData();
  }, [username,api_key]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.gradientBackground}
        />
        <ActivityIndicator size="large" color="#8257e5" />
        <Text style={styles.loadingText}>Linking Your Bank Account ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.gradientBackground}
      />
      <ScrollView style={styles.scrollView}>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              </Pressable>
            </View>
          </View>

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

            <Text style={styles.title}>Your Bank Account is not Linked</Text>
            <Text style={styles.subtitle}>Please link your bank account</Text>

            <View style={styles.bankListContainer}>
              {Object.entries(bank_data).map(([bankName, logoUrl]) => (
                <View key={bankName} style={styles.bankItem}>
                  <Image source={{ uri: logoUrl }} style={styles.bankLogo} />
                  <Text style={styles.bankName}>{bankName}</Text>
                  <BouncyCheckbox
                    size={24}
                    fillColor="#8257e5"
                    unFillColor="#FFFFFF"
                    onPress={(isChecked: boolean) => {
                      setSelectedBank(isChecked ? bankName : null);
                    }}
                    isChecked={selectedBank === bankName}
                    style={styles.checkbox}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
                style={styles.loginButton}
                onPress={linkBankAccount}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8257e5', '#6833e4']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Link Bank Account</Text>
                </LinearGradient>
              </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  gradientBackground: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  bankListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 24,
  },
  bankItem: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    width: '40%',
    maxWidth: 150,
    justifyContent: 'center',
  },
  bankLogo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  checkbox: {
    marginTop: 8,
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
  header: {
    padding: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 8,
    marginLeft: 8
  },
});

export default LinkAccount;