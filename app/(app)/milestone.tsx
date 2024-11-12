import { TransactionApiResponse, TransactionResponse } from "@/interfaces/transaction_api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert
} from "react-native";

const api_url = "https://api.ynab.in"
const MilestonePage = () => {
    const router = useRouter();
    const [accountTransactionData, setAccountTransactonData] = useState<TransactionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const [username, setUsername] = useState<string>('');
    const [api_key, setApiKey] = useState<string>('');
    const [goalAmount, setGoalAmount] = useState<number | null>(null);
    const [goalDescription, setGoalDescription] = useState<string>('');
    const [monthsToGoal, setMonthsToGoal] = useState<number | null>(null);
    const [monthlySavings, setMonthlySavings] = useState<number>(0);

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
            calculateMonthlySavings(responseData);
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

        setMonthlySavings(total_money_inflow - total_money_outflow);
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

    const calculateGoalTime = () => {
        if (goalAmount && monthlySavings > 0) {
            if (goalAmount > monthlySavings) {
                const months = Math.ceil(goalAmount / monthlySavings);
                setMonthsToGoal(months);
            } else {
                Alert.alert("Goal Achievement", "You can achieve this goal immediately with your current savings rate!");
            }
        } else {
            Alert.alert("Savings Alert", "Your monthly expenses exceed your income. Consider reviewing your budget.");
            setMonthsToGoal(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.gradientBackground} />
                <ActivityIndicator size="large" color="#8257e5" />
                <Text style={styles.loadingText}>Processing your financial data...</Text>
            </View>
        );
    }

    if (!accountTransactionData) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.gradientBackground} />
                <Ionicons name="alert-circle" size={48} color="#8257e5" />
                <Text style={styles.errorTitle}>Data Unavailable</Text>
                <Text style={styles.errorMessage}>Unable to load your financial information</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.gradientBackground} />
            <ScrollView style={styles.scrollView}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Pressable style={styles.backButton} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#ffffff" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Financial Goal</Text>
                        </View>
                    </View>

                    {/* Monthly Savings Summary */}
                    <View style={styles.summaryContainer}>
                        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
                            <LinearGradient
                                colors={['rgba(130, 87, 229, 0.1)', 'rgba(95, 61, 196, 0.1)']}
                                style={styles.cardGradient}
                            >
                                <Ionicons name="trending-up" size={24} color="#8257e5" />
                                <Text style={styles.summaryLabel}>Monthly Savings</Text>
                                <Text style={styles.summaryAmount}>
                                    {formatAmount(monthlySavings)}
                                </Text>
                            </LinearGradient>
                        </BlurView>
                    </View>

                    {/* Goal Input Section */}
                    <BlurView intensity={20} tint="dark" style={styles.goalInputContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Set Your Goal</Text>
                            <Ionicons name="flag" size={20} color="#8257e5" />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="cash-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                onChangeText={(text) => setGoalAmount(Number(text))}
                                placeholder="Enter target amount"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="create-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                onChangeText={setGoalDescription}
                                placeholder="What are you saving for?"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.calculateButton}
                            onPress={calculateGoalTime}
                        >
                            <Ionicons name="calculator-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                            <Text style={styles.calculateButtonText}>Calculate Timeline</Text>
                        </TouchableOpacity>
                    </BlurView>

                    {/* Goal Result Section */}
                    {monthsToGoal !== null && (
                        <BlurView intensity={20} tint="dark" style={styles.goalResultContainer}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.1)']}
                                style={styles.resultGradient}
                            >
                                <View style={styles.resultIconContainer}>
                                    <Ionicons name="time-outline" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.resultTitle}>Timeline Projection</Text>
                                <Text style={styles.resultText}>
                                    To reach your goal of {goalDescription ? `"${goalDescription}"` : "your savings goal"} ({formatAmount(goalAmount ?? 0)}),
                                    you'll need approximately {monthsToGoal} {monthsToGoal === 1 ? "month" : "months"} at your current savings rate.
                                </Text>
                            </LinearGradient>
                        </BlurView>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
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
    summaryContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    summaryCard: {
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    goalInputContainer: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        padding: 16,
        fontSize: 16,
    },
    calculateButton: {
        flexDirection: 'row',
        backgroundColor: '#8257e5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
    calculateButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    goalResultContainer: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    resultGradient: {
        padding: 20,
    },
    resultIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    resultText: {
        color: '#10B981',
        fontSize: 16,
        lineHeight: 24,
    },
});

export default MilestonePage;