// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Proof of work for contracts
/// @author Ken Hodler
/// @notice Inspired by MoonCats, this contract implements a proof-of-work system for smart contracts.
/// @dev The caller to this contract determines the parameters that will be used. Every contract that uses it can ...
contract ProofOfWork {
    uint256 BASE_DIFFICULTY = 0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    mapping(address => bytes32) salt;
    mapping(address => uint256) target;
    mapping(address => uint8) genomeBitLength;

    event DifficultyChanged(address owner, uint256 difficulty);
    event SaltChanged(address owner, bytes32 salt);
    event GenomeBitLengthChanged(address owner, uint8 genomeBitLength);

    /**
    * @notice Check a provided nonce to verify that the proper amount of work was demonstrated.
    * @param _sender The address of the user
    * @param _blockNumber The blocknumber whose hash was used
    * @param _nonce The nonce that produces H(sender+salt+blockhash+nonce) that satisfies the required work proof
    **/
    function checkWork(address _sender, uint _blockNumber, bytes32 _nonce) public view returns (bytes32 dna) {
        address _caller = msg.sender;

        // Get the _blockhash corresponding to the provided block number
        bytes32 _blockHash = blockhash(_blockNumber);
        // if the black hash isn't available, the work is too old (256 blocks)
        require(uint256(_blockHash) != 0, 'Work expired');

        // calculate the work hash
        bytes32 _work = keccak256(abi.encodePacked(_sender, salt[_caller], _blockHash, _nonce));

        // check that the hash is less than the target
        require(uint256(_work) <= getTarget(_caller), 'not enough work');

        // get the appropriate bits from the end of the _nonce for use as the dna
        uint256 _dna = uint256(_nonce) % 2 ** uint256(genomeBitLength[_caller]);
        return bytes32(_dna);
    }

    function setDifficulty(uint256 _difficulty) public {
        address _caller = msg.sender;
        target[_caller] = _difficulty != 0 ? BASE_DIFFICULTY / _difficulty : 0;
        emit DifficultyChanged(_caller, _difficulty);
    }

    function setSalt(bytes32 _salt) public {
        address _caller = msg.sender;
        salt[_caller] = _salt;
        emit SaltChanged(_caller, _salt);
    }

    function setGenomeBitSize(uint8 _genomeBitLength) public {
        address _caller = msg.sender;
        genomeBitLength[_caller] = _genomeBitLength;
        emit GenomeBitLengthChanged(_caller, _genomeBitLength);
    }

    function getSalt(address _contractAddr) public view returns (bytes32) {
        return salt[_contractAddr];
    }

    function getTarget(address _contractAddr) public view returns (uint256) {
        // If the target hasn't been set, treat it like diffculty = 0
        return target[_contractAddr] != 0 ? target[_contractAddr] : type(uint256).max;
    }

    function getGenomeBitSize(address _contractAddr) public view returns (uint8) {
        return genomeBitLength[_contractAddr];
    }

}
