import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { finvu,TransactionEntity } from "@/interfaces/ynab_api";

const username = "dhaniya";

const TransactionsPage = () => {
    const [accountData, setAccountData] = useState<finvu | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
        );
    }


    if (!accountData) {
        return (
            <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#4F46E5" />
            <Text style={styles.errorTitle}>Unable to load account data</Text>
            <Text style={styles.errorMessage}>Please check your connection and try again</Text>
        </View>
        );
    }

    const { Profile, Summary, Transactions } = accountData.Account;
    const { Holder } = Profile.Holders;
 
    const balance_data: { [id: string]: number } = {};
    const inflow_data: {[id:string]: number} = {}
    const outflow_data: {[id:string]: number} = {} 
    const inflow_sender_data: {[id: string]: number} = {}
    const outflow_sender_data: {[id: string]: number }  = {}
    var total_money_outflow:  number = 0;
    var total_money_inflow: number = 0 ;

    Transactions.Transaction?.forEach((txn: TransactionEntity) => {
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

    let mostspentKey , mostspentValue = 0  ;
    for (const[key,value] of Object.entries(outflow_sender_data)){
        if (value > mostspentValue){
            mostspentValue = value;
            mostspentKey = key;
        }
    }
    let mostinflowKey , mostinflowValue = 0  ;
    for (const[key,value] of Object.entries(inflow_sender_data)){
        if (value > mostinflowValue){
            mostinflowValue = value;
            mostinflowKey = key;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
            ) : !accountData ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#4F46E5" />
                    <Text style={styles.errorTitle}>Unable to load account data</Text>
                    <Text style={styles.errorMessage}>Please check your connection and try again</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Financial Overview</Text>
                    </View>
                    
                    {/* Summary Cards */}
                    <View style={styles.balanceCardContainer}>
                        <View style={styles.summaryContainer}>
                            <View style={[styles.summaryCard, styles.outflowCard]}>
                                <Text style={styles.summaryLabel}>Money Outflow</Text>
                                <View style={styles.balanceRow}>
                                    <Text style={styles.summaryAmount}>₹{total_money_outflow}</Text>
                                </View>
                            </View>
                            
                            <View style={[styles.summaryCard, styles.inflowCard]}>
                                <Text style={styles.summaryLabel}>Money Inflow</Text>
                                <View style={styles.balanceRow}>
                                    <Text style={styles.summaryAmount}>₹{total_money_inflow}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
    
                    {/* Insights Card */}
                    <View style={styles.insightsContainer}>
                        <Text style={styles.sectionTitle}>Insights</Text>
                        <View style={styles.insightItem}>
                            <Text style={styles.insightLabel}>Highest Inflow</Text>
                            <Text style={styles.insightValue}>{mostinflowKey}</Text>
                            <Text style={[styles.insightAmount, styles.inflowText]}>₹{mostinflowValue}</Text>
                        </View>
                        <View style={[styles.insightItem, styles.insightBorder]}>
                            <Text style={styles.insightLabel}>Highest Outflow</Text>
                            <Text style={styles.insightValue}>{mostspentKey}</Text>
                            <Text style={[styles.insightAmount, styles.outflowText]}>₹{mostspentValue}</Text>
                        </View>
                    </View>
                    
                    {/* Recent Transactions */}
                    <View style={styles.transactionsContainer}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        {Transactions.Transaction?.map((txn: TransactionEntity, index) => (
                            <View
                                key={index} 
                                style={[
                                    styles.transactionItem,
                                    index !== 0 && styles.transactionBorder
                                ]}
                            >
                                <View style={styles.transactionLeft}>
                                    <Text style={[
                                        styles.transactionAmount,
                                        txn._type === "DEBIT" ? styles.outflowText : styles.inflowText
                                    ]}>
                                        {txn._type === "DEBIT" ? "-" : "+"}₹{txn._amount}
                                    </Text>
                                    <Text style={styles.transactionDate}>
                                        {new Date(txn._transactionTimestamp).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.transactionRight}>
                                    <Text style={styles.transactionNarration} numberOfLines={1}>
                                        {txn._narration}
                                    </Text>
                                    <Text style={[
                                        styles.transactionType,
                                        txn._type === "DEBIT" ? styles.outflowType : styles.inflowType
                                    ]}>
                                        {txn._type}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    )};
    
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
            // backgroundColor: '#111111',
            padding: 24,
            // borderBottomRightRadius: 24,
            // borderBottomLeftRadius: 24,
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
        insightsContainer: {
            margin: 16,
            padding: 20,
            backgroundColor: '#111111',
            borderRadius: 16,
            shadowColor: '#ffffff',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: 16,
        },
        insightItem: {
            marginVertical: 8,
            padding: 16,
            backgroundColor: '#1A1A1A',
            borderRadius: 12,
        },
        insightLabel: {
            fontSize: 13,
            color: '#888',
            marginBottom: 4,
        },
        insightValue: {
            fontSize: 16,
            color: '#ffffff',
            fontWeight: '600',
            marginBottom: 2,
        },
        insightAmount: {
            fontSize: 15,
            fontWeight: '500',
        },
        insightBorder: {
            marginTop: 12,
        },
        inflowText: {
            color: '#10B981',
        },
        outflowText: {
            color: '#EF4444',
        },
        transactionBorder: {
            borderTopWidth: 1,
            borderTopColor: '#333333',
        },
        transactionsContainer: {
            margin: 16,
            padding: 20,
            backgroundColor: '#111111',
            borderRadius: 16,
            shadowColor: '#ffffff',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        transactionItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 12,
            backgroundColor: '#1A1A1A',
            borderRadius: 12,
            marginBottom: 8,
        },
        transactionLeft: {
            flex: 1,
        },
        transactionRight: {
            flex: 2,
            paddingLeft: 16,
        },
        transactionAmount: {
            fontSize: 17,
            fontWeight: '600',
            marginBottom: 4,
        },
        transactionDate: {
            fontSize: 13,
            color: '#888',
        },
        transactionNarration: {
            fontSize: 15,
            color: '#ffffff',
            fontWeight: '500',
            marginBottom: 4,
        },
        transactionType: {
            fontSize: 12,
            fontWeight: '500',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            alignSelf: 'flex-start',
        },
        inflowType: {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
        },
        outflowType: {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
        }
    });
 

export default TransactionsPage;