// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ConsentManager
 * @dev Manages patient consent for data sharing with healthcare providers
 */
contract ConsentManager is AccessControl {
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    struct Consent {
        address provider;
        string[] dataTypes;
        uint256 grantedAt;
        uint256 expiryTime;
        bool isActive;
        string purpose;
    }
    
    // patient => provider => Consent
    mapping(address => mapping(address => Consent)) public consents;
    
    // patient => providers[]
    mapping(address => address[]) public patientProviders;
    
    // Audit log
    struct ConsentLog {
        address patient;
        address provider;
        string action; // "granted", "revoked", "expired"
        uint256 timestamp;
    }
    
    ConsentLog[] public auditLog;
    
    event ConsentGranted(
        address indexed patient,
        address indexed provider,
        string[] dataTypes,
        uint256 expiryTime,
        string purpose
    );
    
    event ConsentRevoked(
        address indexed patient,
        address indexed provider,
        uint256 timestamp
    );
    
    event ConsentExpired(
        address indexed patient,
        address indexed provider,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Grant consent to a healthcare provider
     */
    function grantConsent(
        address _provider,
        string[] memory _dataTypes,
        uint256 _durationDays,
        string memory _purpose
    ) external onlyRole(PATIENT_ROLE) {
        require(_provider != address(0), "Invalid provider address");
        require(_dataTypes.length > 0, "Must specify data types");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        
        uint256 expiryTime = block.timestamp + (_durationDays * 1 days);
        
        // Check if this is a new provider for the patient
        bool isNewProvider = !consents[msg.sender][_provider].isActive;
        
        consents[msg.sender][_provider] = Consent({
            provider: _provider,
            dataTypes: _dataTypes,
            grantedAt: block.timestamp,
            expiryTime: expiryTime,
            isActive: true,
            purpose: _purpose
        });
        
        if (isNewProvider) {
            patientProviders[msg.sender].push(_provider);
        }
        
        auditLog.push(ConsentLog({
            patient: msg.sender,
            provider: _provider,
            action: "granted",
            timestamp: block.timestamp
        }));
        
        emit ConsentGranted(msg.sender, _provider, _dataTypes, expiryTime, _purpose);
    }
    
    /**
     * @dev Revoke consent from a provider
     */
    function revokeConsent(address _provider) 
        external 
        onlyRole(PATIENT_ROLE) 
    {
        require(_provider != address(0), "Invalid provider address");
        require(consents[msg.sender][_provider].isActive, "No active consent");
        
        consents[msg.sender][_provider].isActive = false;
        
        auditLog.push(ConsentLog({
            patient: msg.sender,
            provider: _provider,
            action: "revoked",
            timestamp: block.timestamp
        }));
        
        emit ConsentRevoked(msg.sender, _provider, block.timestamp);
    }
    
    /**
     * @dev Check if provider has valid consent
     */
    function checkConsent(address _patient, address _provider) 
        external 
        view 
        returns (bool hasConsent, string[] memory dataTypes, uint256 expiryTime) 
    {
        Consent memory consent = consents[_patient][_provider];
        
        bool isValid = consent.isActive && block.timestamp < consent.expiryTime;
        
        return (isValid, consent.dataTypes, consent.expiryTime);
    }
    
    /**
     * @dev Check if provider can access specific data type
     */
    function canAccessDataType(
        address _patient,
        address _provider,
        string memory _dataType
    ) external view returns (bool) {
        Consent memory consent = consents[_patient][_provider];
        
        if (!consent.isActive || block.timestamp >= consent.expiryTime) {
            return false;
        }
        
        for (uint i = 0; i < consent.dataTypes.length; i++) {
            if (keccak256(bytes(consent.dataTypes[i])) == keccak256(bytes(_dataType))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get all providers with consent from a patient
     */
    function getPatientProviders(address _patient) 
        external 
        view 
        returns (address[] memory) 
    {
        require(
            msg.sender == _patient || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        return patientProviders[_patient];
    }
    
    /**
     * @dev Get consent details
     */
    function getConsent(address _patient, address _provider) 
        external 
        view 
        returns (
            string[] memory dataTypes,
            uint256 grantedAt,
            uint256 expiryTime,
            bool isActive,
            string memory purpose
        ) 
    {
        require(
            msg.sender == _patient || 
            msg.sender == _provider ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        Consent memory consent = consents[_patient][_provider];
        
        return (
            consent.dataTypes,
            consent.grantedAt,
            consent.expiryTime,
            consent.isActive && block.timestamp < consent.expiryTime,
            consent.purpose
        );
    }
    
    /**
     * @dev Get audit log count
     */
    function getAuditLogCount() external view returns (uint256) {
        return auditLog.length;
    }
    
    /**
     * @dev Get audit log entry
     */
    function getAuditLogEntry(uint256 _index) 
        external 
        view 
        returns (
            address patient,
            address provider,
            string memory action,
            uint256 timestamp
        ) 
    {
        require(_index < auditLog.length, "Invalid index");
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Admin only");
        
        ConsentLog memory log = auditLog[_index];
        return (log.patient, log.provider, log.action, log.timestamp);
    }
}
