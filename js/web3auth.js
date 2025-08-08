// Web3Auth Integration for FundGuard
// Provides seamless email/social login with hidden blockchain wallet management

class FundGuardWeb3Auth {
    constructor() {
        this.web3auth = null;
        this.provider = null;
        this.userInfo = null;
        this.isInitialized = false;
        this.currentStep = 0;
    }

    // Initialize Web3Auth
    async init() {
        try {
            console.log('Checking for Web3Auth availability...');
            
            // Wait a bit more for libraries to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Log all available globals for debugging
            const allGlobals = Object.keys(window);
            console.log('Total globals:', allGlobals.length);
            const web3Globals = allGlobals.filter(key => 
                key.toLowerCase().includes('web3') || 
                key.toLowerCase().includes('modal') ||
                key.toLowerCase().includes('ethereum')
            );
            console.log('Web3-related globals:', web3Globals);
            
            // Try multiple possible global variable names
            let Web3Auth, EthereumPrivateKeyProvider;
            
            // Check different possible global structures
            if (window.Web3AuthModal && window.Web3AuthModal.Web3Auth) {
                Web3Auth = window.Web3AuthModal.Web3Auth;
                console.log('Found Web3Auth in Web3AuthModal');
            } else if (window.Modal && window.Modal.Web3Auth) {
                Web3Auth = window.Modal.Web3Auth;
                console.log('Found Web3Auth in Modal');
            } else if (window.Web3Auth) {
                Web3Auth = window.Web3Auth;
                console.log('Found Web3Auth directly');
            } else {
                console.error('Web3Auth not found. Available:', web3Globals);
                throw new Error('Web3Auth library not loaded');
            }
            
            if (window.EthereumProvider && window.EthereumProvider.EthereumPrivateKeyProvider) {
                EthereumPrivateKeyProvider = window.EthereumProvider.EthereumPrivateKeyProvider;
                console.log('Found EthereumPrivateKeyProvider in EthereumProvider');
            } else if (window.EthereumPrivateKeyProvider) {
                EthereumPrivateKeyProvider = window.EthereumPrivateKeyProvider;
                console.log('Found EthereumPrivateKeyProvider directly');
            } else {
                console.error('EthereumPrivateKeyProvider not found');
                throw new Error('EthereumPrivateKeyProvider not loaded');
            }

            console.log('Web3Auth class:', Web3Auth);
            console.log('EthereumPrivateKeyProvider class:', EthereumPrivateKeyProvider);

            // Configure the Ethereum provider
            const chainConfig = {
                chainNamespace: "eip155",
                chainId: "0x13881", // Mumbai Testnet
                rpcTarget: "https://rpc-mumbai.maticvigil.com/",
                displayName: "Polygon Mumbai Testnet",
                blockExplorer: "https://mumbai.polygonscan.com/",
                ticker: "MATIC",
                tickerName: "Matic"
            };

            const privateKeyProvider = new EthereumPrivateKeyProvider({
                config: { chainConfig }
            });

            // Initialize Web3Auth
            this.web3auth = new Web3Auth({
                clientId: "BAASE-1rT9PwqAiP9A21WCKEKJzjhi5iHSDK34w5xcB0ZgA5ciE_A9oG-rPeAChtyEu-CbtqIDk-mhKVwqfHIc0", // Your production client ID
                web3AuthNetwork: "sapphire_devnet", // Use sapphire_devnet for development
                chainConfig,
                privateKeyProvider,
                uiConfig: {
                    appName: "FundGuard",
                    appUrl: window.location.origin,
                    logoLight: "https://web3auth.io/images/web3authlog.png",
                    logoDark: "https://web3auth.io/images/web3authlogodark.png",
                    defaultLanguage: "en",
                    mode: "light",
                    theme: {
                        primary: "#2563eb"
                    }
                }
            });

            await this.web3auth.initModal();
            this.isInitialized = true;
            
            console.log("Web3Auth initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize Web3Auth:", error);
            return false;
        }
    }

    // Check if user is already logged in
    async checkExistingSession() {
        if (!this.isInitialized) return false;
        
        if (this.web3auth.connected) {
            this.provider = this.web3auth.provider;
            this.userInfo = await this.web3auth.getUserInfo();
            return true;
        }
        return false;
    }

