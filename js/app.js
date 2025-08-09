// FundGuard - Main Application Logic

// Global variables
let provider;
let signer;
let contract;
let userAddress;
let auth;

// Contract addresses (replace with deployed contract addresses)
const CONTRACT_ADDRESS = "0x..."; // Replace with actual deployed contract address

// Contract ABI (updated for corrected contract)
const CONTRACT_ABI = [
    "function registerMember() external",
    "function createProposal(string memory title, string memory description, uint256 amount) external",
    "function vote(uint256 proposalId, bool support) external",
    "function executeProposal(uint256 proposalId) external",
    "function verifyMilestone(uint256 milestoneId, bool approved) external",
    "function getProposal(uint256 proposalId) external view returns (uint256 id, string memory title, string memory description, uint256 amount, address proposer, uint256 yesVotes, uint256 noVotes, uint256 createdAt, uint256 deadline, bool executed)",
    "function getMilestone(uint256 milestoneId) external view returns (uint256 id, uint256 proposalId, string memory title, string memory description, bool verified, address verifier, uint256 verifiedAt, uint256 fundsToRelease, bool fundsReleased)",
    "function getMember(address member) external view returns (bool isRegistered, uint256 joinedAt, uint256 civicPoints, uint256 proposalsCreated, uint256 votescast, uint256 milestonesVerified)",
    "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
    "function getBudgetInfo() external view returns (uint256 total, uint256 spent, uint256 remaining)",
    "function proposalCount() external view returns (uint256)",
    "function milestoneCount() external view returns (uint256)",
    "event MemberRegistered(address indexed member, uint256 timestamp)",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 amount)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support)",
    "event ProposalExecuted(uint256 indexed proposalId, bool approved)",
    "event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed proposalId, string title)",
    "event MilestoneVerified(uint256 indexed milestoneId, address indexed verifier, bool approved)",
    "event FundsReleased(uint256 indexed milestoneId, uint256 amount, address recipient)",
    "event CivicPointsAwarded(address indexed member, uint256 points, string reason)"
];

const CIVIC_POINTS_ABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function awardPoints(address to, uint256 amount) public"
];

// Polygon Mumbai RPC URL
const MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com/";

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('FundGuard initializing...');
    
    // Get Web3Auth instance (will be available after web3auth.js loads)
    auth = window.fundGuardAuth;
    
    // Set up event listeners
    setupEventListeners();
    
    // The Web3Auth initialization is handled in web3auth.js
    // Auto-login will be triggered if session exists
    
    console.log('FundGuard initialized successfully');
});

// Auto-login handler (called from web3auth.js)
window.handleAutoLogin = async () => {
    await connectWithAuth();
};

// Initialize Web3Modal
function initWeb3Modal() {
    const providerOptions = {
        // Add provider options here if needed
    };

    web3Modal = new Web3Modal.default({
        cacheProvider: true,
        providerOptions,
        disableInjectedProvider: false,
    });
}

