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

// Keep interfaces the same
interface CategoryCardProps {
    category: string;
    amount: number;
    average: number;
}

interface SpendingData {
    [key: string]: number;
}

const INDIAN_AVERAGES: SpendingData = {
    'ENTERTAINMENT': 1500,
    'FOOD': 8000,
    'LIFESTYLE': 3000,
    'EDUCATION': 5000,
    'SHOPPING': 3500,
    'ECOMMERCE': 2500,
    'TRAVEL': 2000,
    'UTILITIES': 4000,
    'SERVICES': 2000,
    'GENERAL': 3000,
    'UNCATEGORIZED': 1000
};

// Keep INDIAN_AVERAGES constant the same

const CategoryCard: React.FC<CategoryCardProps> = ({ category, amount, average }) => {
    const difference = amount - average;
    const percentageOver = ((difference / average) * 100).toFixed(1);
    const isOverspending = difference > 0;
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <BlurView intensity={20} tint="dark" style={styles.categoryCard}>
                <LinearGradient
                    colors={isOverspending 
                        ? ['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.1)']
                        : ['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.1)']}
                    style={styles.cardGradient}
                >
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryTitleContainer}>
                            <Text style={styles.categoryName}>{category}</Text>
                            <View style={[
                                styles.percentageBadge,
                                isOverspending ? styles.overspendingBadge : styles.savingBadge
                            ]}>
                                <Ionicons 
                                    name={isOverspending ? "trending-up" : "trending-down"} 
                                    size={16} 
                                    color={isOverspending ? "#ef4444" : "#10b981"}
                                />
                                <Text style={[
                                    styles.percentageText,
                                    isOverspending ? styles.overspendingText : styles.savingText
                                ]}>
                                    {Math.abs(Number(percentageOver))}%
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        
                        <View style={styles.amountsContainer}>
                            <View style={styles.amountColumn}>
                                <Text style={styles.amountLabel}>Your Spending</Text>
                                <Text style={[
                                    styles.amount,
                                    isOverspending ? styles.overspendingAmount : styles.savingAmount
                                ]}>
                                    ₹{amount.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.amountColumn}>
                                <Text style={styles.amountLabel}>Average</Text>
                                <Text style={styles.averageAmount}>
                                    ₹{average.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View style={[
                            styles.insightBox,
                            isOverspending ? styles.overspendingInsight : styles.savingInsight
                        ]}>
                            <Text style={styles.insightText}>
                                {isOverspending 
                                    ? `You're spending ₹${difference.toLocaleString()} more than average on ${category.toLowerCase()}. Consider reducing these expenses.`
                                    : `Great job! You're spending ₹${Math.abs(difference).toLocaleString()} less than average on ${category.toLowerCase()}.`
                                }
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </BlurView>
        </Animated.View>
    );
};

