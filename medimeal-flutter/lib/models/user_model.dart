class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? profilePicture;
  final String? phone;
  final String? specialization;
  final bool? isActive;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.profilePicture,
    this.phone,
    this.specialization,
    this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      role: json['role'] ?? 'user',
      profilePicture: json['profilePicture'],
      phone: json['phone'] ?? json['phoneNumber'],
      specialization: json['specialization'],
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'profilePicture': profilePicture,
      'phone': phone,
      'specialization': specialization,
      'isActive': isActive,
    };
  }

  String get fullName => '$firstName $lastName';
  bool get isDoctor => role == 'doctor';
  bool get isPatient => role == 'user';
}
