import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../providers/auth_provider.dart';
import '../../providers/appointment_provider.dart';
import '../../services/api_service.dart';

class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String _appointmentType = 'consultation';
  String _mode = 'in-person';
  
  List<Map<String, dynamic>> _doctors = [];
  bool _loadingDoctors = true;
  String? _selectedDoctorId;

  @override
  void initState() {
    super.initState();
    _fetchDoctors();
  }

  Future<void> _fetchDoctors() async {
    try {
      final response = await ApiService.getAvailableDoctors();
      if (response['success'] == true) {
        setState(() {
          _doctors = List<Map<String, dynamic>>.from(response['data'] ?? []);
          _loadingDoctors = false;
          // Auto-select first doctor if available
          if (_doctors.isNotEmpty) {
            _selectedDoctorId = _doctors[0]['_id'];
          }
        });
      }
    } catch (e) {
      setState(() {
        _loadingDoctors = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load doctors: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    
    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  Future<void> _bookAppointment() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedDoctorId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a doctor'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a date'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    if (_selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a time'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final appointmentProvider = Provider.of<AppointmentProvider>(context, listen: false);
    
    final success = await appointmentProvider.bookAppointment({
      'doctorId': _selectedDoctorId,
      'date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
      'time': '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}',
      'type': _appointmentType,
      'reasonForVisit': _reasonController.text.trim(),
      'mode': _mode,
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Appointment booked successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      context.go('/dashboard');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(appointmentProvider.error ?? 'Failed to book appointment'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: _loadingDoctors
          ? const Center(child: CircularProgressIndicator())
          : _doctors.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.medical_services_outlined, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'No doctors available',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => context.go('/dashboard'),
                        child: const Text('Go Back'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Doctor Selection
                        const Text(
                          'Select Doctor',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF111827),
                          ),
                        ),
                        
                        const SizedBox(height: 12),
                        
                        ..._doctors.map((doctor) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: RadioListTile<String>(
                            value: doctor['_id'],
                            groupValue: _selectedDoctorId,
                            onChanged: (value) {
                              setState(() {
                                _selectedDoctorId = value;
                              });
                            },
                            title: Text(
                              'Dr. ${doctor['firstName']} ${doctor['lastName']}',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(doctor['specialization'] ?? 'General Physician'),
                                if (doctor['yearsOfExperience'] != null && doctor['yearsOfExperience'] > 0)
                                  Text('${doctor['yearsOfExperience']} years experience'),
                                if (doctor['consultationFee'] != null && doctor['consultationFee'] > 0)
                                  Text(
                                    '₹${doctor['consultationFee']} consultation fee',
                                    style: const TextStyle(
                                      color: Color(0xFF2563EB),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                              ],
                            ),
                            secondary: CircleAvatar(
                              backgroundColor: const Color(0xFF2563EB).withOpacity(0.1),
                              child: const Icon(Icons.person, color: Color(0xFF2563EB)),
                            ),
                          ),
                        )).toList(),
                        
                        const SizedBox(height: 24),
              // Appointment Type
              const Text(
                'Appointment Type',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF111827),
                ),
              ),
              
              const SizedBox(height: 12),
              
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('Consultation'),
                    selected: _appointmentType == 'consultation',
                    onSelected: (selected) {
                      setState(() {
                        _appointmentType = 'consultation';
                      });
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Follow-up'),
                    selected: _appointmentType == 'follow-up',
                    onSelected: (selected) {
                      setState(() {
                        _appointmentType = 'follow-up';
                      });
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Check-up'),
                    selected: _appointmentType == 'check-up',
                    onSelected: (selected) {
                      setState(() {
                        _appointmentType = 'check-up';
                      });
                    },
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Mode
              const Text(
                'Consultation Mode',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF111827),
                ),
              ),
              
              const SizedBox(height: 12),
              
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('In-Person'),
                    selected: _mode == 'in-person',
                    onSelected: (selected) {
                      setState(() {
                        _mode = 'in-person';
                      });
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Video Call'),
                    selected: _mode == 'video',
                    onSelected: (selected) {
                      setState(() {
                        _mode = 'video';
                      });
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Phone Call'),
                    selected: _mode == 'phone',
                    onSelected: (selected) {
                      setState(() {
                        _mode = 'phone';
                      });
                    },
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Date Selection
              Card(
                child: ListTile(
                  leading: const Icon(Icons.calendar_today, color: Color(0xFF2563EB)),
                  title: const Text('Select Date'),
                  subtitle: Text(
                    _selectedDate != null
                        ? DateFormat('EEEE, MMMM d, y').format(_selectedDate!)
                        : 'No date selected',
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: _selectDate,
                ),
              ),
              
              const SizedBox(height: 12),
              
              // Time Selection
              Card(
                child: ListTile(
                  leading: const Icon(Icons.access_time, color: Color(0xFF2563EB)),
                  title: const Text('Select Time'),
                  subtitle: Text(
                    _selectedTime != null
                        ? _selectedTime!.format(context)
                        : 'No time selected',
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: _selectTime,
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Reason for Visit
              TextFormField(
                controller: _reasonController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Reason for Visit',
                  hintText: 'Describe your symptoms or reason for consultation',
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter reason for visit';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 32),
              
              // Book Button
              Consumer<AppointmentProvider>(
                builder: (context, appointmentProvider, child) {
                  return ElevatedButton(
                    onPressed: appointmentProvider.isLoading ? null : _bookAppointment,
                    child: appointmentProvider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Book Appointment'),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