const AnalysisPage: React.FC = () => {
    const router = useRouter();
    const [accountTransactionData, setAccountTransactionData] = useState<TransactionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [username, setUsername]  = useState<string>('')
    const [api_key, setApiKey] = useState<string>('')

    // Keep calculation functions the same
    const calculateSpending = (transactions: any[]): SpendingData => {
        const spending: SpendingData = {
            'ENTERTAINMENT': 0,
            'FOOD': 0,
            'LIFESTYLE': 0,
            'EDUCATION': 0,
            'SHOPPING': 0,
            'ECOMMERCE': 0,
            'TRAVEL': 0,
            'UTILITIES': 0,
            'SERVICES': 0,
            'GENERAL': 0,
            'UNCATEGORIZED': 0
        };

        transactions?.forEach(t => {
            if (t._type === "DEBIT") {
                spending[t._transactionCategory] += Number(t._amount);
            }
        });

        return spending;
    };

    // Calculate total potential savings
    const calculateTotalSavings = (spending: SpendingData): number => {
        return Object.entries(spending).reduce((total, [category, amount]) => {
            const difference = amount - INDIAN_AVERAGES[category];
            return total + (difference > 0 ? difference : 0);
        }, 0);
    };


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
    if (api_key && username){
        setUsername(username);
        setApiKey(api_key);
    } 
    }

    const fetchUserTransactionData = async (): Promise<void> => {
        try {
            const response = await fetch("https://api.ynab.in/fetch_transactions", {
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
            setAccountTransactionData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        } finally {
            setLoading(false);
        }
    };


    const calculateMonthlySavings = (data: TransactionResponse) => {
        let total_money_inflow = 0;
        let total_money_outflow = 0;

        data.transactions?.forEach((txn: TransactionApiResponse) => {
            if (txn._type === "DEBIT") {
                total_money_outflow += Number(txn._amount);
            } else if (txn._type === "CREDIT") {
                total_money_inflow += Number(txn._amount);
            }
        });
        let savings = total_money_inflow - total_money_outflow;

        if (savings > 0) {
            return savings;
        }

        return 0;
    };

    useEffect(() => {
        const fetchData = async () => {
          await getSecureUserData();
          if (username && api_key) {
            await fetchUserTransactionData();
          }
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
                <Text style={styles.loadingText}>Analyzing your spending patterns...</Text>
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
                <Text style={styles.errorTitle}>Analysis Unavailable</Text>
                <Text style={styles.errorMessage}>Unable to analyze your spending patterns</Text>
            </View>
        );
    }

    const spending = calculateSpending(accountTransactionData.transactions);
    const totalPotentialSavings = calculateTotalSavings(spending);
    const monthlySavings = calculateMonthlySavings(accountTransactionData);

    const PeriodSelector = () => (
        <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map((period) => (
                <Pressable
                    key={period}
                    style={[
                        styles.periodButton,
                        selectedPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                >
                    <Text style={[
                        styles.periodButtonText,
                        selectedPeriod === period && styles.periodButtonTextActive
                    ]}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

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
                            <Text style={styles.headerTitle}>Spending Analysis</Text>
                        </View>
                        <PeriodSelector />
                    </View>


                     
                        <BlurView intensity={20} tint="dark" style={styles.savingsCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.savingsGradient}
                            >
                                <View style={styles.savingsHeader}>
                                    <View>
                                        <Text style={styles.savingsTitle}>Your Savings</Text>
                                        <Text style={styles.savingsAmount}>
                                            ₹{monthlySavings.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.savingsIcon}>
                                        <Ionicons name="wallet-outline" size={24} color="#8257e5" />
                                    </View>
                                </View>
                                <Text style={styles.savingsDescription}>
                                   You are saving this much monthly 
                                </Text>
                            </LinearGradient>
                        </BlurView>

                    {totalPotentialSavings > 0 && (
                        <BlurView intensity={20} tint="dark" style={styles.savingsCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.savingsGradient}
                            >
                                <View style={styles.savingsHeader}>
                                    <View>
                                        <Text style={styles.savingsTitle}>Potential Savings</Text>
                                        <Text style={styles.savingsAmount}>
                                            ₹{totalPotentialSavings.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.savingsIcon}>
                                        <Ionicons name="rocket" size={24} color="#8257e5" />
                                    </View>
                                </View>
                                <Text style={styles.savingsDescription}>
                                    You could save this amount monthly by optimizing your spending
                                </Text>
                            </LinearGradient>
                        </BlurView>
                    )}

                    <View style={styles.categoriesContainer}>
                        {Object.entries(spending).map(([category, amount]) => (
                            <CategoryCard
                                key={category}
                                category={category}
                                amount={amount}
                                average={INDIAN_AVERAGES[category]}
                            />
                        ))}
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
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(130, 87, 229, 0.1)',
        borderRadius: 12,
        padding: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    periodButtonActive: {
        backgroundColor: '#8257e5',
    },
    periodButtonText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: '#ffffff',
    },
    savingsCard: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    savingsGradient: {
        padding: 20,
    },
    savingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    savingsTitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    savingsAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    savingsIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(130, 87, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    savingsDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
    },
    categoriesContainer: {
        padding: 16,
    },
    categoryCard: {
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 20,
    },
    categoryHeader: {
        flex: 1,
    },
    categoryTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 16,
    },
    amountsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountColumn: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    amount: {
        fontSize: 20,
        fontWeight: '600',
    },
    averageAmount: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    overspendingAmount: {
        color: '#ef4444',
    },
    savingAmount: {
        color: '#10b981',
    },
    percentageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    overspendingBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    savingBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    overspendingText: {
        color: '#ef4444',
    },
    savingText: {
        color: '#10b981',
    },
    insightBox: {
        padding: 12,
        borderRadius: 12,
    },
    overspendingInsight: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    savingInsight: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
insightText: {
        fontSize: 14,
        color: '#ffffff',
        lineHeight: 20,
    },
    // Progress bar styles
    progressContainer: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    overspendingProgress: {
        backgroundColor: '#ef4444',
    },
    savingProgress: {
        backgroundColor: '#10b981',
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
    // Typography styles
    textSm: {
        fontSize: 12,
        lineHeight: 16,
    },
    textBase: {
        fontSize: 14,
        lineHeight: 20,
    },
    textLg: {
        fontSize: 16,
        lineHeight: 24,
    },
    textXl: {
        fontSize: 20,
        lineHeight: 28,
    },
    fontMedium: {
        fontWeight: '500',
    },
    fontSemibold: {
        fontWeight: '600',
    },
    fontBold: {
        fontWeight: 'bold',
    },
    // Colors
    textPrimary: {
        color: '#ffffff',
    },
    textSecondary: {
        color: '#8E8E93',
    },
    textSuccess: {
        color: '#10b981',
    },
    textDanger: {
        color: '#ef4444',
    },
    bgSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    bgDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    // Border styles
    roundedFull: {
        borderRadius: 9999,
    },
    roundedLg: {
        borderRadius: 12,
    },
    roundedXl: {
        borderRadius: 16,
    },
    // Padding styles
    p2: {
        padding: 8,
    },
    p4: {
        padding: 16,
    },
    px4: {
        paddingHorizontal: 16,
    },
    py2: {
        paddingVertical: 8,
    },
});

export default AnalysisPage;