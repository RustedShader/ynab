import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Text,
    SafeAreaView,
    Pressable,
    Animated
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import { finvu, TransactionEntity } from "@/interfaces/ynab_api";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Graphs = () => {
    const router = useRouter();
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [username, setUsername]  = useState<string>('')
    const [api_key, setApiKey] = useState<string>('')

    const commonChartConfig = {
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

    const getSecureUserData = async () => {
        const api_key = await AsyncStorage.getItem('api_key')
        const username = await AsyncStorage.getItem('username')
    if (api_key && username){
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
                throw new Error("Failed to fetch data");
            }

            const responseData: finvu = await response.json();
            setAccountData(responseData);
        } catch (error) {
            console.error("Error fetching account data:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
          await getSecureUserData();
          if (username && api_key) {
            await fetchUserData();
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
                <Text style={styles.loadingText}>Analyzing your financial data...</Text>
            </View>
        );
    }

    if (!accountData) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.gradientBackground}
                />
                <Ionicons name="alert-circle" size={48} color="#8257e5" />
                <Text style={styles.errorTitle}>Data Unavailable</Text>
                <Text style={styles.errorMessage}>Unable to load your financial data</Text>
            </View>
        );
    }
    const { Transactions } = accountData.Account;

    const balance_data: { [id: string]: number } = {};
    const spending_data: { [id: string]: number } = {};
    const inflow_data: { [id: string]: number } = {};

    Transactions.Transaction?.forEach((txn: TransactionEntity) => {
        const date = new Date(txn._valueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        balance_data[date] = Number(txn._currentBalance);

        if (txn._type === "DEBIT") {
            spending_data[date] = (spending_data[date] || 0) + Number(txn._amount);
        } else if (txn._type === "CREDIT") {
            inflow_data[date] = (inflow_data[date] || 0) + Number(txn._amount);
        }
    });

    // Prepare chart data
    const balanceChartData = {
        labels: Object.keys(balance_data).slice(-7), // Show last 7 days
        datasets: [{
            data: Object.values(balance_data).slice(-7),
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 2
        }],
        legend: ["Account Balance"]
    };

    const spendingChartData = {
        labels: Object.keys(spending_data).slice(-7),
        datasets: [{
            data: Object.values(spending_data).slice(-7),
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2
        }],
        legend: ["Daily Spending"]
    };

    const inflowChartData = {
        labels: Object.keys(inflow_data).slice(-7),
        datasets: [{
            data: Object.values(inflow_data).slice(-7),
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            strokeWidth: 2
        }],
        legend: ["Money Inflow"]
    };


    // ... (keeping data processing logic the same)

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
                            <Text style={styles.headerTitle}>Financial Analytics</Text>
                        </View>
                        <PeriodSelector />
                    </View>

                    <View style={styles.chartSection}>
                        <BlurView intensity={10} tint="dark" style={styles.chartCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(104, 51, 228, 0.1)']}
                                style={styles.chartGradient}
                            >
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartTitle}>Balance Trend</Text>
                                        <Text style={styles.chartSubtitle}>Daily closing balance</Text>
                                    </View>
                                    <View style={styles.chartBadge}>
                                        <Text style={styles.chartBadgeText}>Live</Text>
                                    </View>
                                </View>
                                <LineChart
                                    data={balanceChartData}
                                    width={width - 48}
                                    height={220}
                                    chartConfig={{
                                        ...commonChartConfig,
                                        color: (opacity = 1) => `rgba(130, 87, 229, ${opacity})`,
                                    }}
                                    bezier
                                    style={styles.chart}
                                    withHorizontalLines={true}
                                    withVerticalLines={false}
                                    withDots={true}
                                    withShadow={false}
                                    segments={5}
                                />
                            </LinearGradient>
                        </BlurView>

                        <BlurView intensity={20} tint="dark" style={styles.chartCard}>
                            <LinearGradient
                                colors={['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.1)']}
                                style={styles.chartGradient}
                            >
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartTitle}>Spending Analysis</Text>
                                        <Text style={styles.chartSubtitle}>Daily expenses</Text>
                                    </View>
                                </View>
                                <LineChart
                                    data={spendingChartData}
                                    width={width - 48}
                                    height={220}
                                    chartConfig={{
                                        ...commonChartConfig,
                                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                                    }}
                                    bezier
                                    style={styles.chart}
                                    withHorizontalLines={true}
                                    withVerticalLines={false}
                                    withDots={true}
                                    withShadow={false}
                                    segments={5}
                                />
                            </LinearGradient>
                        </BlurView>

                        <BlurView intensity={20} tint="dark" style={styles.chartCard}>
                            <LinearGradient
                                colors={['rgba(34, 197, 94, 0.1)', 'rgba(21, 128, 61, 0.1)']}
                                style={styles.chartGradient}
                            >
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartTitle}>Income Flow</Text>
                                        <Text style={styles.chartSubtitle}>Daily credits</Text>
                                    </View>
                                </View>
                                <LineChart
                                    data={inflowChartData}
                                    width={width - 48}
                                    height={220}
                                    chartConfig={{
                                        ...commonChartConfig,
                                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                                    }}
                                    bezier
                                    style={styles.chart}
                                    withHorizontalLines={true}
                                    withVerticalLines={false}
                                    withDots={true}
                                    withShadow={false}
                                    segments={5}
                                />
                            </LinearGradient>
                        </BlurView>
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
    chartSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    chartCard: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
    },
    chartGradient: {
        padding: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    chartBadge: {
        backgroundColor: 'rgba(130, 87, 229, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    chartBadgeText: {
        color: '#8257e5',
        fontSize: 12,
        fontWeight: '500',
    },
    chart: {
        borderRadius: 16,
        marginTop: 8,
    },
});

export default Graphs;