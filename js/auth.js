// Authentication and Wallet Management
class FundGuardAuth {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.userWallet = null;
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

    // Generate or retrieve wallet for user
    async getOrCreateWallet(email) {
        if (this.users[email] && this.users[email].privateKey) {
            // User has existing wallet
            return new ethers.Wallet(this.users[email].privateKey);
        } else {
            // Create new wallet for user
            const wallet = ethers.Wallet.createRandom();
            if (!this.users[email]) {
                this.users[email] = {};
            }
            this.users[email].privateKey = wallet.privateKey;
            this.saveUsers();
            return wallet;
        }
    }

    // Register new user
    async register(email, password, confirmPassword) {
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

            // Create wallet for user
            const wallet = await this.getOrCreateWallet(email);
            
            // Hash password (simple hash for demo - use bcrypt in production)
            const hashedPassword = await this.hashPassword(password);
            
            // Store user
            this.users[email] = {
                email: email,
                password: hashedPassword,
                privateKey: wallet.privateKey,
                address: wallet.address,
                createdAt: Date.now(),
                isVerified: true // Skip email verification for demo
            };
            
            this.saveUsers();
            
            return {
                success: true,
                message: 'Account created successfully!',
                address: wallet.address
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Login user
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
            
            // Create wallet instance
            this.userWallet = new ethers.Wallet(user.privateKey);
            this.currentUser = user;
            
            // Store current session
            localStorage.setItem('fundguard_session', JSON.stringify({
                email: email,
                loginTime: Date.now()
            }));
            
            return {
                success: true,
                message: 'Login successful!',
                user: {
                    email: user.email,
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

    // Logout user
    logout() {
        this.currentUser = null;
        this.userWallet = null;
        localStorage.removeItem('fundguard_session');
    }

    // Check if user is logged in
    isLoggedIn() {
        const session = localStorage.getItem('fundguard_session');
        return session && this.currentUser;
    }

    // Get current user's wallet connected to provider
    async getConnectedWallet(provider) {
        if (!this.userWallet) {
            throw new Error('No user wallet available');
        }
        
        return this.userWallet.connect(provider);
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
                    this.userWallet = new ethers.Wallet(user.privateKey);
                    return true;
                }
            } catch (error) {
                console.error('Auto-login failed:', error);
                localStorage.removeItem('fundguard_session');
            }
        }
        return false;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser ? {
            email: this.currentUser.email,
            address: this.currentUser.address,
            createdAt: this.currentUser.createdAt
        } : null;
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Simple password hashing (use bcrypt in production)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'fundguard_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Verify password
    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }

    // Fund user wallet (for testnet)
    async requestTestFunds() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        // In a real app, this would call a faucet API
        return {
            success: true,
            message: `Test funds requested for ${this.currentUser.address}. Check Amoy faucet.`,
            address: this.currentUser.address
        };
    }
}

// Export for use
window.FundGuardAuth = FundGuardAuth;
