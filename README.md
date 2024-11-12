# Welcome to YNAB (You Need A Budget!) 👋

Your personalized finance and expense tracking app.

YNAB is designed to help you manage your finances with ease, track expenses, and set budgeting goals. Built with a React Native frontend and a FastAPI backend, it delivers a smooth experience across devices. This project uses [Expo](https://expo.dev), created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 📖 System Architecture and Design

The YNAB app is built with a scalable, secure architecture using Vultr’s cloud services. Here’s an overview:

- **Frontend**: React Native, using Expo for flexibility in testing and deployment.
- **Backend**: FastAPI, hosted on a Vultr Cloud Compute instance with access through [https://api.ynab.in](https://api.ynab.in).
- **Database**: MySQL on Vultr for efficient data management.
- **Load Balancing**: Vultr Load Balancer optimizes API traffic and enhances performance.
- **Serverless Computing**: Vultr Serverless powers LLM models (llama2-13b-chat-Q5_K_M, zephyr-7b-beta-Q5_K_M) used in chatbot and transaction categorization.
- **CDN**: Vultr Push CDN serves images and CSS assets for fast loading.
- **Security**: Vultr Firewall (configured with UFW) secures API endpoints, with bcrypt for password hashing, and JWT for user authentication.
- **Token Management**: Each user receives a secure API token stored in Async Storage and backed up in the database.
- **Financial News**: The Marketaux Financial News API provides real-time financial updates.
- **Finvu API Emulation**: Currently using sample data from Finvu's documentation while awaiting API access for live bank data integration.

## 🛠️ Key Modules and Technologies

- **Frontend**: React Native with Expo Go for mobile app development.
- **Backend**: FastAPI for API management.
- **Database**: MySQL on Vultr.
- **Serverless API**: Vultr Serverless for AI and NLP processing.
- **Security**: bcrypt for password encryption, JWT for session management, UFW for firewall protection.
- **AI & NLP**: LangChain, with Vultr Serverless, powers the chatbot and categorization features.

## 🚀 Get Started

### Testing

You can try out the app's demo at [ynab.in](https://ynab.in) to explore its features firsthand.

Alternatively, to test the app on your mobile device with the Expo Go app, scan the QR code displayed in the Expo CLI output.

### Prerequisites

- **System Requirements**: Node.js (LTS version recommended)
- **Supported Platforms**: macOS, Windows (PowerShell or WSL 2), and Linux

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/RustedShader/ynab && cd ynab
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the App**

   ```bash
   npx expo start
   ```

   The Expo CLI will provide options to open the app in:
   - [Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) for a quick sandbox experience.

You can start developing by editing files in the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 📜 API Endpoints

Base URL: [https://api.ynab.in](https://api.ynab.in)

Repo URL: [https://github.com/RustedShader/ynab_api](https://github.com/RustedShader/ynab_api)

| Endpoint               | Description                                   |
|------------------------|-----------------------------------------------|
| `/Create_user`         | Creates a new user account                    |
| `/Link_bank_account`   | Links a bank account to the user's profile    |
| `/Login`               | Authenticates a user and issues a token       |
| `/Get_latest_finance_news` | Retrieves the latest financial news    |
| `/Create_user_data`    | Adds user-specific data entries               |
| `/Chatbot`             | Accesses the financial chatbot for queries    |
| `/Fetch_transactions`  | Retrieves transaction history                 |
| `/Get_user_data`       | Retrieves stored user data                    |

For further details, see the [API documentation](https://api.ynab.in/docs).

## ⚙️ Setup and Usage Instructions

Refer to the Expo documentation for additional setup and environment configuration.

### Testing

Easily test the app on your mobile device by scanning the QR code in the Expo CLI output with the Expo Go app.

## 🛡️ Security and Privacy

- **Password Encryption**: User passwords are encrypted with base64 and further hashed using bcrypt, ensuring robust security.
- **Token Management**: Each user session is secured with JWT tokens, stored locally in Async Storage.

Thank you for using YNAB!
