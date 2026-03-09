import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class SchedulesSection extends StatefulWidget {
  const SchedulesSection({super.key});

  @override
  State<SchedulesSection> createState() => _SchedulesSectionState();
}

class _SchedulesSectionState extends State<SchedulesSection> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Schedules',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF111827),
            ),
          ),
          
          const SizedBox(height: 8),
          
          const Text(
            'Manage your availability and appointments',
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF6B7280),
            ),
          ),
          
          const SizedBox(height: 24),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: TableCalendar(
                firstDay: DateTime.utc(2020, 1, 1),
                lastDay: DateTime.utc(2030, 12, 31),
                focusedDay: _focusedDay,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                onDaySelected: (selectedDay, focusedDay) {
                  setState(() {
                    _selectedDay = selectedDay;
                    _focusedDay = focusedDay;
                  });
                },
                calendarStyle: const CalendarStyle(
                  selectedDecoration: BoxDecoration(
                    color: Color(0xFF2563EB),
                    shape: BoxShape.circle,
                  ),
                  todayDecoration: BoxDecoration(
                    color: Color(0xFF93C5FD),
                    shape: BoxShape.circle,
                  ),
                ),
                headerStyle: const HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          const Text(
            'Availability Settings',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF111827),
            ),
          ),
          
          const SizedBox(height: 12),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _AvailabilityRow(
                    day: 'Monday',
                    isAvailable: true,
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Tuesday',
                    isAvailable: true,
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Wednesday',
                    isAvailable: true,
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Thursday',
                    isAvailable: true,
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Friday',
                    isAvailable: true,
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Saturday',
                    isAvailable: false,
                    startTime: '',
                    endTime: '',
                  ),
                  const Divider(),
                  _AvailabilityRow(
                    day: 'Sunday',
                    isAvailable: false,
                    startTime: '',
                    endTime: '',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AvailabilityRow extends StatelessWidget {
  final String day;
  final bool isAvailable;
  final String startTime;
  final String endTime;

  const _AvailabilityRow({
    required this.day,
    required this.isAvailable,
    required this.startTime,
    required this.endTime,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              day,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF111827),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: isAvailable
                ? Text(
                    '$startTime - $endTime',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6B7280),
                    ),
                  )
                : const Text(
                    'Unavailable',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF9CA3AF),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
          ),
          Switch(
            value: isAvailable,
            onChanged: (value) {
              // TODO: Implement availability toggle
            },
            activeColor: const Color(0xFF2563EB),
          ),
        ],
      ),
    );
  }
}
