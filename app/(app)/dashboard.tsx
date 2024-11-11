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
import { YnabApi } from '@/interfaces/ynab_api';
import { Datum, FinanceNewsAPI } from "@/interfaces/finance_news_api";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TransactionApiResponse, TransactionResponse } from "@/interfaces/transaction_api";

const api_url = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get("window");

interface CategoryAnalysis {
    total: number;
    average: number;
    volatility: number;
    frequency: number;
}

interface ApiResponse {
    basic_metrics: {
        cash_inflow: number;
        cash_outflow: number;
        savings: number;
        savings_ratio: number;
    };
    transaction_extremes: {
        highest_expense: {
            amount: number;
            description: string;
            date: string;
            category: string;
        };
        lowest_transaction: {
            amount: number;
            description: string;
            date: string;
            category: string;
        };
    };
    advanced_metrics: {
        average_transaction_size: number;
        spending_velocity: number;
        category_spending: {
            [key: string]: number;
        };
        recurring_transactions: {
            [key: string]: number;
        };
    };
    predictive_analytics: {
        spending_trend: {
            direction: string,
            strength: number,
        }
    };

    seasonality: {
        daily_pattern: {
            Sunday: number,
            Wednesday: number,
            Monday: number,
            Saturday: number,
            Thursday: number,
            Friday: number,
            Tuesday: number
        }
    }
    financial_health: {
        overall_score: number;
        category_analysis: {
            [key: string]: CategoryAnalysis;
        };
    };
}


