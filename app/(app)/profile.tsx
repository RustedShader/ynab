import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet, Pressable, View } from "react-native";

const ProfilePage = () => {
  const [username, setUsername] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      await getSecureUserData();
    };
    fetchData();
  }, []);

  const getSecureUserData = async () => {
    const storedApiKey = await AsyncStorage.getItem("api_key");
    const storedUsername = await AsyncStorage.getItem("username");
    if (storedApiKey && storedUsername) {
      setApiKey(storedApiKey);
      setUsername(storedUsername);
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem("api_key");
    await AsyncStorage.removeItem("username");
    router.replace({ pathname: "/login" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{username}</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={logoutUser}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(130, 87, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  logoutButton: {
    backgroundColor: "rgba(130, 87, 229, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#8257e5",
    fontWeight: "bold",
  },
});

export default ProfilePage;