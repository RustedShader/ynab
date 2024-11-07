export interface TransactionResponse {
    transactions: TransactionApiResponse[]
}

export interface TransactionApiResponse {
    _type: string;
    _mode: string;
    _amount: string;
    _currentBalance: string;
    _transactionTimestamp: string;
    _valueDate: string;
    _narration: string;
    _reference: string;
    _transactionCategory: string;
}
