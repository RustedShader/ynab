import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const api_url = process.env.EXPO_PUBLIC_API_URL;

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

const FinancialAnalysisPage: React.FC = () => {
    const router = useRouter();
    const [analysisData, setAnalysisData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [api_key, setApiKey] = useState<string>('');
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const getSecureUserData = async () => {
        const api_key = await AsyncStorage.getItem('api_key');
        const username = await AsyncStorage.getItem('username');
        if (api_key && username) {
            setUsername(username);
            setApiKey(api_key);
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

    useEffect(() => {
        const fetchData = async () => {
            await getSecureUserData();
            if (username && api_key) {
                await fetchAnalysisData();
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
                <MaterialCommunityIcons name="loading" size={48} color="#8257e5" />
                <Text style={styles.loadingText}>Analyzing your financial data...</Text>
            </View>
        );
    }

    if (!analysisData) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <Ionicons name="alert-circle" size={48} color="#8257e5" />
                <Text style={styles.errorTitle}>Analysis Unavailable</Text>
                <Text style={styles.errorMessage}>Unable to analyze your financial data</Text>
            </View>
        );
    }

    const {
        basic_metrics,
        transaction_extremes,
        advanced_metrics,
        financial_health
    } = analysisData;

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
                            <Text style={styles.headerTitle}>Financial Analysis</Text>
                        </View>
                    </View>

                    {/* Basic Metrics */}
                    <MetricCard
                        title="Cash Flow"
                        value={`₹${basic_metrics.cash_inflow.toLocaleString()}`}
                        subtitle={`Outflow: ₹${basic_metrics.cash_outflow.toLocaleString()}`}
                        icon="cash-outline"
                    />

                    <MetricCard
                        title="Savings"
                        value={`₹${basic_metrics.savings.toLocaleString()}`}
                        subtitle={`Savings ratio: ${basic_metrics.savings_ratio.toFixed(1)} % `}
                        icon="wallet-outline"
                    />

                    <MetricCard
                        title="Financial Health Score"
                        value={financial_health.overall_score.toFixed(1)}
                        subtitle={`Avg.transaction: ₹${advanced_metrics.average_transaction_size.toFixed(2)}`}
                        icon="pulse"
                    />
                    <MetricCard
                        title="Spending Velocity"
                        value={advanced_metrics.spending_velocity.toFixed(1)}
                        subtitle=''
                        icon="analytics-outline"
                    />
                    <MetricCard
                        title="Predictive Analytics"
                        value={advanced_metrics.spending_velocity.toFixed(1)}
                        subtitle={`Direction: ${analysisData.predictive_analytics.spending_trend.direction}`}
                        icon={analysisData.predictive_analytics.spending_trend.direction === 'increasing' ? 'trending-up-outline' : 'trending-down-outline'} />

                    {/* Transaction Extremes */}
                    <MetricCard
                        title="Highest Expense"
                        value={`₹${transaction_extremes.highest_expense.amount.toLocaleString()}`}
                        subtitle={transaction_extremes.highest_expense.description}
                        icon="arrow-up-circle-outline"
                    />

                    <MetricCard
                        title="Lowest Transaction"
                        value={`₹${transaction_extremes.lowest_transaction.amount.toLocaleString()}`}
                        subtitle={transaction_extremes.lowest_transaction.description}
                        icon="arrow-down-circle-outline"
                    />

                    {/* Category Analysis */}
                    <View style={styles.sectionTitle}>
                        <Text style={styles.sectionTitleText}>Category Analysis</Text>
                    </View>

                    {Object.entries(financial_health.category_analysis).map(([category, analysis]) => (
                        <CategoryCard
                            key={category}
                            category={category}
                            analysis={analysis}
                        />
                    ))}

                    {/* Recurring Transactions */}
                    <View style={styles.sectionTitle}>
                        <Text style={styles.sectionTitleText}>Recurring Transactions</Text>
                    </View>

                    {Object.entries(advanced_metrics.recurring_transactions).map(([description, amount]) => (
                        <RecurringTransactionCard
                            key={description}
                            description={description}
                            amount={amount}
                        />
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
}> = ({ title, value, subtitle, icon }) => (
    <BlurView intensity={20} tint="dark" style={styles.metricCard}>
        <LinearGradient
            colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
            style={styles.metricGradient}
        >
            <View style={styles.metricHeader}>
                <View style={styles.metricInfo}>
                    <Text style={styles.metricTitle}>{title}</Text>
                    <Text style={styles.metricValue}>{value}</Text>
                    <Text style={styles.metricSubtitle}>{subtitle}</Text>
                </View>
                <View style={styles.metricIcon}>
                    <Ionicons name={icon} size={32} color="#8257e5" />
                </View>
            </View>
        </LinearGradient>
    </BlurView>
);

const CategoryCard: React.FC<{
    category: string;
    analysis: CategoryAnalysis;
}> = ({ category, analysis }) => {
    const { total, average, frequency, volatility } = analysis;
    const difference = total - average;
    const percentageOver = ((difference / average) * 100).toFixed(1);
    const isOverspending = difference > 0;

    return (
        <BlurView intensity={20} tint="dark" style={styles.categoryCard}>
            <LinearGradient
                colors={
                    isOverspending
                        ? ['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.1)']
                        : ['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.1)']
                }
                style={styles.categoryGradient}
            >
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleContainer}>
                        <Text style={styles.categoryName}>{category}</Text>
                        <View
                            style={[
                                styles.percentageBadge,
                                isOverspending ? styles.overspendingBadge : styles.savingBadge,
                            ]}
                        >
                            <Ionicons
                                name={isOverspending ? 'trending-up' : 'trending-down'}
                                size={16}
                                color={isOverspending ? '#ef4444' : '#10b981'}
                            />
                            <Text
                                style={[
                                    styles.percentageText,
                                    isOverspending ? styles.overspendingText : styles.savingText,
                                ]}
                            >
                                {Math.abs(Number(percentageOver))}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.metricsContainer}>
                        <View style={styles.metricColumn}>
                            <Text style={styles.metricLabel}>Total Spending</Text>
                            <Text
                                style={[
                                    styles.metricValue,
                                    isOverspending ? styles.overspendingValue : styles.savingValue,
                                ]}
                            >
                                ₹{total.toLocaleString()}
                            </Text>
                            <Text style={styles.textSm}>{frequency} transactions</Text>
                        </View>
                        <View style={styles.metricColumn}>
                            <Text style={styles.metricLabel}>Average per Transaction</Text>
                            <Text style={styles.metricValue}>₹{average.toLocaleString()}</Text>
                            <Text style={styles.textSm}>
                                Volatility: {volatility.toFixed(1)}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.insightBox,
                            isOverspending ? styles.overspendingInsight : styles.savingInsight,
                        ]}
                    >
                        <Text style={styles.insightText}>
                            {isOverspending
                                ? `Your spending is ₹${difference.toLocaleString()} above your average in ${category.toLowerCase()}.`
                                : `Your spending is ₹${Math.abs(
                                    difference
                                ).toLocaleString()
                                } below your average in ${category.toLowerCase()}.`}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </BlurView>
    );
};

const RecurringTransactionCard: React.FC<{
    description: string;
    amount: number;
}> = ({ description, amount }) => (
    <BlurView intensity={20} tint="dark" style={styles.transactionCard}>
        <LinearGradient
            colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
            style={styles.transactionGradient}
        >
            <View style={styles.transactionHeader}>
                <Text style={styles.transactionTitle}>{description}</Text>
                <Pressable style={styles.filterIcon}>
                    <Ionicons name="filter" size={20} color="#8257e5" />
                </Pressable>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.transactionItem,
                    pressed && styles.transactionPressed,
                ]}
            >
                <View style={[styles.transactionIcon, styles.outflowIcon]}>
                    <Ionicons name="arrow-up" size={20} color="#EF4444" />
                </View>

                <View style={styles.transactionDetails}>
                    <Text style={styles.transactionNarration} numberOfLines={1}>
                        {description}
                    </Text>
                </View>

                <View style={styles.transactionAmount}>
                    <Text style={styles.amountText}>₹{amount.toLocaleString()}</Text>
                    <View style={styles.transactionBadge}>
                        <Text style={styles.badgeText}>Recurring</Text>
                    </View>
                </View>
            </Pressable>
        </LinearGradient>
    </BlurView>

);

