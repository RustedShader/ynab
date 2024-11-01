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