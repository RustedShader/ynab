import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, View, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from "expo-router";

interface ChatMessage {
  isUser: boolean;
  text: string;
}

interface ChatbotResponse {
  response: string;
}

const ChatbotPage = () => {
  const [username, setUsername] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userChat, setUserChat] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      await getSecureUserData();
      setLoading(false);
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

  const fetchChatbotConversation = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.ynab.in/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Username: username,
          chat: JSON.stringify([userChat]),
          "X-API-Key": apiKey,
        },
        body: JSON.stringify([userChat]),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: ChatbotResponse = await response.json();
      setChatMessages([...chatMessages, { isUser: true, text: userChat }, { isUser: false, text: responseData.response }]);
      setUserChat("");
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.gradientBackground} />

      <FlatList
        data={chatMessages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatList}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Chatbot</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.chatBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={styles.chatText}>{item.text}</Text>
          </View>
        )}
      />

      <BlurView intensity={20} tint="dark" style={styles.chatContainer}>
        <TextInput
          style={styles.chatInput}
          value={userChat}
          onChangeText={setUserChat}
          placeholder="Enter your message"
          placeholderTextColor="#8E8E93"
          onSubmitEditing={fetchChatbotConversation}
        />
        <Pressable style={styles.sendButton} onPress={fetchChatbotConversation}>
          <Ionicons name="send" size={24} color="#8257e5" />
        </Pressable>
      </BlurView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8257e5" />
          <Text style={styles.loadingText}>Fetching response...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chatList: {
    padding: 16,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  userBubble: {
    backgroundColor: 'rgba(130, 87, 229, 0.2)',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: 16,
    color: '#ffffff',
  },
  chatContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingHorizontal: 16,
  },
  sendButton: {
    padding: 12,
    borderRadius: 24,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ChatbotPage;
