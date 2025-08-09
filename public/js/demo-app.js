/**
 * Demo App - Modified app.js for demo mode without Web3 dependencies
 */

// Demo mode configuration
const DEMO_MODE = true;
const DEMO_USER_ADDRESS = "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22";

// Global variables for demo
let currentUser = null;
let currentCommunity = null;
let isLoggedIn = false;

// Initialize demo app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 Demo FundGuard App Starting...');
    
    // Initialize demo mode
    initializeDemoMode();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show initial auth section
    showAuthSection();
});

function initializeDemoMode() {
    console.log('🎭 Running in DEMO MODE');
    
    // Display demo notice
    const demoNotice = document.createElement('div');
    demoNotice.className = 'demo-notice';
    demoNotice.innerHTML = `
        <div class="demo-banner">
            🎭 <strong>DEMO MODE</strong> - This is a simulation for demonstration purposes
            <button onclick="this.parentElement.style.display='none'" style="float: right; background: none; border: none; color: white; cursor: pointer;">×</button>
        </div>
    `;
    demoNotice.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: linear-gradient(90deg, #e74c3c, #c0392b);
        color: white;
        padding: 10px;
        text-align: center;
        font-weight: bold;
    `;
    document.body.insertBefore(demoNotice, document.body.firstChild);
    
    // Adjust body padding to account for demo banner
    document.body.style.paddingTop = '50px';
}

function setupEventListeners() {
    // Auth form handlers
    setupAuthListeners();
    
    // Dashboard handlers
    setupDashboardListeners();
    
    // Proposal handlers
    setupProposalListeners();
    
    // Milestone handlers
    setupMilestoneListeners();
}

function setupAuthListeners() {
    // User registration
    const userRegisterForm = document.getElementById('userRegisterFormElement');
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', handleUserRegister);
    }
    
    // User login
    const userLoginForm = document.getElementById('userLoginFormElement');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }
    
    // Organization registration
    const orgRegisterForm = document.getElementById('orgRegisterFormElement');
    if (orgRegisterForm) {
        orgRegisterForm.addEventListener('submit', handleOrgRegister);
    }
    
    // Organization login
    const orgLoginForm = document.getElementById('orgLoginFormElement');
    if (orgLoginForm) {
        orgLoginForm.addEventListener('submit', handleOrgLogin);
    }
    
    // Show/hide form buttons
    document.getElementById('showUserRegisterBtn')?.addEventListener('click', () => {
        showForm('userRegisterForm');
    });
    
    document.getElementById('showUserLoginBtn')?.addEventListener('click', () => {
        showForm('userLoginForm');
    });
    
    document.getElementById('showOrgRegisterBtn')?.addEventListener('click', () => {
        showForm('orgRegisterForm');
    });
    
    document.getElementById('showOrgLoginBtn')?.addEventListener('click', () => {
        showForm('orgLoginForm');
    });
    
    // Cancel buttons
    document.querySelectorAll('[id^="cancel"]').forEach(btn => {
        btn.addEventListener('click', showAuthSection);
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

function setupDashboardListeners() {
    // Get test funds button
    document.getElementById('fundWalletBtn')?.addEventListener('click', () => {
        alert('💰 Demo Mode: Test funds added to your wallet!\n\nBalance: 10.5 MATIC\nStatus: Ready for transactions');
    });
    
    // Community join form
    const joinCommunityForm = document.getElementById('joinCommunityForm');
    if (joinCommunityForm) {
        joinCommunityForm.addEventListener('submit', handleJoinCommunity);
    }
    
    // Copy community code
    document.getElementById('copyCommunityCode')?.addEventListener('click', () => {
        const code = document.getElementById('organizationCommunityCode')?.textContent;
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                alert('📋 Community code copied to clipboard!');
            });
        }
    });
}

function setupProposalListeners() {
    // Create proposal button
    document.getElementById('createProposalBtn')?.addEventListener('click', showProposalModal);
    
    // Proposal form
    const proposalForm = document.getElementById('proposalForm');
    if (proposalForm) {
        proposalForm.addEventListener('submit', handleCreateProposal);
    }
    
    // Modal controls
    document.getElementById('closeModal')?.addEventListener('click', hideProposalModal);
    document.getElementById('cancelProposal')?.addEventListener('click', hideProposalModal);
}

function setupMilestoneListeners() {
    // Milestone verification will be handled dynamically
}

// Authentication handlers
async function handleUserRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('userRegisterEmail').value;
    const password = document.getElementById('userRegisterPassword').value;
    const confirmPassword = document.getElementById('userRegisterConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match');
        return;
    }
    
    showLoading('Creating your account...');
    
    try {
        // Simulate account creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        currentUser = {
            email: email,
            address: DEMO_USER_ADDRESS,
            userType: 'user',
            isRegistered: false
        };
        
        hideLoading();
        showCommunitySection();
        
    } catch (error) {
        hideLoading();
        alert('❌ Registration failed: ' + error.message);
    }
}

async function handleUserLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('userLoginEmail').value;
    const password = document.getElementById('userLoginPassword').value;
    
    showLoading('Signing you in...');
    
    try {
        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentUser = {
            email: email,
            address: DEMO_USER_ADDRESS,
            userType: 'user',
            isRegistered: true
        };
        
        hideLoading();
        
        // Check if user has communities
        if (Math.random() > 0.5) {
            showCommunitySection();
        } else {
            showDashboard();
        }
        
    } catch (error) {
        hideLoading();
        alert('❌ Login failed: ' + error.message);
    }
}

async function handleOrgRegister(e) {
    e.preventDefault();
    
    const orgName = document.getElementById('orgName').value;
    const email = document.getElementById('orgRegisterEmail').value;
    const password = document.getElementById('orgRegisterPassword').value;
    
    showLoading('Registering organization...');
    
    try {
        // Simulate organization registration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const communityCode = 'COM-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        
        currentUser = {
            email: email,
            address: DEMO_USER_ADDRESS,
            userType: 'organization',
            organizationName: orgName,
            communityCode: communityCode,
            isRegistered: true
        };
        
        hideLoading();
        alert(`🎉 Organization registered successfully!\n\nYour community code: ${communityCode}\n\nShare this code with your members.`);
        showDashboard();
        
    } catch (error) {
        hideLoading();
        alert('❌ Registration failed: ' + error.message);
    }
}

async function handleOrgLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('orgLoginEmail').value;
    const password = document.getElementById('orgLoginPassword').value;
    
    showLoading('Signing in...');
    
    try {
        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentUser = {
            email: email,
            address: DEMO_USER_ADDRESS,
            userType: 'organization',
            organizationName: 'Demo Organization',
            communityCode: 'COM-DEMO2025',
            isRegistered: true
        };
        
        hideLoading();
        showDashboard();
        
    } catch (error) {
        hideLoading();
        alert('❌ Login failed: ' + error.message);
    }
}

async function handleJoinCommunity(e) {
    e.preventDefault();
    
    const code = document.getElementById('communityCode').value.toUpperCase();
    
    showLoading('Joining community...');
    
    try {
        // Simulate community join
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (code === 'COM-DEMO2025' || code.startsWith('COM-')) {
            currentCommunity = {
                code: code,
                name: 'Demo Community',
                members: 42
            };
            
            hideLoading();
            alert('🎉 Successfully joined the community!');
            showDashboard();
        } else {
            throw new Error('Invalid community code');
        }
        
    } catch (error) {
        hideLoading();
        alert('❌ Failed to join community: ' + error.message);
    }
}

function handleLogout() {
    currentUser = null;
    currentCommunity = null;
    isLoggedIn = false;
    showAuthSection();
    alert('👋 You have been logged out');
}

// Proposal handlers
function showProposalModal() {
    document.getElementById('proposalModal').classList.remove('hidden');
}

function hideProposalModal() {
    document.getElementById('proposalModal').classList.add('hidden');
    document.getElementById('proposalForm').reset();
}

async function handleCreateProposal(e) {
    e.preventDefault();
    
    const title = document.getElementById('proposalTitle').value;
    const description = document.getElementById('proposalDescription').value;
    const amount = parseFloat(document.getElementById('proposalAmount').value);
    
    showLoading('Creating proposal...');
    
    try {
        // Use demo contract
        await window.demoContract.createProposal(title, description, amount * 1000); // Convert to USD
        
        hideLoading();
        hideProposalModal();
        alert('🎉 Proposal created successfully!');
        
        // Refresh proposals list
        loadProposals();
        
    } catch (error) {
        hideLoading();
        alert('❌ Failed to create proposal: ' + error.message);
    }
}

async function handleVote(proposalId, support) {
    showLoading('Casting vote...');
    
    try {
        await window.demoContract.vote(proposalId, support);
        
        hideLoading();
        alert(`✅ Vote cast ${support ? 'in favor' : 'against'} the proposal!`);
        
        // Refresh proposals list
        loadProposals();
        
        // Update civic points
        updateCivicPoints();
        
    } catch (error) {
        hideLoading();
        alert('❌ Failed to vote: ' + error.message);
    }
}

async function handleVerifyMilestone(milestoneId) {
    showLoading('Verifying milestone...');
    
    try {
        await window.demoContract.verifyMilestone(milestoneId);
        
        hideLoading();
        alert('✅ Milestone verified successfully! You earned 10 civic points.');
        
        // Refresh milestones list
        loadMilestones();
        
        // Update civic points
        updateCivicPoints();
        
    } catch (error) {
        hideLoading();
        alert('❌ Failed to verify milestone: ' + error.message);
    }
}

// UI Management
function showAuthSection() {
    hideAllSections();
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('authButtons').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
}

function showCommunitySection() {
    hideAllSections();
    document.getElementById('communitySection').classList.remove('hidden');
    document.getElementById('authButtons').classList.add('hidden');
    
    // Update user menu
    document.getElementById('userEmail').textContent = currentUser?.email || 'Demo User';
    document.getElementById('userMenu').classList.remove('hidden');
}

function showDashboard() {
    hideAllSections();
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('authButtons').classList.add('hidden');
    
    // Update user menu
    document.getElementById('userEmail').textContent = currentUser?.email || 'Demo User';
    document.getElementById('userMenu').classList.remove('hidden');
    
    // Load dashboard data
    loadDashboardData();
}

function hideAllSections() {
    const sections = ['authSection', 'communitySection', 'walletSection', 'dashboardSection'];
    sections.forEach(section => {
        document.getElementById(section)?.classList.add('hidden');
    });
    
    // Hide all auth forms
    const forms = ['userRegisterForm', 'userLoginForm', 'orgRegisterForm', 'orgLoginForm'];
    forms.forEach(form => {
        document.getElementById(form)?.classList.add('hidden');
    });
}

function showForm(formId) {
    hideAllSections();
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById(formId).classList.remove('hidden');
}

async function loadDashboardData() {
    try {
        // Update user info
        updateUserInfo();
        
        // Register member if needed
        await registerMemberIfNeeded();
        
        // Load proposals and milestones
        await Promise.all([
            loadProposals(),
            loadMilestones(),
            loadBudgetData(),
            updateCivicPoints()
        ]);
        
        // Show organization panel if user is org
        if (currentUser?.userType === 'organization') {
            showOrganizationPanel();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateUserInfo() {
    document.getElementById('userEmailDisplay').textContent = currentUser?.email || 'Demo User';
    document.getElementById('userAddress').textContent = DEMO_USER_ADDRESS;
    
    if (currentCommunity) {
        document.getElementById('currentCommunityName').textContent = currentCommunity.name;
        document.getElementById('currentCommunityCode').textContent = currentCommunity.code;
        document.getElementById('communityInfo').classList.remove('hidden');
    }
}

async function registerMemberIfNeeded() {
    try {
        // Check if user is registered
        const memberInfo = await window.demoContract.getMember(DEMO_USER_ADDRESS);
        
        if (!memberInfo[0]) { // Not registered
            const shouldRegister = confirm('Register as a community member to participate in governance?');
            if (shouldRegister) {
                showLoading('Registering as community member...');
                await window.demoContract.registerMember(DEMO_USER_ADDRESS);
                hideLoading();
                alert('🎉 Successfully registered as a community member!');
            }
        }
    } catch (error) {
        console.error('Error checking member registration:', error);
    }
}

async function loadProposals() {
    try {
        const proposals = await window.demoContract.getAllProposals();
        const proposalsList = document.getElementById('proposalsList');
        
        if (proposals.length === 0) {
            proposalsList.innerHTML = '<p class="no-data">No proposals found.</p>';
            return;
        }
        
        proposalsList.innerHTML = proposals.map(proposal => {
            const timeLeft = Math.max(0, proposal.deadline - Date.now());
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            const totalVotes = proposal.yesVotes + proposal.noVotes;
            const approvalRate = totalVotes > 0 ? (proposal.yesVotes / totalVotes * 100).toFixed(1) : 0;
            
            return `
                <div class="proposal-card">
                    <div class="proposal-header">
                        <h4>${proposal.title}</h4>
                        <span class="proposal-amount">$${proposal.amount.toLocaleString()}</span>
                    </div>
                    <p class="proposal-description">${proposal.description}</p>
                    <div class="proposal-stats">
                        <div class="vote-stats">
                            <span class="yes-votes">👍 ${proposal.yesVotes}</span>
                            <span class="no-votes">👎 ${proposal.noVotes}</span>
                            <span class="approval-rate">${approvalRate}% approval</span>
                        </div>
                        <div class="time-left">
                            ⏰ ${daysLeft > 0 ? `${daysLeft} days left` : 'Voting ended'}
                        </div>
                    </div>
                    ${daysLeft > 0 ? `
                    <div class="proposal-actions">
                        <button class="btn btn-success btn-small" onclick="handleVote(${proposal.id}, true)">
                            👍 Vote Yes
                        </button>
                        <button class="btn btn-danger btn-small" onclick="handleVote(${proposal.id}, false)">
                            👎 Vote No
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading proposals:', error);
        document.getElementById('proposalsList').innerHTML = '<p class="error">Error loading proposals.</p>';
    }
}

async function loadMilestones() {
    try {
        const milestones = await window.demoContract.getAllMilestones();
        const milestonesList = document.getElementById('milestonesList');
        
        if (milestones.length === 0) {
            milestonesList.innerHTML = '<p class="no-data">No milestones found.</p>';
            return;
        }
        
        milestonesList.innerHTML = milestones.map(milestone => {
            const verifiedDate = milestone.verifiedAt ? new Date(milestone.verifiedAt).toLocaleDateString() : null;
            
            return `
                <div class="milestone-card ${milestone.verified ? 'verified' : 'pending'}">
                    <div class="milestone-header">
                        <h4>${milestone.title}</h4>
                        <span class="milestone-amount">$${milestone.fundsToRelease.toLocaleString()}</span>
                    </div>
                    <p class="milestone-description">${milestone.description}</p>
                    <div class="milestone-status">
                        ${milestone.verified ? `
                            <span class="status verified">✅ Verified</span>
                            <span class="verified-date">on ${verifiedDate}</span>
                            ${milestone.fundsReleased ? 
                                '<span class="funds-status">💰 Funds Released</span>' : 
                                '<span class="funds-status">⏳ Awaiting Fund Release</span>'
                            }
                        ` : `
                            <span class="status pending">⏳ Pending Verification</span>
                            <button class="btn btn-primary btn-small" onclick="handleVerifyMilestone(${milestone.id})">
                                ✅ Verify Milestone
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading milestones:', error);
        document.getElementById('milestonesList').innerHTML = '<p class="error">Error loading milestones.</p>';
    }
}

async function loadBudgetData() {
    try {
        const totalBudget = await window.demoContract.getTotalBudget();
        const spentAmount = await window.demoContract.getSpentAmount();
        const remainingBudget = totalBudget - spentAmount;
        const spentPercentage = totalBudget > 0 ? (spentAmount / totalBudget * 100) : 0;
        
        document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
        document.getElementById('spentAmount').textContent = `$${spentAmount.toLocaleString()}`;
        document.getElementById('remainingBudget').textContent = `$${remainingBudget.toLocaleString()}`;
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${spentPercentage}%`;
        
        // Load budget chart
        loadBudgetChart(totalBudget, spentAmount, remainingBudget);
        
    } catch (error) {
        console.error('Error loading budget data:', error);
    }
}

function loadBudgetChart(total, spent, remaining) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: [spent, remaining],
                backgroundColor: ['#e74c3c', '#2ecc71'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Budget Allocation'
                }
            }
        }
    });
}

async function updateCivicPoints() {
    try {
        const memberInfo = await window.demoContract.getMember(DEMO_USER_ADDRESS);
        if (memberInfo[0]) { // If registered
            document.getElementById('civicPoints').textContent = memberInfo[2]; // civicPoints
        }
    } catch (error) {
        console.error('Error updating civic points:', error);
    }
}

function showOrganizationPanel() {
    const orgPanel = document.getElementById('orgAdminPanel');
    orgPanel.classList.remove('hidden');
    
    // Update organization info
    document.getElementById('organizationCommunityCode').textContent = currentUser?.communityCode || 'COM-DEMO2025';
    
    // Update member count (demo data)
    document.getElementById('memberCount').textContent = Math.floor(Math.random() * 100) + 20;
    document.getElementById('activeProposals').textContent = window.demoContract.proposals.size;
}

// Utility functions
function showLoading(message = 'Processing...') {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.querySelector('p').textContent = message;
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// Export functions for global access
window.handleVote = handleVote;
window.handleVerifyMilestone = handleVerifyMilestone;

console.log('🎭 Demo App initialized successfully!');
