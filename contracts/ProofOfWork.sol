// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

/**
* @title Proof of work for Smart Contracts
* @author Ken Hodler
* @notice A proof-of-work system for smart contracts
* @dev This contract verifies the work done by the proof-of-work web worker. The work is done over the hash of a
* recent block, the previous hash, and the address of the claimant. This ensures that the work is:
* - recent (within the last 256 blocks or ~ 1 hour)
* - for the right work chain
* - doesn't use a previous nonce
* - usable by only one claimant (prevent front running)
* This contract supports multiple work chains that are identified by the address of the calling contract. This ensures
* that work done for one work chain can't be used for another.
*/
contract ProofOfWork {
    uint256 BASE_DIFFICULTY = 0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    mapping(address => uint256) target;
    mapping(address => bytes32) lastHash;

    /**
    * @notice Difficulty changed
    * @param owner Work chain identifier
    * @param difficulty The new difficulty.
    */
    event DifficultyChanged(address owner, uint256 difficulty);

    /**
    * @notice Work successfully reported
    * @param owner Work chain identifier
    * @param sender The address of claimant
    * @param lastHash The hash of the previous work
    * @param blockHash The blockhash used in the work
    * @param nonce The nonce that was used to prove that the work was done
    */
    event WorkReported(address owner, address sender, bytes32 lastHash, bytes32 blockHash, bytes32 nonce);

    /**
    * @notice Check a provided nonce to verify that the proper amount of work is demonstrated
    * @param _sender The address of the claimant
    * @param _blockNumber The blocknumber whose hash was used
    * @param _nonce The nonce that produces H(sender+lastHash+blockhash+nonce) that satisfies the required work proof
    * @dev The parameters used for work verification are based on the address of the sender (the immediate caller
    * of the function). If called by a different sender, it will use different parameters and produce different
    * results.
    */
    function reportWork(address _sender, uint _blockNumber, bytes32 _nonce) public {
        address _caller = msg.sender;

        // Get the _blockhash corresponding to the provided block number
        bytes32 _blockHash = blockhash(_blockNumber);
        // if the black hash isn't available, the work is too old (256 blocks)
        require(uint256(_blockHash) != 0, 'Work expired');

        // calculate the work hash
        bytes32 _work = keccak256(abi.encodePacked(_sender, lastHash[_caller], _blockHash, _nonce));

        // check that the hash is less than the target
        // Note: This failure will be triggered when:
        // - work done for another address
        // - a nonce that was already used
        // - doing work that doesn't satisify the difficulty requirement
        // - using a blockhash that doesn't match the provided block number
        require(uint256(_work) <= getMaximumTarget(_caller), 'Invalid work');

        // save the hash to maintain a chain of work
        lastHash[_caller] = _work;

        emit WorkReported(_caller, _sender,  lastHash[_caller], _blockHash, _nonce);
    }

    /**
    * @notice Set the difficulty required for future work
    * @param _difficulty The new difficult index.
    * @dev The difficult defines the maximum accepted target value of the hash calculated in reportWork(). As
    * difficulty increases, the target is decreased. When difficult is 0, any hash will be accepted. A difficulty
    * of 1 is the base difficulty and requires an average of 2^15 hashes to find a hash below the target.
    * Difficulty increases the the required work linearly. Doubling of the difficulty doubles the required
    * amount of work.
    */
    function setDifficulty(uint256 _difficulty) public {
        address _caller = msg.sender;
        target[_caller] = _difficulty != 0 ? BASE_DIFFICULTY / _difficulty : 0;
        emit DifficultyChanged(_caller, _difficulty);
    }

    /**
    * @notice Get the current work target
    * @param _contractAddr Work chain identifier
    * @return _maxTarget The maximum allowed value of the hash of reported work
    * @dev When difficulty is zero, the max target is the 2^256-1. Otherwise it is the (2^240-1)/difficulty
    */
    function getMaximumTarget(address _contractAddr) public view returns (uint256 _maxTarget) {
        // If the target hasn't been set, treat it like diffculty = 0
        return target[_contractAddr] != 0 ? target[_contractAddr] : type(uint256).max;
    }

    /**
    * @notice Get the last hash
    * @param _contractAddr Work chain identifier
    * @return _lastHash The resulting hash of the last reported work
    */
    function getLastHash(address _contractAddr) public view returns (bytes32 _lastHash) {
        return lastHash[_contractAddr];
    }

}
