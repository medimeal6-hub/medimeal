// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AppointmentRegistry
 * @dev Manages immutable appointment records with status tracking and audit trail
 */
contract AppointmentRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum AppointmentStatus {
        SCHEDULED,
        CONFIRMED,
        COMPLETED,
        CANCELLED,
        NO_SHOW,
        RESCHEDULED
    }
    
    struct Appointment {
        bytes32 appointmentHash;
        address patient;
        address doctor;
        uint256 appointmentDate;
        string appointmentType;
        AppointmentStatus status;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        uint256 completedAt;
        uint256 cancelledAt;
        string ipfsHash;
        bool isActive;
    }
    
    struct StatusChange {
        AppointmentStatus fromStatus;
        AppointmentStatus toStatus;
        uint256 timestamp;
        address changedBy;
        string reason;
    }
    
    struct RescheduleInfo {
        uint256 originalDate;
        uint256 newDate;
        uint256 timestamp;
        string reason;
        address rescheduledBy;
    }
    
    // Mappings
    mapping(uint256 => Appointment) public appointments;
    mapping(bytes32 => uint256) public appointmentHashToId;
    mapping(uint256 => StatusChange[]) public appointmentHistory;
    mapping(uint256 => RescheduleInfo[]) public rescheduleHistory;
    mapping(address => uint256[]) public patientAppointments;
    mapping(address => uint256[]) public doctorAppointments;
    
    uint256 public appointmentCount;
    
    // Events
    event AppointmentRegistered(
        uint256 indexed appointmentId,
        bytes32 indexed appointmentHash,
        address indexed patient,
        address doctor,
        uint256 appointmentDate,
        string appointmentType
    );
    
    event AppointmentStatusUpdated(
        uint256 indexed appointmentId,
        AppointmentStatus oldStatus,
        AppointmentStatus newStatus,
        address updatedBy,
        uint256 timestamp
    );
    
    event AppointmentCompleted(
        uint256 indexed appointmentId,
        address indexed doctor,
        uint256 completedAt,
        string ipfsHash
    );
    
    event AppointmentCancelled(
        uint256 indexed appointmentId,
        address cancelledBy,
        string reason,
        uint256 cancelledAt
    );
    
    event AppointmentRescheduled(
        uint256 indexed appointmentId,
        uint256 oldDate,
        uint256 newDate,
        string reason,
        address rescheduledBy
    );
    
    event NoShowMarked(
        uint256 indexed appointmentId,
        address indexed patient,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new appointment on blockchain
     */
    function registerAppointment(
        bytes32 _appointmentHash,
        address _patient,
        address _doctor,
        uint256 _appointmentDate,
        string memory _appointmentType
    ) external nonReentrant returns (uint256) {
        require(_appointmentHash != bytes32(0), "Invalid appointment hash");
        require(_patient != address(0), "Invalid patient address");
        require(_doctor != address(0), "Invalid doctor address");
        require(_appointmentDate > block.timestamp, "Appointment date must be in future");
        require(appointmentHashToId[_appointmentHash] == 0, "Appointment already exists");
        
        appointmentCount++;
        uint256 appointmentId = appointmentCount;
        
        appointments[appointmentId] = Appointment({
            appointmentHash: _appointmentHash,
            patient: _patient,
            doctor: _doctor,
            appointmentDate: _appointmentDate,
            appointmentType: _appointmentType,
            status: AppointmentStatus.SCHEDULED,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            completedAt: 0,
            cancelledAt: 0,
            ipfsHash: "",
            isActive: true
        });
        
        appointmentHashToId[_appointmentHash] = appointmentId;
        patientAppointments[_patient].push(appointmentId);
        doctorAppointments[_doctor].push(appointmentId);
        
        // Record initial status
        appointmentHistory[appointmentId].push(StatusChange({
            fromStatus: AppointmentStatus.SCHEDULED,
            toStatus: AppointmentStatus.SCHEDULED,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: "Initial registration"
        }));
        
        emit AppointmentRegistered(
            appointmentId,
            _appointmentHash,
            _patient,
            _doctor,
            _appointmentDate,
            _appointmentType
        );
        
        return appointmentId;
    }
    
    /**
     * @dev Update appointment status
     */
    function updateAppointmentStatus(
        uint256 _appointmentId,
        AppointmentStatus _newStatus,
        string memory _reason
    ) external nonReentrant {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.isActive, "Appointment is not active");
        require(
            msg.sender == appointment.doctor || 
            msg.sender == appointment.patient ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        AppointmentStatus oldStatus = appointment.status;
        appointment.status = _newStatus;
        appointment.lastUpdatedAt = block.timestamp;
        
        // Record status change
        appointmentHistory[_appointmentId].push(StatusChange({
            fromStatus: oldStatus,
            toStatus: _newStatus,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: _reason
        }));
        
        emit AppointmentStatusUpdated(
            _appointmentId,
            oldStatus,
            _newStatus,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Complete an appointment
     */
    function completeAppointment(
        uint256 _appointmentId,
        string memory _ipfsHash
    ) external nonReentrant {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.isActive, "Appointment is not active");
        require(
            msg.sender == appointment.doctor || hasRole(ADMIN_ROLE, msg.sender),
            "Only doctor can complete appointment"
        );
        require(
            appointment.status != AppointmentStatus.COMPLETED,
            "Appointment already completed"
        );
        
        AppointmentStatus oldStatus = appointment.status;
        appointment.status = AppointmentStatus.COMPLETED;
        appointment.completedAt = block.timestamp;
        appointment.lastUpdatedAt = block.timestamp;
        appointment.ipfsHash = _ipfsHash;
        
        // Record status change
        appointmentHistory[_appointmentId].push(StatusChange({
            fromStatus: oldStatus,
            toStatus: AppointmentStatus.COMPLETED,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: "Appointment completed"
        }));
        
        emit AppointmentCompleted(
            _appointmentId,
            msg.sender,
            block.timestamp,
            _ipfsHash
        );
    }
    
    /**
     * @dev Cancel an appointment
     */
    function cancelAppointment(
        uint256 _appointmentId,
        string memory _reason
    ) external nonReentrant {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.isActive, "Appointment is not active");
        require(
            msg.sender == appointment.doctor || 
            msg.sender == appointment.patient ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(
            appointment.status != AppointmentStatus.COMPLETED &&
            appointment.status != AppointmentStatus.CANCELLED,
            "Cannot cancel completed or already cancelled appointment"
        );
        
        AppointmentStatus oldStatus = appointment.status;
        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelledAt = block.timestamp;
        appointment.lastUpdatedAt = block.timestamp;
        
        // Record status change
        appointmentHistory[_appointmentId].push(StatusChange({
            fromStatus: oldStatus,
            toStatus: AppointmentStatus.CANCELLED,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: _reason
        }));
        
        emit AppointmentCancelled(
            _appointmentId,
            msg.sender,
            _reason,
            block.timestamp
        );
    }
    
    /**
     * @dev Reschedule an appointment
     */
    function rescheduleAppointment(
        uint256 _appointmentId,
        uint256 _newDate,
        string memory _reason
    ) external nonReentrant {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.isActive, "Appointment is not active");
        require(_newDate > block.timestamp, "New date must be in future");
        require(
            msg.sender == appointment.doctor || 
            msg.sender == appointment.patient ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        
        uint256 oldDate = appointment.appointmentDate;
        appointment.appointmentDate = _newDate;
        appointment.lastUpdatedAt = block.timestamp;
        
        AppointmentStatus oldStatus = appointment.status;
        appointment.status = AppointmentStatus.RESCHEDULED;
        
        // Record reschedule
        rescheduleHistory[_appointmentId].push(RescheduleInfo({
            originalDate: oldDate,
            newDate: _newDate,
            timestamp: block.timestamp,
            reason: _reason,
            rescheduledBy: msg.sender
        }));
        
        // Record status change
        appointmentHistory[_appointmentId].push(StatusChange({
            fromStatus: oldStatus,
            toStatus: AppointmentStatus.RESCHEDULED,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: _reason
        }));
        
        emit AppointmentRescheduled(
            _appointmentId,
            oldDate,
            _newDate,
            _reason,
            msg.sender
        );
    }
    
    /**
     * @dev Mark patient as no-show
     */
    function markNoShow(uint256 _appointmentId) external nonReentrant {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.isActive, "Appointment is not active");
        require(
            msg.sender == appointment.doctor || hasRole(ADMIN_ROLE, msg.sender),
            "Only doctor can mark no-show"
        );
        require(
            block.timestamp > appointment.appointmentDate,
            "Cannot mark no-show before appointment time"
        );
        
        AppointmentStatus oldStatus = appointment.status;
        appointment.status = AppointmentStatus.NO_SHOW;
        appointment.lastUpdatedAt = block.timestamp;
        
        // Record status change
        appointmentHistory[_appointmentId].push(StatusChange({
            fromStatus: oldStatus,
            toStatus: AppointmentStatus.NO_SHOW,
            timestamp: block.timestamp,
            changedBy: msg.sender,
            reason: "Patient did not attend"
        }));
        
        emit NoShowMarked(
            _appointmentId,
            appointment.patient,
            block.timestamp
        );
    }
    
    /**
     * @dev Verify an appointment exists and get its status
     */
    function verifyAppointment(bytes32 _appointmentHash) 
        external 
        view 
        returns (
            bool exists,
            AppointmentStatus status,
            uint256 appointmentDate,
            uint256 createdAt,
            bool isActive
        ) 
    {
        uint256 appointmentId = appointmentHashToId[_appointmentHash];
        if (appointmentId == 0) {
            return (false, AppointmentStatus.SCHEDULED, 0, 0, false);
        }
        
        Appointment memory appointment = appointments[appointmentId];
        return (
            true,
            appointment.status,
            appointment.appointmentDate,
            appointment.createdAt,
            appointment.isActive
        );
    }
    
    /**
     * @dev Get appointment details
     */
    function getAppointment(uint256 _appointmentId)
        external
        view
        returns (
            bytes32 appointmentHash,
            address patient,
            address doctor,
            uint256 appointmentDate,
            string memory appointmentType,
            AppointmentStatus status,
            uint256 createdAt,
            string memory ipfsHash,
            bool isActive
        )
    {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment memory appointment = appointments[_appointmentId];
        
        return (
            appointment.appointmentHash,
            appointment.patient,
            appointment.doctor,
            appointment.appointmentDate,
            appointment.appointmentType,
            appointment.status,
            appointment.createdAt,
            appointment.ipfsHash,
            appointment.isActive
        );
    }
    
    /**
     * @dev Get appointment status history
     */
    function getAppointmentHistory(uint256 _appointmentId)
        external
        view
        returns (StatusChange[] memory)
    {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        return appointmentHistory[_appointmentId];
    }
    
    /**
     * @dev Get reschedule history
     */
    function getRescheduleHistory(uint256 _appointmentId)
        external
        view
        returns (RescheduleInfo[] memory)
    {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        return rescheduleHistory[_appointmentId];
    }
    
    /**
     * @dev Get patient's appointments
     */
    function getPatientAppointments(address _patient)
        external
        view
        returns (uint256[] memory)
    {
        require(
            msg.sender == _patient || hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        return patientAppointments[_patient];
    }
    
    /**
     * @dev Get doctor's appointments
     */
    function getDoctorAppointments(address _doctor)
        external
        view
        returns (uint256[] memory)
    {
        require(
            msg.sender == _doctor || hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        return doctorAppointments[_doctor];
    }
    
    /**
     * @dev Check if patient attended appointment
     */
    function didPatientAttend(uint256 _appointmentId)
        external
        view
        returns (bool attended)
    {
        require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Invalid appointment ID");
        Appointment memory appointment = appointments[_appointmentId];
        
        return appointment.status == AppointmentStatus.COMPLETED;
    }
    
    /**
     * @dev Get patient attendance rate
     */
    function getPatientAttendanceRate(address _patient)
        external
        view
        returns (uint256 totalAppointments, uint256 attended, uint256 noShows)
    {
        uint256[] memory appointmentIds = patientAppointments[_patient];
        totalAppointments = appointmentIds.length;
        attended = 0;
        noShows = 0;
        
        for (uint256 i = 0; i < appointmentIds.length; i++) {
            Appointment memory appointment = appointments[appointmentIds[i]];
            if (appointment.status == AppointmentStatus.COMPLETED) {
                attended++;
            } else if (appointment.status == AppointmentStatus.NO_SHOW) {
                noShows++;
            }
        }
        
        return (totalAppointments, attended, noShows);
    }
}
