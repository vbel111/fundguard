# FundGuard 🛡️

> A mobile-first Web3 governance and budget transparency platform that empowers local communities to track public funds, vote on proposals, and verify project milestones.

[![Web3Auth](https://img.shields.io/badge/Web3Auth-v9.0.0-blue)](https://web3auth.io/)
[![Polygon](https://img.shields.io/badge/Polygon-Amoy-purple)](https://polygon.technology/)

## 🌟 Features

- **🔐 Email/Social Login**: No MetaMask required - seamless Web3Auth integration
- **🗳️ Proposal Voting**: Community-driven decision making on fund allocation
- **💰 Budget Tracking**: Real-time view of project budgets and spending
- **✅ Milestone Verification**: Citizen verification before fund release
- **🤖 Smart Fund Release**: Automated fund distribution via smart contracts
- **🏆 Civic Points System**: Earn reputation tokens for participation
- **📱 Mobile-First UI**: Responsive design optimized for smartphones
- **🌐 Web2-like UX**: Familiar authentication with Web3 backend

## 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/fundguard.git
   cd fundguard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Deploy Smart Contract**
   - Follow the detailed guide in [`contracts/DEPLOYMENT.md`](contracts/DEPLOYMENT.md)
   - Deploy to Polygon Amoy Testnet using Remix IDE
   - Update the contract address in `js/app.js`

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Test the Platform**
   - Sign in with email (no MetaMask required!)
   - Create proposals and vote
   - Verify milestones and earn civic points

## 📚 Documentation

- **[🚀 Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[🔐 Authentication Guide](AUTH_GUIDE.md)** - Web3Auth integration details
- **[📄 Deployment Guide](contracts/DEPLOYMENT.md)** - Smart contract deployment

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web3**: Ethers.js, Web3Auth v9.0.0
- **Blockchain**: Solidity, OpenZeppelin, Polygon Amoy
- **UI/UX**: Mobile-first responsive design, Chart.js
- **Authentication**: Web3Auth (email/social login)

## 🏗️ Project Structure

```
fundguard/
├── index.html          # Main application page
├── styles/
│   └── main.css        # All styles (mobile-first responsive)
├── js/
│   └── app.js          # Main application logic
├── contracts/
│   └── FundGuard.sol   # Smart contracts
└── assets/
    ├── icons/          # UI icons
    ├── mockups/        # Design mockups
    └── images/         # Project images
```

## 🔧 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Blockchain**: Solidity, Polygon (Amoy Testnet)
- **Web3**: Ethers.js, Web3Modal
- **Visualization**: Chart.js
- **Development**: Remix IDE for smart contracts

## 📱 Mobile-First Design

FundGuard is designed with mobile users in mind, featuring:
- Touch-friendly interface
- Responsive layouts
- Optimized for small screens
- Fast loading times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

