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
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';


// Define TypeScript interfaces for the API response
export interface finvu {
    Account: Account;
}

export interface Account {
    Profile: Profile;
    Summary: Summary;
    Transactions: Transactions;
    _maskedAccNumber: string;
    _type: string;
}

export interface Profile {
    Holders: Holders;
}

export interface Holders {
    Holder: Holder;
}

export interface Holder {
    _name: string;
    _dob: string;
    _mobile: string;
    _email: string;
    _pan: string;
}

export interface Summary {
    _currentBalance: string;
    _currency: string;
    _ifscCode: string;
    _branch: string;
    _openingDate: string;
    _status: string;
}

export interface Transactions {
    Transaction?: TransactionEntity[] | null;
    _startDate: string;
    _endDate: string;
}

export interface TransactionEntity {
    _txnId: string;
    _type: string;
    _amount: string;
    _currentBalance: string;
    _narration: string;
    _valueDate: string;
    _transactionTimestamp: string;
}

const { width } = Dimensions.get("window");
const username = "dhaniya";

const Graphs = () => {
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation<NavigationProp<any>>();

    const commonChartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#6366f1"
        },
        propsForLabels: {
            fontSize: 10,
        },
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
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
                    <Text style={styles.headerTitle}>Financial Analytics</Text>
                    <Text style={styles.headerSubtitle}>Last 7 days overview</Text>
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
                                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
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
                                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
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
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#ef4444',
    },
    errorMessage: {
        marginTop: 8,
        color: '#666',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#6366f1',
        padding: 24,
        borderBottomRightRadius: 24,
        borderBottomLeftRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    chartSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    chartCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
});

export default Graphs;
