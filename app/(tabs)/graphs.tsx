import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Text,
    SafeAreaView
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import { finvu , TransactionEntity } from "@/interfaces/ynab_api";

const { width } = Dimensions.get("window");
const username = "dhaniya";

const Graphs = () => {
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const commonChartConfig = {
        backgroundColor: '#111111',
        backgroundGradientFrom: '#111111',
        backgroundGradientTo: '#111111',
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForLabels: {
            fontSize: 12,
        },
        propsForVerticalLabels: {
            fontSize: 12,
        },
        propsForHorizontalLabels: {
            fontSize: 12,
        },
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/get_user_data", {
                method: "POST", // Changed to GET as per previous fix
                headers: {
                    "Content-Type": "application/json",
                    "Username": username,
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
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading your financial insights...</Text>
            </View>
        );
    }

    if (!accountData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={styles.errorTitle}>No account data available</Text>
                <Text style={styles.errorMessage}>Please check your connection and try again</Text>
            </View>
        );
    }

    const { Transactions } = accountData.Account;

    // Process data
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Graphical Overview</Text>
                </View>

                <View style={styles.chartSection}>
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Account Balance Trend</Text>
                        <Text style={styles.chartSubtitle}>Daily closing balance</Text>
                        <LineChart
                            data={balanceChartData}
                            width={width - 48}
                            height={220}
                            chartConfig={{
                                ...commonChartConfig,
                                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>

                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Daily Spending</Text>
                        <Text style={styles.chartSubtitle}>Total debits per day</Text>
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
                        />
                    </View>

                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Money Inflow</Text>
                        <Text style={styles.chartSubtitle}>Total credits per day</Text>
                        <LineChart
                            data={inflowChartData}
                            width={width - 48}
                            height={220}
                            chartConfig={{
                                ...commonChartConfig,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
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
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
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
        backgroundColor: '#000000',
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    errorMessage: {
        marginTop: 8,
        color: '#888',
        textAlign: 'center',
    },
    header: {
        padding: 24,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#f0f0f0',
        marginBottom: 4,
    },
    balanceCardContainer: {
        marginHorizontal: 16,
        marginTop: -24,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    summaryCard: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#111111',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    outflowCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#EF4444',
    },
    inflowCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#10B981',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        fontWeight: '500',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    chartSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    chartCard: {
        backgroundColor: '#111111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
});

export default Graphs;
