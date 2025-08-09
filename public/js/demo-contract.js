/**
 * Demo Contract - JavaScript simulation of FundGuard smart contract
 * This replaces Web3 functionality for demo purposes
 */

class DemoFundGuardContract {
    constructor() {
        // Initialize with demo data
        this.members = new Map();
        this.proposals = new Map();
        this.milestones = new Map();
        this.communities = new Map();
        
        // Counters for IDs
        this.proposalCounter = 0;
        this.milestoneCounter = 0;
        
        // Demo community data
        this.initializeDemoData();
    }
    
    initializeDemoData() {
        // Add some demo proposals for immediate testing
        this.createDemoProposal({
            title: "Community Park Renovation",
            description: "Renovate the central park with new playground equipment, walking paths, and landscaping to improve community recreation facilities.",
            amount: 25000,
            proposer: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22"
        });
        
        this.createDemoProposal({
            title: "Local Food Bank Support",
            description: "Provide funding for the local food bank to support families in need during the winter months.",
            amount: 15000,
            proposer: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22"
        });
        
        this.createDemoProposal({
            title: "Youth Education Program",
            description: "Fund after-school tutoring and educational activities for local students.",
            amount: 8000,
            proposer: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22"
        });
        
        // Add demo milestones
        this.createDemoMilestone(1, "Site Survey and Planning", "Complete site survey and create detailed renovation plans", 5000);
        this.createDemoMilestone(1, "Equipment Purchase", "Purchase playground equipment and materials", 12000);
        this.createDemoMilestone(1, "Construction Phase 1", "Install playground equipment", 8000);
        
        this.createDemoMilestone(2, "Food Distribution Setup", "Establish distribution protocols and volunteer training", 3000);
        this.createDemoMilestone(2, "Winter Supply Purchase", "Purchase food supplies for winter distribution", 12000);
    }
    
