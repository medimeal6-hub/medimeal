// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HealthRecordRegistry
 * @dev Manages immutable health record hashes with access control
 */
contract HealthRecordRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    struct HealthRecord {
        bytes32 recordHash;
        string ipfsHash;
        address patient;
        address doctor;
        string recordType;
        uint256 timestamp;
        bool isActive;
    }
    
    struct AccessGrant {
        address provider;
        uint256 expiryTime;
        bool isActive;
    }
    
    // Mapping: recordId => HealthRecord
    mapping(uint256 => HealthRecord) public records;
    
    // Mapping: patient => doctor => AccessGrant
    mapping(address => mapping(address => AccessGrant)) public accessGrants;
    
    // Mapping: patient => recordIds[]
    mapping(address => uint256[]) public patientRecords;
    
    // Mapping: recordHash => recordId
    mapping(bytes32 => uint256) public recordHashToId;
    
    uint256 public recordCount;
    
    event RecordRegistered(
        uint256 indexed recordId,
        bytes32 indexed recordHash,
        address indexed patient,
        address doctor,
        string recordType,
        uint256 timestamp
    );
    
    event AccessGranted(
        address indexed patient,
        address indexed provider,
        uint256 expiryTime
    );
    
    event AccessRevoked(
        address indexed patient,
        address indexed provider
    );
    
    event RecordDeactivated(uint256 indexed recordId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new health record
     */
    function registerRecord(
        bytes32 _recordHash,
        string memory _ipfsHash,
        address _patient,
        string memory _recordType
    ) external onlyRole(DOCTOR_ROLE) nonReentrant returns (uint256) {
        require(_recordHash != bytes32(0), "Invalid record hash");
        require(_patient != address(0), "Invalid patient address");
        require(recordHashToId[_recordHash] == 0, "Record already exists");
        
        recordCount++;
        uint256 recordId = recordCount;
        
        records[recordId] = HealthRecord({
            recordHash: _recordHash,
            ipfsHash: _ipfsHash,
            patient: _patient,
            doctor: msg.sender,
            recordType: _recordType,
            timestamp: block.timestamp,
            isActive: true
        });
        
        recordHashToId[_recordHash] = recordId;
        patientRecords[_patient].push(recordId);
        
        emit RecordRegistered(
            recordId,
            _recordHash,
            _patient,
            msg.sender,
            _recordType,
            block.timestamp
        );
        
        return recordId;
    }
    
    /**
     * @dev Verify a health record exists and is valid
     */
    function verifyRecord(bytes32 _recordHash) 
        external 
        view 
        returns (bool exists, bool isActive, uint256 timestamp) 
    {
        uint256 recordId = recordHashToId[_recordHash];
        if (recordId == 0) {
            return (false, false, 0);
        }
        
        HealthRecord memory record = records[recordId];
        return (true, record.isActive, record.timestamp);
    }
    
    /**
     * @dev Get patient's record history
     */
    function getPatientRecords(address _patient) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(
            msg.sender == _patient || 
            hasRole(DOCTOR_ROLE, msg.sender) && hasAccess(_patient, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized access"
        );
        
        return patientRecords[_patient];
    }
    
    /**
     * @dev Grant access to a healthcare provider
     */
    function grantAccess(address _provider, uint256 _duration) 
        external 
        onlyRole(PATIENT_ROLE) 
    {
        require(_provider != address(0), "Invalid provider address");
        require(_duration > 0, "Duration must be positive");
        
        uint256 expiryTime = block.timestamp + _duration;
        
        accessGrants[msg.sender][_provider] = AccessGrant({
            provider: _provider,
            expiryTime: expiryTime,
            isActive: true
        });
        
        emit AccessGranted(msg.sender, _provider, expiryTime);
    }
    
    /**
     * @dev Revoke access from a healthcare provider
     */
    function revokeAccess(address _provider) 
        external 
        onlyRole(PATIENT_ROLE) 
    {
        require(_provider != address(0), "Invalid provider address");
        
        accessGrants[msg.sender][_provider].isActive = false;
        
        emit AccessRevoked(msg.sender, _provider);
    }
    
    /**
     * @dev Check if provider has access to patient data
     */
    function hasAccess(address _patient, address _provider) 
        public 
        view 
        returns (bool) 
    {
        AccessGrant memory grant = accessGrants[_patient][_provider];
        return grant.isActive && block.timestamp < grant.expiryTime;
    }
    
    /**
     * @dev Deactivate a record (soft delete)
     */
    function deactivateRecord(uint256 _recordId) 
        external 
        onlyRole(DOCTOR_ROLE) 
    {
        require(_recordId > 0 && _recordId <= recordCount, "Invalid record ID");
        require(records[_recordId].doctor == msg.sender, "Not record owner");
        
        records[_recordId].isActive = false;
        
        emit RecordDeactivated(_recordId);
    }
    
    /**
     * @dev Get record details
     */
    function getRecord(uint256 _recordId) 
        external 
        view 
        returns (
            bytes32 recordHash,
            string memory ipfsHash,
            address patient,
            address doctor,
            string memory recordType,
            uint256 timestamp,
            bool isActive
        ) 
    {
        require(_recordId > 0 && _recordId <= recordCount, "Invalid record ID");
        HealthRecord memory record = records[_recordId];
        
        require(
            msg.sender == record.patient || 
            msg.sender == record.doctor ||
            hasAccess(record.patient, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized access"
        );
        
        return (
            record.recordHash,
            record.ipfsHash,
            record.patient,
            record.doctor,
            record.recordType,
            record.timestamp,
            record.isActive
        );
    }
}