const styles = StyleSheet.create({
    metricCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    metricGradient: {
        padding: 16,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricInfo: {
        flex: 1,
    },
    metricTitle: {
        fontSize: 16,
        color: '#e5e7eb',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    metricSubtitle: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 4,
    },
    metricIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    transactionGradient: {
        padding: 16,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    filterIcon: {
        padding: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    transactionPressed: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    outflowIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    transactionDetails: {
        flex: 1,
    },
    transactionNarration: {
        fontSize: 16,
        color: '#ffffff',
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    transactionBadge: {
        marginTop: 4,
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        color: '#8257e5',
    },
    categoryCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoryGradient: {
        padding: 16,
    },
    categoryHeader: {},
    categoryTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    percentageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    overspendingBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    savingBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    percentageText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
    },
    overspendingText: {
        color: '#ef4444',
    },
    savingText: {
        color: '#10b981',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginVertical: 12,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricColumn: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 14,
        color: '#e5e7eb',
        marginBottom: 4,
    },
    overspendingValue: {
        color: '#ef4444',
    },
    savingValue: {
        color: '#10b981',
    },
    textSm: {
        fontSize: 12,
        color: '#e5e7eb',
    },
    insightBox: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
    },
    overspendingInsight: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    savingInsight: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    insightText: {
        fontSize: 14,
        color: '#ffffff',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    metricColumnFlex: {
        flex: 1,
    },
    transactionsContainer: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    transactionDate: {
        fontSize: 13,
        color: '#8E8E93',
    },

    outflowBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 0,
    },
    recurringTransactionHeaderFlex: {
        flexGrow: 1,
        flexShrink: 1,
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
    sectionTitle: {
        marginVertical: 24,
        paddingHorizontal: 16,
    },
    sectionTitleText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },


    recurringTransactionCard: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    recurringTransactionGradient: {
        padding: 20,
    },
    recurringTransactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recurringTransactionDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    recurringTransactionAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8257e5',
    },

    metricDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
    },

    averageValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default FinancialAnalysisPage;
