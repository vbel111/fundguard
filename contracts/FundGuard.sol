// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FundGuard
 * @dev A Web3 governance and budget transparency platform for local communities
 */
contract FundGuard is Ownable, ReentrancyGuard {
    
    // Structures
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        address proposer;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 createdAt;
        uint256 deadline;
        bool executed;
    }
    
    struct Milestone {
        uint256 id;
        uint256 proposalId;
        string title;
        string description;
        bool verified;
        address verifier;
        uint256 verifiedAt;
        uint256 fundsToRelease;
        bool fundsReleased;
    }
    
    struct Member {
        bool isRegistered;
        uint256 joinedAt;
        uint256 civicPoints;
        uint256 proposalsCreated;
        uint256 votescast;
        uint256 milestonesVerified;
    }
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Milestone) public milestones;
    mapping(address => Member) public members;
    
    // Voting tracking - separate mapping since we can't have mappings in structs easily
    mapping(uint256 => mapping(address => bool)) public proposalVotes;
    
    uint256 public proposalCount;
    uint256 public milestoneCount;
    uint256 public totalBudget;
    uint256 public spentAmount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_CIVIC_POINTS_TO_PROPOSE = 50;
    
    // Civic Points rewards
    uint256 public constant POINTS_FOR_VOTING = 10;
    uint256 public constant POINTS_FOR_PROPOSAL = 20;
    uint256 public constant POINTS_FOR_VERIFICATION = 15;
    
    // Events
    event MemberRegistered(address indexed member, uint256 timestamp);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 amount);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);
    event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed proposalId, string title);
    event MilestoneVerified(uint256 indexed milestoneId, address indexed verifier, bool approved);
    event FundsReleased(uint256 indexed milestoneId, uint256 amount, address recipient);
    event CivicPointsAwarded(address indexed member, uint256 points, string reason);
    event BudgetUpdated(uint256 newTotalBudget);
    
    // Modifiers
    modifier onlyRegisteredMember() {
        require(members[msg.sender].isRegistered, "Must be a registered member");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        _;
    }
    
    modifier validMilestone(uint256 _milestoneId) {
        require(_milestoneId > 0 && _milestoneId <= milestoneCount, "Invalid milestone ID");
        _;
    }
    
    constructor(uint256 _initialBudget) Ownable(msg.sender) {
        totalBudget = _initialBudget;
        emit BudgetUpdated(_initialBudget);
    }
    
    /**
     * @dev Register as a community member
     */
    function registerMember() external {
        require(!members[msg.sender].isRegistered, "Already registered");
        
        members[msg.sender] = Member({
            isRegistered: true,
            joinedAt: block.timestamp,
            civicPoints: 0,
            proposalsCreated: 0,
            votescast: 0,
            milestonesVerified: 0
        });
        
        emit MemberRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Create a new funding proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _amount
    ) external onlyRegisteredMember {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= (totalBudget - spentAmount), "Insufficient budget");
        require(
            members[msg.sender].civicPoints >= MIN_CIVIC_POINTS_TO_PROPOSE,
            "Insufficient civic points to create proposal"
        );
        
        proposalCount++;
        
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.amount = _amount;
        newProposal.proposer = msg.sender;
        newProposal.createdAt = block.timestamp;
        newProposal.deadline = block.timestamp + VOTING_PERIOD;
        newProposal.executed = false;
        
        // Update member stats and award civic points
        members[msg.sender].proposalsCreated++;
        _awardCivicPoints(msg.sender, POINTS_FOR_PROPOSAL, "Proposal Creation");
        
        emit ProposalCreated(proposalCount, msg.sender, _title, _amount);
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 _proposalId, bool _support) 
        external 
        onlyRegisteredMember 
        validProposal(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp <= proposal.deadline, "Voting period has ended");
        require(!proposalVotes[_proposalId][msg.sender], "Already voted on this proposal");
        require(!proposal.executed, "Proposal already executed");
        
        proposalVotes[_proposalId][msg.sender] = true;
        
        if (_support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        // Update member stats and award civic points
        members[msg.sender].votescast++;
        _awardCivicPoints(msg.sender, POINTS_FOR_VOTING, "Voting");
        
        emit VoteCast(_proposalId, msg.sender, _support);
    }
    
    /**
     * @dev Execute a proposal after voting period ends
     */
    function executeProposal(uint256 _proposalId) 
        external 
        validProposal(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        bool approved = proposal.yesVotes > proposal.noVotes;
        
        if (approved) {
            // Create initial milestone for the approved proposal
            _createMilestone(_proposalId, "Project Initiation", "Initial milestone for project setup", proposal.amount);
        }
        
        emit ProposalExecuted(_proposalId, approved);
    }
    
    /**
     * @dev Create a milestone for a proposal
     */
    function _createMilestone(
        uint256 _proposalId,
        string memory _title,
        string memory _description,
        uint256 _fundsToRelease
    ) internal {
        milestoneCount++;
        
        milestones[milestoneCount] = Milestone({
            id: milestoneCount,
            proposalId: _proposalId,
            title: _title,
            description: _description,
            verified: false,
            verifier: address(0),
            verifiedAt: 0,
            fundsToRelease: _fundsToRelease,
            fundsReleased: false
        });
        
        emit MilestoneCreated(milestoneCount, _proposalId, _title);
    }
    
    /**
     * @dev Verify a milestone
     */
    function verifyMilestone(uint256 _milestoneId, bool _approved) 
        external 
        onlyRegisteredMember 
        validMilestone(_milestoneId) 
    {
        Milestone storage milestone = milestones[_milestoneId];
        
        require(!milestone.verified, "Milestone already verified");
        require(milestone.verifier == address(0), "Milestone verification in progress");
        
        milestone.verified = _approved;
        milestone.verifier = msg.sender;
        milestone.verifiedAt = block.timestamp;
        
        if (_approved && !milestone.fundsReleased) {
            // Release funds
            milestone.fundsReleased = true;
            spentAmount += milestone.fundsToRelease;
            
            // In a real implementation, you would transfer funds to the project executor
            emit FundsReleased(_milestoneId, milestone.fundsToRelease, proposals[milestone.proposalId].proposer);
        }
        
        // Update member stats and award civic points
        members[msg.sender].milestonesVerified++;
        _awardCivicPoints(msg.sender, POINTS_FOR_VERIFICATION, "Milestone Verification");
        
        emit MilestoneVerified(_milestoneId, msg.sender, _approved);
    }
    
    /**
     * @dev Award civic points to a member
     */
    function _awardCivicPoints(address _member, uint256 _points, string memory _reason) internal {
        members[_member].civicPoints += _points;
        emit CivicPointsAwarded(_member, _points, _reason);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 amount,
            address proposer,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 createdAt,
            uint256 deadline,
            bool executed
        ) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
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
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 _milestoneId) 
        external 
        view 
        validMilestone(_milestoneId) 
        returns (
            uint256 id,
            uint256 proposalId,
            string memory title,
            string memory description,
            bool verified,
            address verifier,
            uint256 verifiedAt,
            uint256 fundsToRelease,
            bool fundsReleased
        ) 
    {
        Milestone storage milestone = milestones[_milestoneId];
        return (
            milestone.id,
            milestone.proposalId,
            milestone.title,
            milestone.description,
            milestone.verified,
            milestone.verifier,
            milestone.verifiedAt,
            milestone.fundsToRelease,
            milestone.fundsReleased
        );
    }
    
    /**
     * @dev Get member details
     */
    function getMember(address _member) 
        external 
        view 
        returns (
            bool isRegistered,
            uint256 joinedAt,
            uint256 civicPoints,
            uint256 proposalsCreated,
            uint256 votescast,
            uint256 milestonesVerified
        ) 
    {
        Member storage member = members[_member];
        return (
            member.isRegistered,
            member.joinedAt,
            member.civicPoints,
            member.proposalsCreated,
            member.votescast,
            member.milestonesVerified
        );
    }
    
    /**
     * @dev Check if member has voted on a proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) 
        external 
        view 
        validProposal(_proposalId) 
        returns (bool) 
    {
        return proposalVotes[_proposalId][_voter];
    }
    
    /**
     * @dev Get budget information
     */
    function getBudgetInfo() 
        external 
        view 
        returns (uint256 total, uint256 spent, uint256 remaining) 
    {
        return (totalBudget, spentAmount, totalBudget - spentAmount);
    }
    
    /**
     * @dev Update total budget (only owner)
     */
    function updateBudget(uint256 _newBudget) external onlyOwner {
        require(_newBudget >= spentAmount, "New budget cannot be less than spent amount");
        totalBudget = _newBudget;
        emit BudgetUpdated(_newBudget);
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        // Accept ETH deposits to fund the contract
    }
}