// Set up event listeners
function setupEventListeners() {
    // Authentication buttons - User
    document.getElementById('showUserRegisterBtn')?.addEventListener('click', showUserRegisterForm);
    document.getElementById('showUserLoginBtn')?.addEventListener('click', showUserLoginForm);
    document.getElementById('userRegisterFormElement')?.addEventListener('submit', handleUserRegister);
    document.getElementById('userLoginFormElement')?.addEventListener('submit', handleUserLogin);
    document.getElementById('cancelUserRegister')?.addEventListener('click', showAuthWelcome);
    document.getElementById('cancelUserLogin')?.addEventListener('click', showAuthWelcome);
    
    // Authentication buttons - Organization
    document.getElementById('showOrgRegisterBtn')?.addEventListener('click', showOrgRegisterForm);
    document.getElementById('showOrgLoginBtn')?.addEventListener('click', showOrgLoginForm);
    document.getElementById('orgRegisterFormElement')?.addEventListener('submit', handleOrgRegister);
    document.getElementById('orgLoginFormElement')?.addEventListener('submit', handleOrgLogin);
    document.getElementById('cancelOrgRegister')?.addEventListener('click', showAuthWelcome);
    document.getElementById('cancelOrgLogin')?.addEventListener('click', showAuthWelcome);
    
    // Organization wallet connection
    document.getElementById('connectOrgWalletBtn')?.addEventListener('click', handleOrgWalletConnect);
    document.getElementById('proceedToDashboard')?.addEventListener('click', proceedToDashboard);
    
    // Community joining
    document.getElementById('joinCommunityForm')?.addEventListener('submit', handleJoinCommunity);
    
    // Organization admin actions
    document.getElementById('copyCommunityCode')?.addEventListener('click', copyCommunityCode);
    
    // Organization admin features
    document.getElementById('copyCommunityCode')?.addEventListener('click', copyCommunityCode);
    
    // User actions
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('fundWalletBtn')?.addEventListener('click', requestTestFunds);
    
    // Proposal creation
    document.getElementById('createProposalBtn')?.addEventListener('click', showCreateProposalModal);
    document.getElementById('proposalForm')?.addEventListener('submit', createProposal);
    document.getElementById('closeModal')?.addEventListener('click', hideCreateProposalModal);
    document.getElementById('cancelProposal')?.addEventListener('click', hideCreateProposalModal);
    
    // Close modal when clicking outside
    document.getElementById('proposalModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'proposalModal') {
            hideCreateProposalModal();
        }
    });
}

// Authentication UI Functions
function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('communitySection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    showAuthWelcome();
    updateHeaderForLoggedOut();
}

function showCommunitySection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('communitySection').classList.remove('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    
    // Update header to show user is logged in
    const userInfo = auth.getUserInfo();
    if (userInfo) {
        updateHeaderForLoggedIn(userInfo);
    }
    
    loadUserCommunities();
}

function showAuthWelcome() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.querySelector('.welcome-card').classList.remove('hidden');
}

// Show User Forms
function showUserRegisterForm() {
    document.querySelector('.welcome-card').classList.add('hidden');
    document.getElementById('userRegisterForm').classList.remove('hidden');
}

function showUserLoginForm() {
    document.querySelector('.welcome-card').classList.add('hidden');
    document.getElementById('userLoginForm').classList.remove('hidden');
}

// Show Organization Forms
function showOrgRegisterForm() {
    document.querySelector('.welcome-card').classList.add('hidden');
    document.getElementById('orgRegisterForm').classList.remove('hidden');
}

function showOrgLoginForm() {
    document.querySelector('.welcome-card').classList.add('hidden');
    document.getElementById('orgLoginForm').classList.remove('hidden');
}

function showOrgWalletSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('communitySection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    
    // Show the specific wallet section within auth section
    document.getElementById('authSection').classList.remove('hidden');
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.querySelector('.welcome-card').classList.add('hidden');
    document.getElementById('orgWalletSection').classList.remove('hidden');
}

function updateHeaderForLoggedOut() {
    document.getElementById('authButtons').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
}

function updateHeaderForLoggedIn(user) {
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    const userTypeLabel = user.userType === 'organization' ? '🏢' : '👤';
    document.getElementById('userEmail').textContent = `${userTypeLabel} ${user.email}`;
}

