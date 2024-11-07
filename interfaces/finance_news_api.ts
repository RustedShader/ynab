export interface FinanceNewsAPI {
    meta: Meta;
    data: Datum[];
}

export interface Datum {
    uuid:            string;
    title:           string;
    description:     string;
    keywords:        string;
    snippet:         string;
    url:             string;
    image_url:       string;
    language:        "en";
    published_at:    Date;
    source:          string;
    relevance_score: null;
    entities:        Entity[];
    similar?:        Datum[];
}

export interface Entity {
    symbol:          string;
    name:            string;
    exchange:        null;
    exchange_long:   null;
    country:         Country;
    type:            Type;
    industry:        Industry;
    match_score:     number;
    sentiment_score: number;
    highlights:      Highlight[];
}

export enum Country {
    Ar = "ar",
    In = "in",
}

export interface Highlight {
    highlight:      string;
    sentiment:      number;
    highlighted_in: HighlightedIn;
}

export enum HighlightedIn {
    MainText = "main_text",
    Title = "title",
}

export enum Industry {
    BasicMaterials = "Basic Materials",
    CommunicationServices = "Communication Services",
    ConsumerCyclical = "Consumer Cyclical",
    ConsumerDefensive = "Consumer Defensive",
    Energy = "Energy",
    FinancialServices = "Financial Services",
    Healthcare = "Healthcare",
    Industrials = "Industrials",
    NA = "N/A",
    RealEstate = "Real Estate",
    Technology = "Technology",
    Utilities = "Utilities",
}

export enum Type {
    Equity = "equity",
    Index = "index",
}

export interface Meta {
    found:    number;
    returned: number;
    limit:    number;
    page:     number;
}
