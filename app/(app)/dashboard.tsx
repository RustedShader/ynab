import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    Image,
    Animated,
    Linking
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { finvu, TransactionEntity } from '@/interfaces/ynab_api';
import { Datum, FinanceNewsAPI } from "@/interfaces/finance_news_api";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Dashboard = () => {
    const router = useRouter();
    const [username, setUsername] = useState<string>('')
    const [api_key, setApiKey] = useState<string>('')
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [newsData, setNewsData] = useState<FinanceNewsAPI | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showBalance, setShowBalance] = useState(false);

    const chartConfig = {
        backgroundColor: 'transparent',
        backgroundGradientFrom: '#1a1a1a',
        backgroundGradientTo: '#1a1a1a',
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(130, 87, 229, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForLabels: {
            fontSize: 10,
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#8257e5"
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getSecureUserData();
            if (username && api_key) {
                await fetchUserData();
                await fetchLatestFinanceNews();
            }
        };
        fetchData();
    }, [username, api_key]);


    const getSecureUserData = async () => {
        const api_key = await AsyncStorage.getItem('api_key')
        const username = await AsyncStorage.getItem('username')
        if (api_key && username) {
            setUsername(username);
            setApiKey(api_key);
        }

    }

    const fetchUserData = async () => {
        try {
            const response = await fetch("https://api.ynab.in/get_user_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Username": username,
                    "X-API-Key": api_key
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData: finvu = await response.json();
            setAccountData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        }
        finally {
            if (!newsData) {
                setLoading(true);
            } else {
                setLoading(false)
            }
        }
    };

    const fetchLatestFinanceNews = async () => {
        try {
            const response = await fetch("https://api.ynab.in/get_latest_finance_news", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": api_key
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData: FinanceNewsAPI = await response.json();
            setNewsData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        }
        finally {
            setLoading(false);
        }
    }




    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <ActivityIndicator size="large" color="#8257e5" />
                <Text style={styles.loadingText}>Preparing your dashboard...</Text>
            </View>
        );
    }

    if (!accountData || !newsData) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <Ionicons name="alert-circle" size={48} color="#8257e5" />
                <Text style={styles.errorTitle}>Connection Error</Text>
                <Text style={styles.errorMessage}>Please check your connection and try again</Text>
            </View>
        );
    }

    const { Profile, Summary, Transactions } = accountData.Account;
    const { Holder } = Profile.Holders;

    const balance_data: { [id: string]: number } = {};
    Transactions.Transaction?.forEach((txn: TransactionEntity) => {
        const date = new Date(txn._valueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        balance_data[date] = Number(txn._currentBalance);
    });
    const formatAmount = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };


    const data = {
        labels: Object.keys(balance_data).slice(-7), // Show last 7 days
        datasets: [{
            data: Object.values(balance_data).slice(-7),
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 2
        }],
        legend: ["Account Balance"]
    };


    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={styles.gradientBackground}
            />
            <ScrollView style={styles.scrollView}>
                {/* Enhanced Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.headerTitle}>{username}</Text>
                        </View>
                        <Pressable style={styles.profileButton} onPress={() => router.navigate({pathname: '/profile'})}>
                            <LinearGradient
                                colors={['#8257e5', '#6833e4']}
                                style={styles.profileGradient}
                            >
                                <Ionicons name="person" size={24} color="#ffffff" />
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>

                {/* Enhanced Balance Card */}
                <View style={styles.balanceCardContainer}>
                    <BlurView intensity={20} tint="dark" style={styles.balanceCard}>
                        <LinearGradient
                            colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                            style={styles.balanceGradient}
                        >
                            <Text style={styles.balanceLabel}>Total Balance</Text>
                            <Pressable
                                onPress={() => setShowBalance(!showBalance)}
                                style={styles.balanceRow}
                            >
                                <Text style={styles.balanceAmount}>
                                    {showBalance ? formatAmount(Summary._currentBalance) : '••••••'}
                                </Text>
                                <Ionicons
                                    name={showBalance ? "eye-off" : "eye"}
                                    size={20}
                                    color="#8257e5"
                                />
                            </Pressable>
                            <View style={styles.balanceFooter}>
                                <Ionicons name="location" size={12} color="#8E8E93" />
                                <Text style={styles.accountInfo}>{Summary._branch}</Text>
                            </View>
                        </LinearGradient>
                    </BlurView>
                </View>

                {/* Enhanced Chart Section */}
                <View style={styles.chartContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Balance Trend</Text>
                        <Pressable
                            onPress={() => router.push({ pathname: "/graphs", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>View Details</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    <LineChart
                        data={data}
                        width={width - 65}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withHorizontalLines={true}
                        withVerticalLines={false}
                        withDots={true}
                        withShadow={false}
                        segments={5}
                    />
                </View>
                <View style={styles.transactionsContainer}>
                    <Text style={styles.sectionTitle}>Analyzed Data</Text>
                    <Pressable
                        onPress={() => router.push({ pathname: "/analysis", params: { username: username } })}
                        style={styles.seeAllButton}
                    >
                        <Text style={styles.seeAllText}>See All</Text>
                        <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                    </Pressable>
                </View>

                {/* Enhanced Transactions Section */}
                <View style={styles.transactionsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <Pressable
                            onPress={() => router.push({ pathname: "/transactions", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>See All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    {Transactions.Transaction?.slice(0, 5).map((txn: TransactionEntity, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [
                                styles.transactionItem,
                                pressed && styles.transactionPressed,
                                index !== 0 && styles.transactionBorder
                            ]}
                        >
                            <View style={styles.transactionIcon}>
                                <Ionicons
                                    name={txn._type == "CREDIT" ? "arrow-down" : "arrow-up"}
                                    size={20}
                                    color={txn._type == "CREDIT" ? "#4CAF50" : "#FF5252"}
                                />
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionNarration} numberOfLines={1}>
                                    {txn._narration}
                                </Text>
                                <Text style={styles.transactionDate}>
                                    {new Date(txn._transactionTimestamp).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={[
                                styles.amountText,
                                txn._type === "DEBIT" ? styles.outflowText : styles.inflowText
                            ]}>
                                {txn._type === "DEBIT" ? "-" : "+"}
                                {formatAmount(Number(txn._amount))}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Enhanced News Section */}
                <View style={styles.newsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Financial Updates</Text>
                    </View>
                    {newsData.data.slice(0, 3).map((d: Datum, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [
                                styles.newsItem,
                                pressed && styles.newsPressed,
                                index !== 0 && styles.newsBorder
                            ]}
                            onPress={() => Linking.openURL(d.url)}
                        >
                            <Image
                                source={{ uri: d.image_url }}
                                style={styles.newsImage}
                            />
                            <View style={styles.newsContent}>
                                <Text style={styles.newsTitle} numberOfLines={2}>
                                    {d.title}
                                </Text>
                                <Text style={styles.newsUrl} numberOfLines={1}>
                                    {d.url}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
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
    outflowText: {
        color: '#EF4444',
    },
    inflowText: {
        color: '#10B981',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    outflowBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    inflowBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    scrollView: {
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    errorMessage: {
        marginTop: 8,
        color: '#8E8E93',
        textAlign: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 38,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'capitalize'
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    profileGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceCardContainer: {
        marginHorizontal: 16,
        marginTop: -24,
    },
    balanceCard: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    balanceGradient: {
        padding: 24,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 8,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginRight: 12,
    },
    balanceFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    accountInfo: {
        fontSize: 14,
        color: '#8E8E93',
        marginLeft: 6,
    },
    chartContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        padding: 16,
        borderRadius: 24,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 14,
        color: '#8257e5',
        marginRight: 4,
    },
    transactionsContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        padding: 16,
        borderRadius: 24,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    transactionPressed: {
        opacity: 0.7,
    },
    transactionBorder: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(142, 142, 147, 0.1)',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionNarration: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    positiveAmount: {
        color: '#4CAF50',
    },
    negativeAmount: {
        color: '#FF5252',
    },
    newsContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        padding: 16,
        borderRadius: 24,
    },
    newsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    newsPressed: {
        opacity: 0.7,
        backgroundColor: 'rgba(130, 87, 229, 0.1)',
        borderRadius: 16,
    },
    newsBorder: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(142, 142, 147, 0.1)',
    },
    newsImage: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: 12,
    },
    newsContent: {
        flex: 1,
        marginRight: 12,
    },
    newsTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 4,
        lineHeight: 20,
    },
    newsUrl: {
        fontSize: 13,
        color: '#8E8E93',
    },
    // Quick Actions
    quickActionsContainer: {
        marginHorizontal: 16,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    quickActionButton: {
        width: '48%',
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    quickActionGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 16,
        opacity: 0.1,
    },
    quickActionContent: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
    },
    // Card Shadows
    cardShadow: {
        shadowColor: '#8257e5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    // Animations
    fadeIn: {
        opacity: 1,
        transform: [{ translateY: 0 }],
    },
    fadeOut: {
        opacity: 0,
        transform: [{ translateY: 20 }],
    },
});

// Add these helper components at the end of the file
// const QuickActionButton = ({ icon, title, onPress, gradient }) => (
//     <Pressable 
//         style={[styles.quickActionButton, styles.cardShadow]}
//         onPress={onPress}
//     >
//         <LinearGradient
//             colors={gradient}
//             style={styles.quickActionGradient}
//         />
//         <View style={styles.quickActionContent}>
//             <View style={styles.quickActionIcon}>
//                 <Ionicons name={icon} size={24} color="#8257e5" />
//             </View>
//             <Text style={styles.quickActionTitle}>{title}</Text>
//         </View>
//     </Pressable>
// );

// Add these functions for enhanced functionality
const getTransactionIcon = (amount: number, type: string) => {
    if (amount > 0) {
        return type === 'transfer' ? 'swap-horizontal' : 'arrow-down';
    }
    return type === 'transfer' ? 'swap-horizontal' : 'arrow-up';
};

const getTransactionColor = (amount: number) => {
    return amount > 0 ? '#4CAF50' : '#FF5252';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
};

// Add these custom hooks for animations if needed
const useSlideIn = (delay = 0) => {
    const [slideAnim] = useState(new Animated.Value(50));
    const [opacityAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return {
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
    };
};

// Add these utility functions
const formatDate = (date: string) => {
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleString('en-US');
};

const abbreviateNumber = (num: number) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
};

export default Dashboard;