// User Authentication Handlers
async function handleUserRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('userRegisterEmail').value;
    const password = document.getElementById('userRegisterPassword').value;
    const confirmPassword = document.getElementById('userRegisterConfirmPassword').value;
    
    try {
        const result = await auth.register(email, password, confirmPassword, 'user');
        
        if (result.success) {
            alert('Account created successfully! You can now sign in.');
            showUserLoginForm();
        } else {
            alert('Registration failed: ' + result.message);
        }
    } catch (error) {
        console.error('User registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function handleUserLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('userLoginEmail').value;
    const password = document.getElementById('userLoginPassword').value;
    
    try {
        const result = await auth.login(email, password);
        
        if (result.success) {
            // Regular users need to join a community first
            showCommunitySection();
        } else {
            alert('Login failed: ' + result.message);
        }
    } catch (error) {
        console.error('User login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Organization Authentication Handlers
async function handleOrgRegister(event) {
    event.preventDefault();
    
    const organizationName = document.getElementById('orgName').value;
    const email = document.getElementById('orgRegisterEmail').value;
    const password = document.getElementById('orgRegisterPassword').value;
    const confirmPassword = document.getElementById('orgRegisterConfirmPassword').value;
    
    try {
        const result = await auth.register(email, password, confirmPassword, 'organization', organizationName);
        
        if (result.success) {
            alert(`Organization registered successfully!\n\nYour community code is: ${result.communityCode}\n\nShare this code with your members so they can join your community.`);
            showOrgLoginForm();
        } else {
            alert('Registration failed: ' + result.message);
        }
    } catch (error) {
        console.error('Organization registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function handleOrgLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('orgLoginEmail').value;
    const password = document.getElementById('orgLoginPassword').value;
    
    try {
        const result = await auth.login(email, password);
        
        if (result.success) {
            if (result.userType === 'organization') {
                // Organizations need to connect their wallet
                showOrgWalletSection();
            } else {
                await connectWithAuth();
            }
        } else {
            alert('Login failed: ' + result.message);
        }
    } catch (error) {
        console.error('Organization login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Handle organization wallet connection
async function handleOrgWalletConnect() {
    try {
        const connectResult = await auth.connectWallet();
        if (connectResult.success) {
            document.getElementById('walletStatus').classList.remove('hidden');
            document.getElementById('connectOrgWalletBtn').style.display = 'none';
        } else {
            alert('Wallet connection failed: ' + connectResult.error);
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Proceed to dashboard after wallet connection
async function proceedToDashboard() {
    try {
        await connectWithAuth();
    } catch (error) {
        console.error('Dashboard connection error:', error);
        alert('Failed to connect to dashboard. Please try again.');
    }
}

// Handle community joining
async function handleJoinCommunity(event) {
    event.preventDefault();
    
    const communityCode = document.getElementById('communityCode').value;
    
    try {
        const result = await auth.joinCommunity(communityCode);
        
        if (result.success) {
            alert(`${result.message}\n\nYou can now participate in ${result.community.name} governance!`);
            await connectWithAuth();
        } else {
            alert('Failed to join community: ' + result.message);
        }
    } catch (error) {
        console.error('Community join error:', error);
        alert('Failed to join community. Please try again.');
    }
}

// Load user's communities
function loadUserCommunities() {
    const communities = auth.getUserCommunities();
    const section = document.getElementById('userCommunitiesSection');
    const list = document.getElementById('userCommunitiesList');
    
    if (communities.length > 0) {
        section.classList.remove('hidden');
        list.innerHTML = communities.map(community => `
            <div class="community-item">
                <div class="community-info">
                    <h4>${community.name}</h4>
                    <p class="community-code">Code: ${community.code}</p>
                    <small>Joined: ${new Date(community.joinedAt).toLocaleDateString()}</small>
                </div>
                <button class="btn btn-primary" onclick="selectCommunity('${community.code}')">
                    Enter Community
                </button>
            </div>
        `).join('');
    } else {
        section.classList.add('hidden');
    }
}

// Select and enter a community
async function selectCommunity(communityCode) {
    const success = auth.setCurrentCommunity(communityCode);
    if (success) {
        await connectWithAuth();
    } else {
        alert('Failed to enter community. Please try again.');
    }
}

async function handleLogout() {
    try {
        await auth.logout();
        provider = null;
        signer = null;
        userAddress = null;
        contract = null;
        showAuthSection();
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if there's an error
        provider = null;
        signer = null;
        userAddress = null;
        contract = null;
        showAuthSection();
    }
}

async function requestTestFunds() {
    try {
        const result = await auth.requestTestFunds();
        if (result.success) {
            alert(`Test funds requested for your wallet!\n\nAddress: ${result.address}\n\nThe Mumbai faucet will open in a new tab. Please request MATIC tokens there.`);
        }
    } catch (error) {
        console.error('Error requesting test funds:', error);
        alert('Error requesting test funds: ' + error.message);
    }
}

// Auto-login handler (called from web3auth.js)
window.handleAutoLogin = async () => {
    await connectWithAuth();
};

// Connect with authentication system
async function connectWithAuth() {
    try {
        // Check if user has joined any community (for regular users)
        const userInfo = auth.getUserInfo();
        if (userInfo.userType === 'user') {
            const currentCommunity = auth.getCurrentCommunity();
            if (!currentCommunity) {
                // User needs to join a community first
                showCommunitySection();
                return;
            }
        }
        
        // Get provider and signer from auth system
        signer = await auth.getSigner();
        userAddress = await auth.getAddress();
        
        console.log('Connected with wallet:', userAddress);
        
        // Initialize contracts
        await initializeContracts();
        
        // Check if user is registered as member
        await checkAndRegisterMember();
        
        // Update UI
        updateHeaderForLoggedIn(userInfo);
        showDashboard();
        updateUserInfo();
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error connecting:', error);
        alert('Failed to connect to blockchain. Please try again.');
        showAuthSection();
    }
}

// Connect with Web3Auth (legacy - now redirects to connectWithAuth)
async function connectWithWeb3Auth() {
    await connectWithAuth();
}

// Check if wallet is already connected
async function checkConnection() {
    // This function is no longer needed with email/password auth
    return false;
}

// Connect wallet (legacy function - now handled by auth)
async function connectWallet() {
    // Redirect to login if not authenticated
    if (!auth.isLoggedIn()) {
        showAuthSection();
        return;
    }
    
    await connectWithAuth();
}

// Initialize smart contracts
async function initializeContracts() {
    try {
        // Initialize main contract
        if (CONTRACT_ADDRESS !== "0x...") {
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        }
        
        console.log('Contracts initialized');
    } catch (error) {
        console.error('Error initializing contracts:', error);
    }
}

// Set up provider event listeners
function setupProviderListeners() {
    provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnect();
        } else {
            window.location.reload();
        }
    });

    provider.on('chainChanged', () => {
        window.location.reload();
    });
}

// Disconnect wallet
async function disconnect() {
    await web3Modal.clearCachedProvider();
    provider = null;
    signer = null;
    userAddress = null;
    contract = null;
    civicPointsContract = null;
    
    showWalletSection();
}

// Check if user is registered and register if needed
async function checkAndRegisterMember() {
    try {
        if (!contract) return;
        
        // Check if user is already registered
        const memberInfo = await contract.getMember(userAddress);
        
        if (!memberInfo[0]) { // isRegistered is false
            const shouldRegister = confirm('You need to register as a community member to participate. Register now?');
            if (shouldRegister) {
                showLoading('Registering member...');
                const tx = await contract.registerMember();
                await tx.wait();
                alert('Successfully registered as a community member!');
                hideLoading();
            }
        }
    } catch (error) {
        console.error('Error checking member registration:', error);
    }
}

// Show wallet connection section
function showWalletSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
}

// Show dashboard section
function showDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('communitySection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
}

// Update user info display
function updateUserInfo() {
    const userInfo = auth.getUserInfo();
    if (userInfo) {
        document.getElementById('userEmailDisplay').textContent = userInfo.email || userInfo.name || 'User';
    }
    
    const addressElement = document.getElementById('userAddress');
    if (addressElement && userAddress) {
        addressElement.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    }
    
    // Show community info
    const currentCommunity = auth.getCurrentCommunity();
    const communityNameEl = document.getElementById('currentCommunityName');
    const communityCodeEl = document.getElementById('currentCommunityCode');
    
    if (currentCommunity && communityNameEl && communityCodeEl) {
        communityNameEl.textContent = `🏛️ ${currentCommunity.name}`;
        communityCodeEl.textContent = `Code: ${currentCommunity.code}`;
        document.getElementById('communityInfo').style.display = 'block';
    } else if (document.getElementById('communityInfo')) {
        document.getElementById('communityInfo').style.display = 'none';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadBudgetData(),
            loadProposals(),
            loadMilestones(),
            loadCivicPoints(),
            createBudgetChart(),
            loadOrganizationData()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load budget data
async function loadBudgetData() {
    try {
        // Mock data for demonstration (replace with actual contract calls)
        const totalBudget = 100000; // $100,000
        const spentAmount = 35000;  // $35,000
        const remainingBudget = totalBudget - spentAmount;
        const spentPercentage = (spentAmount / totalBudget) * 100;
        
        // Update budget display
        document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
        document.getElementById('spentAmount').textContent = `$${spentAmount.toLocaleString()}`;
        document.getElementById('remainingBudget').textContent = `$${remainingBudget.toLocaleString()}`;
        
        // Update progress bar
        document.getElementById('progressFill').style.width = `${spentPercentage}%`;
    } catch (error) {
        console.error('Error loading budget data:', error);
    }
}

// Load proposals
async function loadProposals() {
    try {
        const currentCommunity = auth.getCurrentCommunity();
        
        if (currentCommunity && currentCommunity.proposals.length > 0) {
            // Load proposals from current community
            displayProposals(currentCommunity.proposals);
        } else {
            // Mock proposals data for demonstration
            const mockProposals = [
                {
                    id: 1,
                    title: "New Community Park",
                    description: "Build a new park with playground equipment and green spaces for families.",
                    amount: "25,000",
                    yesVotes: 45,
                    noVotes: 12,
                    status: "active",
                    communityCode: currentCommunity ? currentCommunity.code : 'DEMO'
                },
                {
                    id: 2,
                    title: "Road Repair Project",
                    description: "Fix potholes and resurface Main Street and Oak Avenue.",
                    amount: "18,500",
                    yesVotes: 38,
                    noVotes: 8,
                    status: "active",
                    communityCode: currentCommunity ? currentCommunity.code : 'DEMO'
                },
                {
                    id: 3,
                    title: "Community Center WiFi",
                    description: "Install high-speed internet access in the community center.",
                    amount: "5,200",
                    yesVotes: 52,
                    noVotes: 3,
                    status: "active",
                    communityCode: currentCommunity ? currentCommunity.code : 'DEMO'
                }
            ];
            
            displayProposals(mockProposals);
        }
    } catch (error) {
        console.error('Error loading proposals:', error);
    }
}

// Display proposals
function displayProposals(proposals) {
    const proposalsList = document.getElementById('proposalsList');
    
    if (proposals.length === 0) {
        proposalsList.innerHTML = '<p class="text-center">No active proposals</p>';
        return;
    }
    
    proposalsList.innerHTML = proposals.map(proposal => `
        <div class="proposal-item">
            <div class="proposal-header">
                <div>
                    <div class="proposal-title">${proposal.title}</div>
                    <div class="proposal-amount">$${proposal.amount}</div>
                </div>
            </div>
            <div class="proposal-description">${proposal.description}</div>
            <div class="proposal-votes">
                <small>👍 ${proposal.yesVotes} Yes • 👎 ${proposal.noVotes} No</small>
            </div>
            <div class="proposal-actions">
                <button class="btn vote-btn vote-yes" onclick="vote(${proposal.id}, true)">
                    👍 Vote Yes
                </button>
                <button class="btn vote-btn vote-no" onclick="vote(${proposal.id}, false)">
                    👎 Vote No
                </button>
            </div>
        </div>
    `).join('');
}

// Load milestones
async function loadMilestones() {
    try {
        // Mock milestones data (replace with actual contract calls)
        const mockMilestones = [
            {
                id: 1,
                title: "Park Foundation Complete",
                description: "Foundation and basic infrastructure for the new community park has been completed.",
                status: "pending",
                project: "New Community Park"
            },
            {
                id: 2,
                title: "Road Survey Finished",
                description: "Professional survey of road conditions and repair requirements completed.",
                status: "verified",
                project: "Road Repair Project"
            },
            {
                id: 3,
                title: "WiFi Equipment Purchased",
                description: "All necessary networking equipment has been purchased and delivered.",
                status: "pending",
                project: "Community Center WiFi"
            }
        ];
        
        displayMilestones(mockMilestones);
    } catch (error) {
        console.error('Error loading milestones:', error);
    }
}

// Display milestones
function displayMilestones(milestones) {
    const milestonesList = document.getElementById('milestonesList');
    
    if (milestones.length === 0) {
        milestonesList.innerHTML = '<p class="text-center">No milestones to verify</p>';
        return;
    }
    
    milestonesList.innerHTML = milestones.map(milestone => `
        <div class="milestone-item">
            <div class="milestone-header">
                <div class="milestone-title">${milestone.title}</div>
                <div class="milestone-status status-${milestone.status}">${milestone.status}</div>
            </div>
            <div class="milestone-description">${milestone.description}</div>
            <div class="milestone-project"><small>Project: ${milestone.project}</small></div>
            ${milestone.status === 'pending' ? `
                <div class="milestone-actions">
                    <button class="btn btn-primary" onclick="verifyMilestone(${milestone.id}, true)">
                        ✅ Verify Complete
                    </button>
                    <button class="btn btn-secondary" onclick="verifyMilestone(${milestone.id}, false)">
                        ❌ Mark Incomplete
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Load civic points
async function loadCivicPoints() {
    try {
        const currentCommunity = auth.getCurrentCommunity();
        const userInfo = auth.getUserInfo();
        
        if (currentCommunity && userInfo) {
            // Find user in community members
            const member = currentCommunity.members.find(m => m.email === userInfo.email);
            if (member) {
                document.getElementById('civicPoints').textContent = member.civicPoints || 0;
            } else {
                document.getElementById('civicPoints').textContent = '0';
            }
        } else {
            document.getElementById('civicPoints').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading civic points:', error);
        document.getElementById('civicPoints').textContent = '0';
    }
}

// Load organization data and show admin panel
function loadOrganizationData() {
    const userInfo = auth.getUserInfo();
    const isAdmin = auth.isCurrentUserAdmin();
    const adminPanel = document.getElementById('orgAdminPanel');
    
    if (isAdmin && adminPanel) {
        adminPanel.classList.remove('hidden');
        
        const currentCommunity = auth.getCurrentCommunity();
        if (currentCommunity) {
            // Update community code display
            document.getElementById('organizationCommunityCode').textContent = currentCommunity.code;
            
            // Update member count
            document.getElementById('memberCount').textContent = currentCommunity.members.length;
            
            // Update active proposals count
            document.getElementById('activeProposals').textContent = currentCommunity.proposals.length;
        }
    } else if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
}

// Copy community code to clipboard
async function copyCommunityCode() {
    const codeElement = document.getElementById('organizationCommunityCode');
    const code = codeElement.textContent;
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Show feedback
        const originalText = codeElement.textContent;
        codeElement.textContent = 'Copied!';
        codeElement.style.color = 'var(--success-color)';
        
        setTimeout(() => {
            codeElement.textContent = originalText;
            codeElement.style.color = '';
        }, 2000);
        
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        alert('Community code copied to clipboard!');
    }
}

// Create budget chart
function createBudgetChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: [35000, 65000],
                backgroundColor: [
                    '#dc2626',
                    '#059669'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Vote on proposal
async function vote(proposalId, support) {
    try {
        showLoading('Submitting vote...');
        
        const currentCommunity = auth.getCurrentCommunity();
        if (!currentCommunity) {
            alert('No community selected.');
            hideLoading();
            return;
        }
        
        const proposal = currentCommunity.proposals.find(p => p.id === proposalId);
        if (!proposal) {
            alert('Proposal not found.');
            hideLoading();
            return;
        }
        
        const userInfo = auth.getUserInfo();
        
        // Check if user has already voted
        if (proposal.voters.includes(userInfo.email)) {
            alert('You have already voted on this proposal.');
            hideLoading();
            return;
        }
        
        // Add vote
        if (support) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }
        
        // Record voter
        proposal.voters.push(userInfo.email);
        
        // Save changes
        auth.saveCommunities();
        
        // Award civic points for voting
        await awardCivicPoints(10);
        
        // Reload proposals
        await loadProposals();
        await loadCivicPoints();
        
        alert(`Vote ${support ? 'YES' : 'NO'} submitted successfully! You earned 10 civic points.`);
        hideLoading();
    } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to submit vote. Please try again.');
        hideLoading();
    }
}

// Verify milestone
async function verifyMilestone(milestoneId, approved) {
    try {
        showLoading('Submitting verification...');
        
        if (!contract) {
            alert('Contract not initialized. Please ensure you are connected to the correct network.');
            hideLoading();
            return;
        }
        
        // Call contract verify function
        const tx = await contract.verifyMilestone(milestoneId, approved);
        await tx.wait();
        
        // Award civic points for verification
        await awardCivicPoints(15);
        
        // Reload milestones
        await loadMilestones();
        await loadCivicPoints();
        
        alert(`Milestone ${approved ? 'verified' : 'rejected'} successfully! You earned 15 civic points.`);
        hideLoading();
    } catch (error) {
        console.error('Error verifying milestone:', error);
        alert('Failed to verify milestone. Please try again.');
        hideLoading();
    }
}

// Award civic points
async function awardCivicPoints(amount) {
    try {
        const currentCommunity = auth.getCurrentCommunity();
        const userInfo = auth.getUserInfo();
        
        if (currentCommunity && userInfo) {
            // Find user in community members
            const member = currentCommunity.members.find(m => m.email === userInfo.email);
            if (member) {
                member.civicPoints = (member.civicPoints || 0) + amount;
                auth.saveCommunities();
            }
        }
    } catch (error) {
        console.error('Error awarding civic points:', error);
    }
}

// Show create proposal modal
function showCreateProposalModal() {
    document.getElementById('proposalModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Hide create proposal modal
function hideCreateProposalModal() {
    document.getElementById('proposalModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('proposalForm').reset();
}

// Create new proposal
async function createProposal(event) {
    event.preventDefault();
    
    try {
        showLoading('Creating proposal...');
        
        const title = document.getElementById('proposalTitle').value;
        const description = document.getElementById('proposalDescription').value;
        const amount = document.getElementById('proposalAmount').value;
        
        const currentCommunity = auth.getCurrentCommunity();
        if (!currentCommunity) {
            alert('No community selected. Please join a community first.');
            hideLoading();
            return;
        }
        
        const userInfo = auth.getUserInfo();
        const isAdmin = auth.isCurrentUserAdmin();
        
        // Check if user can create proposals
        if (userInfo.userType !== 'organization' && !currentCommunity.settings.allowMemberProposals) {
            alert('Only organization administrators can create proposals in this community.');
            hideLoading();
            return;
        }
        
        // Create proposal object
        const newProposal = {
            id: Date.now(), // Simple ID generation
            title: title,
            description: description,
            amount: amount,
            proposer: userAddress,
            proposerEmail: userInfo.email,
            yesVotes: 0,
            noVotes: 0,
            voters: [],
            status: 'active',
            createdAt: Date.now(),
            communityCode: currentCommunity.code
        };
        
        // Add to community
        currentCommunity.proposals.push(newProposal);
        auth.saveCommunities();
        
        // Award civic points for creating proposal
        await awardCivicPoints(20);
        
        // Reload proposals and update display
        await loadProposals();
        await loadCivicPoints();
        await loadOrganizationData(); // Update proposal count
        
        hideCreateProposalModal();
        alert('Proposal created successfully! You earned 20 civic points.');
        hideLoading();
    } catch (error) {
        console.error('Error creating proposal:', error);
        alert('Failed to create proposal. Please try again.');
        hideLoading();
    }
}

// Show loading spinner
function showLoading(message = 'Loading...') {
    const spinner = document.getElementById('loadingSpinner');
    const spinnerText = spinner.querySelector('p');
    spinnerText.textContent = message;
    spinner.classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

// Format address for display
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        connectWallet,
        vote,
        verifyMilestone,
        createProposal,
        formatAddress,
        formatCurrency
    };
}
