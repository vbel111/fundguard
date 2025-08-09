// Authentication System for FundGuard
// Provides email/password login for users and wallet connection for organizations

class FundGuardAuth {
    constructor() {
        this.users = this.loadUsers();
        this.communities = this.loadCommunities();
        this.currentUser = null;
        this.currentCommunity = null;
        this.userWallet = null;
        this.provider = null;
        this.currentStep = 0;
        this.isConnectedAsOrg = false;
    }

    // Load users from localStorage (in production, use a proper backend)
    loadUsers() {
        const stored = localStorage.getItem('fundguard_users');
        return stored ? JSON.parse(stored) : {};
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('fundguard_users', JSON.stringify(this.users));
    }

    // Load communities from localStorage
    loadCommunities() {
        const stored = localStorage.getItem('fundguard_communities');
        return stored ? JSON.parse(stored) : {};
    }

    // Save communities to localStorage
    saveCommunities() {
        localStorage.setItem('fundguard_communities', JSON.stringify(this.communities));
    }

    // Generate unique community code
    generateCommunityCode() {
        return 'COM-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Initialize authentication system
    async init() {
        try {
            console.log('Initializing FundGuard authentication...');
            
            // Check for existing session
            await this.autoLogin();
            
            console.log("Authentication system initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize authentication:", error);
            return false;
        }
    }

    // Register new user with email and password
    async register(email, password, confirmPassword, userType = 'user', organizationName = '') {
        try {
            // Validation
            if (!email || !password || !confirmPassword) {
                throw new Error('All fields are required');
            }
            
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            
            if (!this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (this.users[email]) {
                throw new Error('User already exists');
            }

            if (userType === 'organization' && !organizationName.trim()) {
                throw new Error('Organization name is required');
            }

            // Create wallet for user (organizations will connect their own)
            let wallet = null;
            let address = null;
            
            if (userType === 'user') {
                wallet = ethers.Wallet.createRandom();
                address = wallet.address;
            }
            
            // Hash password
            const hashedPassword = await this.hashPassword(password);
            
            let communityCode = null;
            
            // If registering as organization, create a community
            if (userType === 'organization') {
                communityCode = this.generateCommunityCode();
                this.communities[communityCode] = {
                    code: communityCode,
                    name: organizationName,
                    organizationEmail: email,
                    createdAt: Date.now(),
                    members: [],
                    proposals: [],
                    settings: {
                        allowMemberProposals: false,
                        minimumVotingPower: 1
                    }
                };
                this.saveCommunities();
            }
            
            // Store user
            this.users[email] = {
                email: email,
                password: hashedPassword,
                userType: userType,
                organizationName: userType === 'organization' ? organizationName : null,
                communityCode: communityCode,
                privateKey: wallet ? wallet.privateKey : null,
                address: address,
                createdAt: Date.now(),
                isVerified: true, // Skip email verification for demo
                communities: [] // Communities user has joined
            };
            
            this.saveUsers();
            
            return {
                success: true,
                message: userType === 'organization' 
                    ? `Organization registered successfully! Your community code is: ${communityCode}` 
                    : 'Account created successfully!',
                userType: userType,
                address: address,
                communityCode: communityCode
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Login user with email and password
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            const user = this.users[email];
            if (!user) {
                throw new Error('User not found');
            }
            
            const isValidPassword = await this.verifyPassword(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid password');
            }
            
            // Set current user
            this.currentUser = user;
            this.isConnectedAsOrg = false;
            
            // Create wallet instance for regular users
            if (user.userType === 'user' && user.privateKey) {
                this.userWallet = new ethers.Wallet(user.privateKey);
            }
            
            // Store current session
            localStorage.setItem('fundguard_session', JSON.stringify({
                email: email,
                userType: user.userType,
                loginTime: Date.now()
            }));
            
            this.updateSetupStep(1);
            
            return {
                success: true,
                message: 'Login successful!',
                userType: user.userType,
                user: {
                    email: user.email,
                    userType: user.userType,
                    address: user.address,
                    createdAt: user.createdAt
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Join community with keycode
    async joinCommunity(keycode) {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }

            if (this.currentUser.userType !== 'user') {
                throw new Error('Only community members can join communities');
            }

            const community = this.communities[keycode.toUpperCase()];
            if (!community) {
                throw new Error('Invalid community code');
            }

            // Check if user is already a member
            if (community.members.some(member => member.email === this.currentUser.email)) {
                throw new Error('You are already a member of this community');
            }

            // Add user to community
            community.members.push({
                email: this.currentUser.email,
                address: this.currentUser.address,
                joinedAt: Date.now(),
                civicPoints: 0,
                votingPower: 1
            });

            // Add community to user's communities list
            if (!this.currentUser.communities) {
                this.currentUser.communities = [];
            }
            this.currentUser.communities.push({
                code: keycode.toUpperCase(),
                name: community.name,
                joinedAt: Date.now()
            });

            // Update storage
            this.users[this.currentUser.email] = this.currentUser;
            this.saveCommunities();
            this.saveUsers();

            // Set as current community
            this.currentCommunity = community;

            return {
                success: true,
                message: `Successfully joined ${community.name}!`,
                community: {
                    code: community.code,
                    name: community.name,
                    memberCount: community.members.length
                }
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Get user's communities
    getUserCommunities() {
        if (!this.currentUser) return [];
        return this.currentUser.communities || [];
    }

    // Set current community
    setCurrentCommunity(communityCode) {
        const community = this.communities[communityCode];
        if (community) {
            this.currentCommunity = community;
            
            // Store current community in session
            localStorage.setItem('fundguard_current_community', communityCode);
            
            return true;
        }
        return false;
    }

    // Get current community
    getCurrentCommunity() {
        return this.currentCommunity;
    }

    // Check if user is admin of current community
    isCurrentUserAdmin() {
        if (!this.currentUser || !this.currentCommunity) return false;
        
        // Organization owner is admin
        return this.currentUser.userType === 'organization' && 
               this.currentCommunity.organizationEmail === this.currentUser.email;
    }

    // Connect wallet for organizations
    async connectWallet() {
        try {
            if (!this.currentUser || this.currentUser.userType !== 'organization') {
                throw new Error('Only organizations can connect external wallets');
            }

            // Check if MetaMask is available
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
            }

            this.updateSetupStep(1);

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found in wallet');
            }

            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await this.provider.getSigner();
            const address = await signer.getAddress();

            // Update user record with wallet address
            this.currentUser.address = address;
            this.users[this.currentUser.email].address = address;
            this.saveUsers();

            this.isConnectedAsOrg = true;
            this.updateSetupStep(2);

            return {
                success: true,
                address: address,
                provider: this.provider
            };

        } catch (error) {
            console.error("Wallet connection failed:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get ethers signer
    async getSigner() {
        if (this.currentUser.userType === 'organization' && this.provider) {
            // Organization using connected wallet
            return await this.provider.getSigner();
        } else if (this.currentUser.userType === 'user' && this.userWallet) {
            // Regular user with generated wallet
            const provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/");
            return this.userWallet.connect(provider);
        } else {
            throw new Error("No wallet available");
        }
    }

    // Get user's wallet address
    async getAddress() {
        if (this.currentUser) {
            return this.currentUser.address;
        }
        throw new Error("No user logged in");
    }

    // Get user info
    getUserInfo() {
        return this.currentUser ? {
            email: this.currentUser.email,
            userType: this.currentUser.userType,
            address: this.currentUser.address,
            createdAt: this.currentUser.createdAt
        } : null;
    }

    // Logout user
    async logout() {
        try {
            this.currentUser = null;
            this.currentCommunity = null;
            this.userWallet = null;
            this.provider = null;
            this.isConnectedAsOrg = false;
            this.currentStep = 0;
            localStorage.removeItem('fundguard_session');
            localStorage.removeItem('fundguard_current_community');
            return true;
        } catch (error) {
            console.error("Logout failed:", error);
            return false;
        }
    }

    // Check if user is logged in
    isConnected() {
        return this.currentUser !== null;
    }

    // Auto-login if session exists
    async autoLogin() {
        const session = localStorage.getItem('fundguard_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const user = this.users[sessionData.email];
                
                if (user) {
                    this.currentUser = user;
                    if (user.userType === 'user' && user.privateKey) {
                        this.userWallet = new ethers.Wallet(user.privateKey);
                    }
                    
                    // Restore current community if exists
                    const currentCommunityCode = localStorage.getItem('fundguard_current_community');
                    if (currentCommunityCode && this.communities[currentCommunityCode]) {
                        this.currentCommunity = this.communities[currentCommunityCode];
                    }
                    
                    return true;
                }
            } catch (error) {
                console.error('Auto-login failed:', error);
                localStorage.removeItem('fundguard_session');
                localStorage.removeItem('fundguard_current_community');
            }
        }
        return false;
    }

    // Get balance (for funding display)
    async getBalance() {
        try {
            const address = await this.getAddress();
            if (!address) return "0";
            
            let provider;
            if (this.currentUser.userType === 'organization' && this.provider) {
                provider = this.provider;
            } else {
                provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/");
            }
            
            const balance = await provider.getBalance(address);
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

    // Sign transaction
    async signTransaction(transaction) {
        try {
            const signer = await this.getSigner();
            return await signer.sendTransaction(transaction);
        } catch (error) {
            console.error("Transaction failed:", error);
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
                userType: this.currentUser.userType,
                userInfo: this.getUserInfo()
            };
        } catch (error) {
            console.error("Failed to export wallet:", error);
            throw error;
        }
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Simple password hashing (use bcrypt in production)
    async hashPassword(password) {
        try {
            // Check if crypto.subtle is available
            if (typeof crypto !== 'undefined' && crypto.subtle) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password + 'fundguard_salt');
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
                // Fallback for environments without crypto.subtle
                return this.simpleHash(password + 'fundguard_salt');
            }
        } catch (error) {
            console.warn('Crypto API not available, using fallback hash:', error);
            return this.simpleHash(password + 'fundguard_salt');
        }
    }

    // Simple hash fallback (not cryptographically secure - use only for demo)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Verify password
    async verifyPassword(password, hashedPassword) {
        try {
            const hashedInput = await this.hashPassword(password);
            return hashedInput === hashedPassword;
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
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
}

// Global instance
window.fundGuardAuth = new FundGuardAuth();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing FundGuard authentication...');
    
    try {
        const initialized = await window.fundGuardAuth.init();
        
        if (initialized) {
            console.log('Authentication system ready');
            
            // Check for existing session
            const hasSession = await window.fundGuardAuth.autoLogin();
            if (hasSession) {
                console.log('Found existing session, auto-connecting...');
                // Trigger auto-login in main app
                if (window.handleAutoLogin) {
                    window.handleAutoLogin();
                }
            }
        } else {
            console.error('Failed to initialize authentication system');
        }
    } catch (error) {
        console.error('Authentication initialization error:', error);
    }
});