const Dashboard = () => {
    const router = useRouter();
    const [username, setUsername] = useState<string>('')
    const [api_key, setApiKey] = useState<string>('')
    const [accountData, setAccountData] = useState<YnabApi | null>(null);
    const [accountTransactionData, setAccountTransactonData] = useState<TransactionResponse | null>(null);
    const [newsData, setNewsData] = useState<FinanceNewsAPI | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showBalance, setShowBalance] = useState(false);
    const [analysisData, setAnalysisData] = useState<ApiResponse | null>(null);

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
                await fetchUserTransactionData();
                await fetchAnalysisData();
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

    const fetchUserTransactionData = async () => {
        try {
            const response = await fetch(`${api_url}/fetch_transactions`, {
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

            const responseData: TransactionResponse = await response.json();
            setAccountTransactonData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        }
        finally {
            if (!newsData && !accountData) {
                setLoading(true);
            } else {
                setLoading(false);
            }
        }
    };


    const fetchAnalysisData = async (): Promise<void> => {
        try {
            const response = await fetch(`${api_url}/user_financial_data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": api_key
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData: ApiResponse = await response.json();
            setAnalysisData(responseData);
        } catch (error) {
            console.error("Error fetching analysis data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${api_url}/get_user_data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": api_key
                },
            });

            if (!response.ok) {
                AsyncStorage.removeItem('api_key')
                AsyncStorage.removeItem('username')
                throw new Error(`HTTP error! status: ${response.status}`);

            }

            const responseData: YnabApi = await response.json();
            setAccountData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        }
        finally {
            if (!newsData && !accountTransactionData) {
                setLoading(true);
            } else {
                setLoading(false)
            }
        }
    };

    const fetchLatestFinanceNews = async () => {
        try {
            const response = await fetch(`${api_url}/get_latest_finance_news`, {
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

    accountTransactionData?.transactions
    const Profile = accountData
    const user_balance = accountTransactionData?.transactions[accountTransactionData?.transactions.length - 1]._currentBalance;

    const balance_data: { [id: string]: number } = {};
    accountTransactionData?.transactions?.forEach((txn: TransactionApiResponse) => {
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
                            <Text style={styles.headerTitle}>{Profile.username}</Text>
                        </View>
                        <Pressable style={styles.profileButton} onPress={() => router.navigate({ pathname: '/profile' })}>
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
                                    {showBalance ? formatAmount(Number(user_balance)) : '••••••'}
                                </Text>
                                <Ionicons
                                    name={showBalance ? "eye-off" : "eye"}
                                    size={20}
                                    color="#8257e5"
                                />
                            </Pressable>
                            <View style={styles.balanceFooter}>
                                <Ionicons name="location" size={12} color="#8E8E93" />
                                <Text style={styles.accountInfo}>{Profile.bank_branch}</Text>
                            </View>
                        </LinearGradient>
                    </BlurView>
                </View>

                {/* Enhanced Chart Section */}
                <View style={styles.chartContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Balance Trend</Text>
                        <Pressable
                            onPress={() => router.navigate({ pathname: "/graphs", params: { username: username } })}
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
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Analyzed Data</Text>
                        <Pressable
                            onPress={() => router.navigate({ pathname: "/analysis", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>See All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    <View style={styles.metricsContainer}>
                        <Pressable style={styles.metricCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.metricGradient}
                            >
                                <View style={styles.metricIcon}>
                                    <Ionicons name={analysisData?.predictive_analytics.spending_trend.direction === 'increasing' ? 'trending-up' : 'trending-down'} size={24} color="#8257e5" />
                                </View>
                                <Text style={styles.metricLabel}>Spending Trend</Text>
                                <Text style={styles.metricValue}>{analysisData?.basic_metrics.savings_ratio}%</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable style={styles.metricCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.metricGradient}
                            >
                                <View style={styles.metricIcon}>
                                    <Ionicons name="pie-chart" size={24} color="#8257e5" />
                                </View>
                                <Text style={styles.metricLabel}>Categories</Text>
                                <Text style={styles.metricValue}>10 Active</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>

                {/* Chatbot Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Chatbot Assistant</Text>
                        <Pressable
                            onPress={() => router.navigate({ pathname: "/chatbot", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>Chat Now</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    <Pressable style={styles.chatbotCard}>
                        <LinearGradient
                            colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                            style={styles.chatbotGradient}
                        >
                            <View style={styles.chatbotContent}>
                                <View style={styles.chatbotIcon}>
                                    <Ionicons name="chatbubble-ellipses" size={32} color="#8257e5" />
                                </View>
                                <Text style={styles.chatbotTitle}>Ask me anything about your finances</Text>
                                <Text style={styles.chatbotSubtitle}>Get instant insights and recommendations</Text>
                            </View>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Milestones and Goals Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Milestones & Goals</Text>
                        <Pressable
                            onPress={() => router.navigate({ pathname: "/milestone", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    <View style={styles.goalsContainer}>
                        <Pressable style={styles.goalCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.goalGradient}
                            >
                                <View style={styles.goalHeader}>
                                    <View style={styles.goalIcon}>
                                        <Ionicons name="car" size={24} color="#8257e5" />
                                    </View>
                                    <Text style={styles.goalProgress}>75%</Text>
                                </View>
                                <Text style={styles.goalTitle}>New Car</Text>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: '75%' }]} />
                                </View>
                                <Text style={styles.goalAmount}>₹ 15,000 / 20,000</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable style={styles.goalCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.goalGradient}
                            >
                                <View style={styles.goalHeader}>
                                    <View style={styles.goalIcon}>
                                        <Ionicons name="home" size={24} color="#8257e5" />
                                    </View>
                                    <Text style={styles.goalProgress}>40%</Text>
                                </View>
                                <Text style={styles.goalTitle}>House Down Payment</Text>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: '40%' }]} />
                                </View>
                                <Text style={styles.goalAmount}>₹ 20,000 / 50,000</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>

                {/* Enhanced Transactions Section */}
                <View style={styles.transactionsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <Pressable
                            onPress={() => router.navigate({ pathname: "/transactions", params: { username: username } })}
                            style={styles.seeAllButton}
                        >
                            <Text style={styles.seeAllText}>See All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#8257e5" />
                        </Pressable>
                    </View>
                    {accountTransactionData?.transactions.slice(0, 5).map((txn: TransactionApiResponse, index) => (
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
    sectionContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        padding: 16,
        borderRadius: 24,
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
    // Metrics styles
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    metricGradient: {
        padding: 16,
        alignItems: 'center',
    },
    metricIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    // Chatbot styles
    chatbotCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    chatbotGradient: {
        padding: 20,
    },
    chatbotContent: {
        alignItems: 'center',
    },
    chatbotIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    chatbotTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    chatbotSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
    // Goals styles
    goalsContainer: {
        gap: 12,
    },
    goalCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    goalGradient: {
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalProgress: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8257e5',
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(142, 142, 147, 0.2)',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8257e5',
        borderRadius: 2,
    },
    goalAmount: {
        fontSize: 14,
        color: '#8E8E93',
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


export default Dashboard;