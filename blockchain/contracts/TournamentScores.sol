// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TournamentScores {
    address public owner;
    
    struct Score {
        uint tournamentId;
        uint winnerId;
        uint winnerIdScore;
        uint loserId;
        uint loserIdScore;
    }

    // Mapping from tournamentId to an array of scores
    mapping(uint => Score[]) public tournamentScores;
    uint[] public tournamentIds;
    
    // Events for tracking
    event ScoreStored(uint indexed tournamentId, uint winnerId, uint loserId, uint timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Function to store a score for a specific tournament (only owner)
    function storeScore(
        uint _tournamentId, 
        uint _winnerId, 
        uint _winnerIdScore, 
        uint _loserId, 
        uint _loserIdScore
    ) public onlyOwner {
        // Input validation
        require(_winnerId != _loserId, "Winner and loser cannot be the same");
        require(_winnerIdScore >= _loserIdScore, "Winner score must be >= loser score");
        require(_tournamentId > 0, "Tournament ID must be greater than 0");
        
        if (tournamentScores[_tournamentId].length == 0) {
            tournamentIds.push(_tournamentId);
        }
        
        tournamentScores[_tournamentId].push(
            Score(_tournamentId, _winnerId, _winnerIdScore, _loserId, _loserIdScore)
        );
        
        emit ScoreStored(_tournamentId, _winnerId, _loserId, block.timestamp);
    }

    // Function to get scores for a specific tournament
    function getScores(uint _tournamentId) public view returns (Score[] memory) {
        return tournamentScores[_tournamentId];
    }
    
    function getAllTournamentIds() public view returns (uint[] memory) {
        return tournamentIds;
    }
    
    // Get total number of scores for a tournament
    function getTournamentScoreCount(uint _tournamentId) public view returns (uint) {
        return tournamentScores[_tournamentId].length;
    }
}
