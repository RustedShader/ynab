import { StyleSheet } from "react-native";


export const loadingStyle = StyleSheet.create({
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
    }
});




export const analysisPageStyle = StyleSheet.create({
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