    // Login with email (passwordless)
    async loginWithEmail(email) {
        try {
            if (!this.isInitialized) {
                throw new Error("Web3Auth not initialized");
            }

            this.updateSetupStep(1);
            
            const web3authProvider = await this.web3auth.connect({
                verifier: "emailpasswordless",
                verifierId: email,
                loginParams: {
                    domain: window.location.origin,
                    verifierId: email,
                }
            });

            this.updateSetupStep(2);

            if (web3authProvider) {
                this.provider = web3authProvider;
                this.userInfo = await this.web3auth.getUserInfo();
                
                this.updateSetupStep(3);
                
                return {
                    success: true,
                    userInfo: this.userInfo,
                    provider: this.provider
                };
            }
        } catch (error) {
            console.error("Email login failed:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Login with Google
    async loginWithGoogle() {
        try {
            if (!this.isInitialized) {
                throw new Error("Web3Auth not initialized");
            }

            this.updateSetupStep(1);
            
            const web3authProvider = await this.web3auth.connect({
                verifier: "google",
                verifierId: "google"
            });

            this.updateSetupStep(2);

            if (web3authProvider) {
                this.provider = web3authProvider;
                this.userInfo = await this.web3auth.getUserInfo();
                
                this.updateSetupStep(3);
                
                return {
                    success: true,
                    userInfo: this.userInfo,
                    provider: this.provider
                };
            }
        } catch (error) {
            console.error("Google login failed:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Login with Discord
    async loginWithDiscord() {
        try {
            if (!this.isInitialized) {
                throw new Error("Web3Auth not initialized");
            }

            this.updateSetupStep(1);
            
            const web3authProvider = await this.web3auth.connect({
                verifier: "discord",
                verifierId: "discord"
            });

            this.updateSetupStep(2);

            if (web3authProvider) {
                this.provider = web3authProvider;
                this.userInfo = await this.web3auth.getUserInfo();
                
                this.updateSetupStep(3);
                
                return {
                    success: true,
                    userInfo: this.userInfo,
                    provider: this.provider
                };
            }
        } catch (error) {
            console.error("Discord login failed:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get ethers signer
    async getSigner() {
        if (!this.provider) {
            throw new Error("No provider available");
        }

        const ethersProvider = new ethers.BrowserProvider(this.provider);
        return await ethersProvider.getSigner();
    }

    // Get user's wallet address
    async getAddress() {
        const signer = await this.getSigner();
        return await signer.getAddress();
    }

    // Get user info
    getUserInfo() {
        return this.userInfo;
    }

    // Logout
    async logout() {
        try {
            if (this.web3auth.connected) {
                await this.web3auth.logout();
            }
            this.provider = null;
            this.userInfo = null;
            this.currentStep = 0;
            return true;
        } catch (error) {
            console.error("Logout failed:", error);
            return false;
        }
    }

    // Check if connected
    isConnected() {
        return this.web3auth && this.web3auth.connected;
    }

    // Update setup progress UI
    updateSetupStep(step) {
        this.currentStep = step;
        
        // Update UI to show progress
        const steps = document.querySelectorAll('.step');
        steps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (index === step - 1) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
    }

    // Get balance (for funding display)
    async getBalance() {
        try {
            if (!this.provider) return "0";
            
            const ethersProvider = new ethers.BrowserProvider(this.provider);
            const signer = await ethersProvider.getSigner();
            const address = await signer.getAddress();
            const balance = await ethersProvider.getBalance(address);
            
            return ethers.formatEther(balance);
        } catch (error) {
            console.error("Failed to get balance:", error);
            return "0";
        }
    }

    // Request test funds helper
    async requestTestFunds() {
        const address = await this.getAddress();
        
        // Open Mumbai faucet
        const faucetUrl = `https://faucet.polygon.technology/`;
        window.open(faucetUrl, '_blank');
        
        return {
            success: true,
            message: `Test funds requested for ${address}`,
            address: address,
            faucetUrl: faucetUrl
        };
    }

    // Sign transaction (automatically handled by Web3Auth)
    async signTransaction(transaction) {
        try {
            const signer = await this.getSigner();
            return await signer.sendTransaction(transaction);
        } catch (error) {
            console.error("Transaction failed:", error);
            throw error;
        }
    }

    // Get private key (if needed for advanced features)
    async getPrivateKey() {
        try {
            if (!this.provider) {
                throw new Error("No provider available");
            }
            
            return await this.provider.request({
                method: "eth_private_key"
            });
        } catch (error) {
            console.error("Failed to get private key:", error);
            throw error;
        }
    }

    // Export wallet information
    async exportWallet() {
        try {
            const address = await this.getAddress();
            const balance = await this.getBalance();
            
            return {
                address: address,
                balance: balance + " MATIC",
                network: "Polygon Mumbai Testnet",
                userInfo: this.userInfo
            };
        } catch (error) {
            console.error("Failed to export wallet:", error);
            throw error;
        }
    }
}

// Global instance
window.fundGuardAuth = new FundGuardWeb3Auth();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Web3Auth...');
    
    // Add a longer delay to ensure all scripts are loaded
    setTimeout(async () => {
        try {
            const initialized = await window.fundGuardAuth.init();
            
            if (initialized) {
                console.log('Web3Auth ready for use');
                
                // Check for existing session
                const hasSession = await window.fundGuardAuth.checkExistingSession();
                if (hasSession) {
                    console.log('Found existing session, auto-connecting...');
                    // Trigger auto-login in main app
                    if (window.handleAutoLogin) {
                        window.handleAutoLogin();
                    }
                }
            } else {
                console.error('Failed to initialize Web3Auth');
                alert('Failed to initialize authentication system. Please refresh the page.');
            }
        } catch (error) {
            console.error('Web3Auth initialization error:', error);
            alert('Failed to load authentication system. Please check your internet connection and refresh.');
        }
    }, 2000); // Longer delay to ensure all scripts load
});
