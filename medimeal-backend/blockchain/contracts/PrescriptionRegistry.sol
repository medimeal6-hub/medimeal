// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrescriptionRegistry
 * @dev Manages prescription issuance and verification on blockchain
 */
contract PrescriptionRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PHARMACIST_ROLE = keccak256("PHARMACIST_ROLE");
    
    struct Prescription {
        bytes32 prescriptionHash;
        address patient;
        address doctor;
        string ipfsHash;
        uint256 issueDate;
        uint256 validUntil;
        bool isValid;
        bool isFilled;
        address filledBy;
        uint256 filledAt;
    }
    
    mapping(uint256 => Prescription) public prescriptions;
    mapping(bytes32 => uint256) public prescriptionHashToId;
    mapping(address => uint256[]) public patientPrescriptions;
    mapping(address => uint256[]) public doctorPrescriptions;
    
    uint256 public prescriptionCount;
    
    event PrescriptionIssued(
        uint256 indexed prescriptionId,
        bytes32 indexed prescriptionHash,
        address indexed patient,
        address doctor,
        uint256 issueDate,
        uint256 validUntil
    );
    
    event PrescriptionFilled(
        uint256 indexed prescriptionId,
        address indexed pharmacist,
        uint256 filledAt
    );
    
    event PrescriptionInvalidated(
        uint256 indexed prescriptionId,
        address indexed invalidatedBy
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Issue a new prescription
     */
    function issuePrescription(
        bytes32 _prescriptionHash,
        address _patient,
        string memory _ipfsHash,
        uint256 _validityDays
    ) external onlyRole(DOCTOR_ROLE) nonReentrant returns (uint256) {
        require(_prescriptionHash != bytes32(0), "Invalid prescription hash");
        require(_patient != address(0), "Invalid patient address");
        require(_validityDays > 0 && _validityDays <= 365, "Invalid validity period");
        require(prescriptionHashToId[_prescriptionHash] == 0, "Prescription already exists");
        
        prescriptionCount++;
        uint256 prescriptionId = prescriptionCount;
        
        uint256 issueDate = block.timestamp;
        uint256 validUntil = issueDate + (_validityDays * 1 days);
        
        prescriptions[prescriptionId] = Prescription({
            prescriptionHash: _prescriptionHash,
            patient: _patient,
            doctor: msg.sender,
            ipfsHash: _ipfsHash,
            issueDate: issueDate,
            validUntil: validUntil,
            isValid: true,
            isFilled: false,
            filledBy: address(0),
            filledAt: 0
        });
        
        prescriptionHashToId[_prescriptionHash] = prescriptionId;
        patientPrescriptions[_patient].push(prescriptionId);
        doctorPrescriptions[msg.sender].push(prescriptionId);
        
        emit PrescriptionIssued(
            prescriptionId,
            _prescriptionHash,
            _patient,
            msg.sender,
            issueDate,
            validUntil
        );
        
        return prescriptionId;
    }
    
    /**
     * @dev Verify prescription validity
     */
    function verifyPrescription(bytes32 _prescriptionHash) 
        external 
        view 
        returns (
            bool exists,
            bool isValid,
            bool isExpired,
            bool isFilled,
            address doctor,
            address patient
        ) 
    {
        uint256 prescriptionId = prescriptionHashToId[_prescriptionHash];
        
        if (prescriptionId == 0) {
            return (false, false, false, false, address(0), address(0));
        }
        
        Prescription memory prescription = prescriptions[prescriptionId];
        bool expired = block.timestamp > prescription.validUntil;
        
        return (
            true,
            prescription.isValid,
            expired,
            prescription.isFilled,
            prescription.doctor,
            prescription.patient
        );
    }
    
    /**
     * @dev Fill a prescription (pharmacist action)
     */
    function fillPrescription(uint256 _prescriptionId) 
        external 
        onlyRole(PHARMACIST_ROLE) 
        nonReentrant 
    {
        require(_prescriptionId > 0 && _prescriptionId <= prescriptionCount, "Invalid prescription ID");
        
        Prescription storage prescription = prescriptions[_prescriptionId];
        
        require(prescription.isValid, "Prescription is not valid");
        require(!prescription.isFilled, "Prescription already filled");
        require(block.timestamp <= prescription.validUntil, "Prescription expired");
        
        prescription.isFilled = true;
        prescription.filledBy = msg.sender;
        prescription.filledAt = block.timestamp;
        
        emit PrescriptionFilled(_prescriptionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Invalidate a prescription
     */
    function invalidatePrescription(uint256 _prescriptionId) 
        external 
        nonReentrant 
    {
        require(_prescriptionId > 0 && _prescriptionId <= prescriptionCount, "Invalid prescription ID");
        
        Prescription storage prescription = prescriptions[_prescriptionId];
        
        require(
            msg.sender == prescription.doctor || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        require(prescription.isValid, "Prescription already invalid");
        
        prescription.isValid = false;
        
        emit PrescriptionInvalidated(_prescriptionId, msg.sender);
    }
    
    /**
     * @dev Get patient's prescriptions
     */
    function getPatientPrescriptions(address _patient) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(
            msg.sender == _patient || 
            hasRole(DOCTOR_ROLE, msg.sender) ||
            hasRole(PHARMACIST_ROLE, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        return patientPrescriptions[_patient];
    }
    
    /**
     * @dev Get doctor's prescriptions
     */
    function getDoctorPrescriptions(address _doctor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(
            msg.sender == _doctor || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        return doctorPrescriptions[_doctor];
    }
    
    /**
     * @dev Get prescription details
     */
    function getPrescription(uint256 _prescriptionId) 
        external 
        view 
        returns (
            bytes32 prescriptionHash,
            address patient,
            address doctor,
            string memory ipfsHash,
            uint256 issueDate,
            uint256 validUntil,
            bool isValid,
            bool isFilled
        ) 
    {
        require(_prescriptionId > 0 && _prescriptionId <= prescriptionCount, "Invalid prescription ID");
        
        Prescription memory prescription = prescriptions[_prescriptionId];
        
        require(
            msg.sender == prescription.patient || 
            msg.sender == prescription.doctor ||
            hasRole(PHARMACIST_ROLE, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        return (
            prescription.prescriptionHash,
            prescription.patient,
            prescription.doctor,
            prescription.ipfsHash,
            prescription.issueDate,
            prescription.validUntil,
            prescription.isValid,
            prescription.isFilled
        );
    }
}