    createDemoProposal(data) {
        this.proposalCounter++;
        const proposal = {
            id: this.proposalCounter,
            title: data.title,
            description: data.description,
            amount: data.amount,
            proposer: data.proposer,
            yesVotes: Math.floor(Math.random() * 50) + 10, // Random votes for demo
            noVotes: Math.floor(Math.random() * 20) + 2,
            createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 7), // Random time in last week
            deadline: Date.now() + 86400000 * 14, // 14 days from now
            executed: false,
            status: Math.random() > 0.3 ? 'active' : 'passed'
        };
        this.proposals.set(this.proposalCounter, proposal);
        return this.proposalCounter;
    }
    
    createDemoMilestone(proposalId, title, description, fundsToRelease) {
        this.milestoneCounter++;
        const milestone = {
            id: this.milestoneCounter,
            proposalId: proposalId,
            title: title,
            description: description,
            verified: Math.random() > 0.6, // Random verification status
            verifier: Math.random() > 0.5 ? "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22" : null,
            verifiedAt: Math.random() > 0.5 ? Date.now() - Math.floor(Math.random() * 86400000 * 3) : 0,
            fundsToRelease: fundsToRelease,
            fundsReleased: Math.random() > 0.7
        };
        this.milestones.set(this.milestoneCounter, milestone);
        return this.milestoneCounter;
    }
    
    // Simulate async blockchain calls with delays
    async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Contract functions simulation
    async registerMember(address) {
        await this.delay();
        
        if (this.members.has(address)) {
            throw new Error("Member already registered");
        }
        
        const member = {
            isRegistered: true,
            joinedAt: Date.now(),
            civicPoints: 0,
            proposalsCreated: 0,
            votescast: 0,
            milestonesVerified: 0
        };
        
        this.members.set(address, member);
        
        console.log('✅ Demo: Member registered successfully');
        return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: async () => ({ status: 1 })
        };
    }
    
    async getMember(address) {
        await this.delay(100); // Shorter delay for read operations
        
        const member = this.members.get(address);
        if (!member) {
            return [false, 0, 0, 0, 0, 0]; // Default values when not registered
        }
        
        return [
            member.isRegistered,
            member.joinedAt,
            member.civicPoints,
            member.proposalsCreated,
            member.votescast,
            member.milestonesVerified
        ];
    }
    
    async createProposal(title, description, amount) {
        await this.delay();
        
        this.proposalCounter++;
        const proposal = {
            id: this.proposalCounter,
            title: title,
            description: description,
            amount: amount,
            proposer: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22", // Demo address
            yesVotes: 0,
            noVotes: 0,
            createdAt: Date.now(),
            deadline: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
            executed: false,
            status: 'active'
        };
        
        this.proposals.set(this.proposalCounter, proposal);
        
        console.log('✅ Demo: Proposal created successfully');
        return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: async () => ({ status: 1 })
        };
    }
    
    async getProposal(id) {
        await this.delay(100);
        
        const proposal = this.proposals.get(id);
        if (!proposal) {
            throw new Error("Proposal not found");
        }
        
        return [
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.amount,
            proposal.proposer,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.createdAt,
            proposal.deadline,
            proposal.executed
        ];
    }
    
    async getAllProposals() {
        await this.delay(200);
        return Array.from(this.proposals.values());
    }
    
    async vote(proposalId, support) {
        await this.delay();
        
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error("Proposal not found");
        }
        
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        // Update member stats
        const memberAddress = "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22";
        const member = this.members.get(memberAddress);
        if (member) {
            member.votescast++;
            member.civicPoints += 5;
        }
        
        console.log(`✅ Demo: Vote cast ${support ? 'in favor' : 'against'} proposal ${proposalId}`);
        return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: async () => ({ status: 1 })
        };
    }
    
    async createMilestone(proposalId, title, description, fundsToRelease) {
        await this.delay();
        
        this.milestoneCounter++;
        const milestone = {
            id: this.milestoneCounter,
            proposalId: proposalId,
            title: title,
            description: description,
            verified: false,
            verifier: null,
            verifiedAt: 0,
            fundsToRelease: fundsToRelease,
            fundsReleased: false
        };
        
        this.milestones.set(this.milestoneCounter, milestone);
        
        console.log('✅ Demo: Milestone created successfully');
        return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: async () => ({ status: 1 })
        };
    }
    
    async verifyMilestone(milestoneId) {
        await this.delay();
        
        const milestone = this.milestones.get(milestoneId);
        if (!milestone) {
            throw new Error("Milestone not found");
        }
        
        if (milestone.verified) {
            throw new Error("Milestone already verified");
        }
        
        milestone.verified = true;
        milestone.verifier = "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22";
        milestone.verifiedAt = Date.now();
        
        // Update member stats
        const memberAddress = "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22";
        const member = this.members.get(memberAddress);
        if (member) {
            member.milestonesVerified++;
            member.civicPoints += 10;
        }
        
        console.log('✅ Demo: Milestone verified successfully');
        return {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            wait: async () => ({ status: 1 })
        };
    }
    
    async getMilestone(id) {
        await this.delay(100);
        
        const milestone = this.milestones.get(id);
        if (!milestone) {
            throw new Error("Milestone not found");
        }
        
        return [
            milestone.id,
            milestone.proposalId,
            milestone.title,
            milestone.description,
            milestone.verified,
            milestone.verifier || "0x0000000000000000000000000000000000000000",
            milestone.verifiedAt,
            milestone.fundsToRelease,
            milestone.fundsReleased
        ];
    }
    
    async getAllMilestones() {
        await this.delay(200);
        return Array.from(this.milestones.values());
    }
    
    async getMilestonesForProposal(proposalId) {
        await this.delay(150);
        return Array.from(this.milestones.values()).filter(m => m.proposalId === proposalId);
    }
    
    // Budget and analytics functions
    async getTotalBudget() {
        await this.delay(100);
        return Array.from(this.proposals.values())
            .filter(p => p.status === 'passed')
            .reduce((sum, p) => sum + p.amount, 0);
    }
    
    async getSpentAmount() {
        await this.delay(100);
        return Array.from(this.milestones.values())
            .filter(m => m.fundsReleased)
            .reduce((sum, m) => sum + m.fundsToRelease, 0);
    }
    
    // Demo utility functions
    generateDemoData() {
        // Add more random proposals and milestones for testing
        const demoProposals = [
            { title: "Street Light Improvement", description: "Install LED street lights for better safety", amount: 12000 },
            { title: "Community Center WiFi", description: "Provide free WiFi access at the community center", amount: 5000 },
            { title: "Senior Care Program", description: "Fund assistance programs for elderly residents", amount: 18000 }
        ];
        
        demoProposals.forEach(proposal => {
            this.createDemoProposal({
                ...proposal,
                proposer: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22"
            });
        });
    }
    
    // Reset demo data
    reset() {
        this.members.clear();
        this.proposals.clear();
        this.milestones.clear();
        this.communities.clear();
        this.proposalCounter = 0;
        this.milestoneCounter = 0;
        this.initializeDemoData();
        console.log('🔄 Demo data reset');
    }
}

// Global demo contract instance
window.demoContract = new DemoFundGuardContract();

// Demo mode flag
window.DEMO_MODE = true;

// Demo user simulation
window.demoUser = {
    address: "0x742d35Cc6493C4DFb50c78A6B2C4857b84C30c22",
    email: "demo@fundguard.local",
    userType: "user",
    isRegistered: false
};

console.log('🎭 Demo Contract initialized with sample data');
console.log('📊 Available proposals:', window.demoContract.proposals.size);
console.log('🎯 Available milestones:', window.demoContract.milestones.size);
