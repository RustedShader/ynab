import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { TransactionApiResponse, TransactionResponse } from "@/interfaces/transaction_api";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";
const api_url = process.env.EXPO_PUBLIC_API_URL;

const TransactionsPage = () => {
    const router = useRouter();
    const [accountTransactionData, setAccountTransactonData] = useState<TransactionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [username, setUsername] = useState<string>('')
    const [api_key, setApiKey] = useState<string>('')

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);


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
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await getSecureUserData();
            if (username && api_key) {
                await fetchUserTransactionData();
            }
        };
        fetchData();
    }, [username, api_key]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <ActivityIndicator size="large" color="#8257e5" />
                <Text style={styles.loadingText}>Processing transactions...</Text>
            </View>
        );
    }

    if (!accountTransactionData) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <Ionicons name="alert-circle" size={48} color="#8257e5" />
                <Text style={styles.errorTitle}>Transaction Data Unavailable</Text>
                <Text style={styles.errorMessage}>Unable to load your transactions</Text>
            </View>
        );
    }



    const balance_data: { [id: string]: number } = {};
    const inflow_data: { [id: string]: number } = {}
    const outflow_data: { [id: string]: number } = {}
    const inflow_sender_data: { [id: string]: number } = {}
    const outflow_sender_data: { [id: string]: number } = {}
    var total_money_outflow: number = 0;
    var total_money_inflow: number = 0;



    accountTransactionData.transactions?.forEach((txn: TransactionApiResponse) => {
        const date = new Date(txn._valueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        balance_data[date] = Number(txn._currentBalance);

        if (txn._type === "DEBIT") {
            total_money_outflow += Number(txn._amount);
            outflow_data[date] = (outflow_data[date] || 0) + Number(txn._amount);
            outflow_sender_data[txn._narration] = (outflow_sender_data[txn._narration] || 0) + Number(txn._amount)
        } else if (txn._type === "CREDIT") {
            total_money_inflow += Number(txn._amount);
            inflow_data[date] = (inflow_data[date] || 0) + Number(txn._amount);
            inflow_sender_data[txn._narration] = (inflow_sender_data[txn._narration] || 0) + Number(txn._amount)
        }
    });

    let mostspentKey, mostspentValue = 0;
    for (const [key, value] of Object.entries(outflow_sender_data)) {
        if (value > mostspentValue) {
            mostspentValue = value;
            mostspentKey = key;
        }
    }
    let mostinflowKey, mostinflowValue = 0;
    for (const [key, value] of Object.entries(inflow_sender_data)) {
        if (value > mostinflowValue) {
            mostinflowValue = value;
            mostinflowKey = key;
        }
    }
    // const FilterButton = ({ title , value }) => (
    //     <Pressable
    //         style={[
    //             styles.filterButton,
    //             activeFilter === value && styles.filterButtonActive
    //         ]}
    //         onPress={() => setActiveFilter(value)}
    //     >
    //         <Text style={[
    //             styles.filterButtonText,
    //             activeFilter === value && styles.filterButtonTextActive
    //         ]}>
    //             {title}
    //         </Text>
    //     </Pressable>
    // );

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };


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
                            <Text style={styles.headerTitle}>Transactions</Text>
                        </View>

                        {/* Transaction Filters */}
                        {/* <View style={styles.filterContainer}>
                            <FilterButton title="All" value="all" />
                            <FilterButton title="Income" value="credit" />
                            <FilterButton title="Expenses" value="debit" />
                        </View> */}
                    </View>

                    {/* Summary Cards */}
                    <View style={styles.summaryContainer}>
                        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
                            <LinearGradient
                                colors={['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.1)']}
                                style={styles.cardGradient}
                            >
                                <Ionicons name="arrow-up" size={24} color="#EF4444" />
                                <Text style={styles.summaryLabel}>Money Out</Text>
                                <Text style={styles.summaryAmount}>
                                    {formatAmount(total_money_outflow)}
                                </Text>
                            </LinearGradient>
                        </BlurView>

                        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.1)']}
                                style={styles.cardGradient}
                            >
                                <Ionicons name="arrow-down" size={24} color="#10B981" />
                                <Text style={styles.summaryLabel}>Money In</Text>
                                <Text style={styles.summaryAmount}>
                                    {formatAmount(total_money_inflow)}
                                </Text>
                            </LinearGradient>
                        </BlurView>
                    </View>

                    {/* Insights Section */}
                    <BlurView intensity={20} tint="dark" style={styles.insightsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quick Insights</Text>
                            <Ionicons name="flash" size={20} color="#8257e5" />
                        </View>

                        <View style={styles.insightItem}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.1)']}
                                style={styles.insightGradient}
                            >
                                <View style={styles.insightHeader}>
                                    <Text style={styles.insightLabel}>Highest Income</Text>
                                    <Ionicons name="trending-up" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.insightValue}>{mostinflowKey}</Text>
                                <Text style={[styles.insightAmount, styles.inflowText]}>
                                    {formatAmount(mostinflowValue)}
                                </Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.insightItem}>
                            <LinearGradient
                                colors={['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.1)']}
                                style={styles.insightGradient}
                            >
                                <View style={styles.insightHeader}>
                                    <Text style={styles.insightLabel}>Highest Expense</Text>
                                    <Ionicons name="trending-down" size={20} color="#EF4444" />
                                </View>
                                <Text style={styles.insightValue}>{mostspentKey}</Text>
                                <Text style={[styles.insightAmount, styles.outflowText]}>
                                    {formatAmount(mostspentValue)}
                                </Text>
                            </LinearGradient>
                        </View>
                    </BlurView>

                    {/* Transactions List */}
                    <BlurView intensity={20} tint="dark" style={styles.transactionsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Transactions</Text>
                            <Pressable style={styles.filterIcon}>
                                <Ionicons name="filter" size={20} color="#8257e5" />
                            </Pressable>
                        </View>

                        {accountTransactionData.transactions
                            ?.filter(txn => activeFilter === 'all' || txn._type.toLowerCase() === activeFilter)
                            .map((txn: TransactionApiResponse, index) => (
                                <Pressable
                                    key={index}
                                    style={({ pressed }) => [
                                        styles.transactionItem,
                                        pressed && styles.transactionPressed
                                    ]}
                                >
                                    <View style={[
                                        styles.transactionIcon,
                                        txn._type === "DEBIT" ? styles.outflowIcon : styles.inflowIcon
                                    ]}>
                                        <Ionicons
                                            name={txn._type === "DEBIT" ? "arrow-up" : "arrow-down"}
                                            size={20}
                                            color={txn._type === "DEBIT" ? "#EF4444" : "#10B981"}
                                        />
                                    </View>

                                    <View style={styles.transactionDetails}>
                                        <Text style={styles.transactionNarration} numberOfLines={1}>
                                            {txn._narration}
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {new Date(txn._transactionTimestamp).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </View>

                                    <View style={styles.transactionAmount}>
                                        <Text style={[
                                            styles.amountText,
                                            txn._type === "DEBIT" ? styles.outflowText : styles.inflowText
                                        ]}>
                                            {txn._type === "DEBIT" ? "-" : "+"}
                                            {formatAmount(Number(txn._amount))}
                                        </Text>
                                        <View style={[
                                            styles.transactionBadge,
                                            txn._type === "DEBIT" ? styles.outflowBadge : styles.inflowBadge
                                        ]}>
                                            <Text style={[
                                                styles.badgeText,
                                                txn._type === "DEBIT" ? styles.outflowText : styles.inflowText
                                            ]}>
                                                {txn._type}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                    </BlurView>
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
    balanceGradient: {
        padding: 24,
    },
    gradientBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
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
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(130, 87, 229, 0.1)',
        borderRadius: 12,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: '#8257e5',
    },
    filterButtonText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#ffffff',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 16,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginVertical: 8,
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    insightsContainer: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    insightItem: {
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    insightGradient: {
        padding: 16,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    insightLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    insightValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    insightAmount: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    transactionsContainer: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    filterIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(130, 87, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
    },
    transactionPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: [{ scale: 0.98 }],
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    outflowIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    inflowIcon: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    transactionDetails: {
        flex: 1,
        marginRight: 12,
    },
    transactionNarration: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 13,
        color: '#8E8E93',
    },
    transactionAmount: {
        alignItems: 'flex-end',
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
    outflowText: {
        color: '#EF4444',
    },
    inflowText: {
        color: '#10B981',
    },
    // Animation styles
    fadeIn: {
        opacity: 1,
        transform: [{ translateY: 0 }],
    },
    fadeOut: {
        opacity: 0,
        transform: [{ translateY: 20 }],
    },
    // Card shadows
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
    // Additional utility styles
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spaceBetween: {
        justifyContent: 'space-between',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    mt16: {
        marginTop: 16,
    },
    mb16: {
        marginBottom: 16,
    },
    ml8: {
        marginLeft: 8,
    },
    mr8: {
        marginRight: 8,
    }
});

export default TransactionsPage;