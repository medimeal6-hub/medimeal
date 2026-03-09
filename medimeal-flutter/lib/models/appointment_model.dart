class Appointment {
  final String id;
  final String userId;
  final String? doctorId;
  final DateTime appointmentDate;
  final String status;
  final String type;
  final String reasonForVisit;
  final double? consultationFee;
  final DoctorInfo doctor;

  Appointment({
    required this.id,
    required this.userId,
    this.doctorId,
    required this.appointmentDate,
    required this.status,
    required this.type,
    required this.reasonForVisit,
    this.consultationFee,
    required this.doctor,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    // Handle different date formats from backend
    DateTime appointmentDate;
    if (json['appointmentDate'] != null) {
      appointmentDate = DateTime.parse(json['appointmentDate']);
    } else if (json['date'] != null && json['time'] != null) {
      // Backend returns date and time separately
      appointmentDate = DateTime.parse('${json['date']}T${json['time']}:00');
    } else {
      appointmentDate = DateTime.now();
    }

    return Appointment(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? json['patientId'] ?? '',
      doctorId: json['doctorId'],
      appointmentDate: appointmentDate,
      status: json['status'] ?? 'REQUESTED',
      type: json['type'] ?? 'consultation',
      reasonForVisit: json['reasonForVisit'] ?? json['notes'] ?? '',
      consultationFee: json['consultationFee']?.toDouble(),
      doctor: DoctorInfo.fromJson(json['provider'] ?? json['doctor'] ?? {}),
    );
  }

  String get statusDisplay {
    switch (status.toUpperCase()) {
      case 'REQUESTED':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'PAID':
        return 'Confirmed';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  String get formattedDate {
    return '${appointmentDate.day}/${appointmentDate.month}/${appointmentDate.year}';
  }

  String get formattedTime {
    final hour = appointmentDate.hour.toString().padLeft(2, '0');
    final minute = appointmentDate.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  // Convenience getters for dashboard
  String? get doctorName => doctor.name;
  String get time => formattedTime;
}

class DoctorInfo {
  final String name;
  final String? specialization;
  final String? clinic;
  final String? email;
  final String? phone;

  DoctorInfo({
    required this.name,
    this.specialization,
    this.clinic,
    this.email,
    this.phone,
  });

  factory DoctorInfo.fromJson(Map<String, dynamic> json) {
    return DoctorInfo(
      name: json['name'] ?? 'Unknown Doctor',
      specialization: json['specialization'],
      clinic: json['clinic'],
      email: json['email'],
      phone: json['phone'],
    );
  }
}
