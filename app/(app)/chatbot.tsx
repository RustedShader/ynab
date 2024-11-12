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

const api_url = "https://api.ynab.in"

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
      const response = await fetch(`${api_url}/chatbot`, {
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

      {/* Enhanced Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['rgba(130, 87, 229, 0.2)', 'rgba(104, 51, 228, 0.2)']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </LinearGradient>
        </Pressable>
        <Text style={styles.headerTitle}>AI Financial Assistant</Text>
        <Pressable style={styles.settingsButton}>
          <LinearGradient
            colors={['rgba(130, 87, 229, 0.2)', 'rgba(104, 51, 228, 0.2)']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="settings-outline" size={24} color="#ffffff" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeIcon}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#8257e5" />
          </View>
          <Text style={styles.welcomeTitle}>How can I help you today?</Text>
          <Text style={styles.welcomeSubtitle}>Ask me about your spending, savings goals, or financial advice</Text>
        </LinearGradient>
      </View>

      {/* Enhanced Chat List */}
      <FlatList
        data={chatMessages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <View style={[styles.chatBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
            {!item.isUser && (
              <View style={styles.botAvatarContainer}>
                <LinearGradient
                  colors={['#8257e5', '#6833e4']}
                  style={styles.botAvatar}
                >
                  <Ionicons name="chatbubble-ellipses" size={16} color="#ffffff" />
                </LinearGradient>
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              item.isUser ? styles.userBubbleContent : styles.botBubbleContent
            ]}>
              <Text style={[
                styles.chatText,
                item.isUser ? styles.userChatText : styles.botChatText
              ]}>{item.text}</Text>
              {item.isUser && (
                <View style={styles.messageStatus}>
                  <Text style={styles.timeText}>Just now</Text>
                  <Ionicons name="checkmark-done" size={16} color="#8257e5" />
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* Enhanced Input Area */}
      <BlurView intensity={20} tint="dark" style={styles.inputContainer}>
        <LinearGradient
          colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
          style={styles.inputGradient}
        >
          <Pressable style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#8257e5" />
          </Pressable>
          <TextInput
            style={styles.chatInput}
            value={userChat}
            onChangeText={setUserChat}
            placeholder="Type your message..."
            placeholderTextColor="#8E8E93"
            onSubmitEditing={fetchChatbotConversation}
            multiline
          />
          <Pressable
            style={[styles.sendButton, !userChat && styles.sendButtonDisabled]}
            onPress={fetchChatbotConversation}
            disabled={!userChat}
          >
            <LinearGradient
              colors={userChat ? ['#8257e5', '#6833e4'] : ['#3a3a3a', '#2a2a2a']}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </BlurView>

      {/* Loading Overlay */}
      {loading && (
        <BlurView intensity={30} tint="dark" style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#8257e5" />
            <Text style={styles.loadingText}>Processing your request...</Text>
          </View>
        </BlurView>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142, 142, 147, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  welcomeCard: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(130, 87, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  chatList: {
    padding: 16,
  },
  chatBubble: {
    flexDirection: 'row',
    marginVertical: 8,
    maxWidth: '80%',
  },
  botAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleContent: {
    borderRadius: 20,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  userBubbleContent: {
    backgroundColor: 'rgba(130, 87, 229, 0.2)',
    borderTopRightRadius: 4,
  },
  botBubbleContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderTopLeftRadius: 4,
  },
  chatText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userChatText: {
    color: '#ffffff',
  },
  botChatText: {
    color: '#ffffff',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  inputContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  attachButton: {
    padding: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatbotPage;
