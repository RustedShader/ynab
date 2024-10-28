import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    SafeAreaView
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';


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
    _amount: string;
    _currentBalance: string;
    _narration: string;
    _valueDate: string;
    _transactionTimestamp: string;
}

const { width } = Dimensions.get("window");
const username = "dhaniya";

const Dashboard = () => {
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showBalance, setShowBalance] = useState(false);
    const navigation = useNavigation<NavigationProp<any>>();

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForLabels: {
            fontSize: 10,
        },
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/get_user_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Username": username,
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
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </View>
        );
    }

    if (!accountData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={styles.errorTitle}>Unable to load account data</Text>
                <Text style={styles.errorMessage}>Please check your connection and try again</Text>
            </View>
        );
    }

    const { Profile, Summary, Transactions } = accountData.Account;
    const { Holder } = Profile.Holders;

    const balance_data: { [id: string]: number } = {};
    Transactions.Transaction?.forEach((txn: TransactionEntity) => {
        balance_data[txn._valueDate] = Number(txn._currentBalance);
    });

    const data = {
        labels: Object.keys(balance_data).slice(-5),
        datasets: [{
            data: Object.values(balance_data).slice(-5),
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 2
        }],
        legend: ["Balance Trend"]
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Hi, {Holder._name} !</Text>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCardContainer}>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                        <Pressable
                            onPress={() => setShowBalance(!showBalance)}
                            style={styles.balanceRow}
                        >
                            <Text style={styles.balanceAmount}>
                                {showBalance ? `₹${Summary._currentBalance}` : '••••••'}
                            </Text>
                            <Ionicons
                                name={showBalance ? "eye-off" : "eye"}
                                size={20}
                                color="#4b5563"
                            />
                        </Pressable>
                        <Text style={styles.accountInfo}>{Summary._branch} • AC xxxxx</Text>
                    </View>
                </View>

                {/* Balance Trend Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Balance Trend</Text>
                    <Pressable onPress={() => navigation.navigate('graphs')}>
                        <LineChart
                            data={data}
                            width={width - 48}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </Pressable>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsContainer}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {Transactions.Transaction?.slice(0, 5).map((txn: TransactionEntity, index) => (
                        <View
                            // key={txn._txnId} 
                            style={[
                                styles.transactionItem,
                                index !== 0 && styles.transactionBorder
                            ]}
                        >
                            <View>
                                <Text style={styles.transactionAmount}>₹{txn._amount}</Text>
                                <Text style={styles.transactionDate}>
                                    {new Date(txn._transactionTimestamp).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={styles.transactionNarration} numberOfLines={1}>
                                {txn._narration}
                            </Text>
                        </View>
                    ))}
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    balanceCardContainer: {
        marginHorizontal: 16,
        marginTop: -24,
    },
    balanceCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginRight: 8,
    },
    accountInfo: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    chartContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    chart: {
        borderRadius: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        marginBottom: 16,
    },
    transactionsContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    transactionBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111',
    },
    transactionDate: {
        fontSize: 12,
        color: '#666',
    },
    transactionNarration: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        marginLeft: 16,
    },
    tipsContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        marginBottom: 32,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tipItem: {
        paddingVertical: 12,
    },
    tipBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111',
        marginBottom: 4,
    },
    tipDescription: {
        fontSize: 14,
        color: '#666',
    },
});

export default Dashboard;