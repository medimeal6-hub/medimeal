import React, { useState } from 'react';
import { X, AlertTriangle, Target, Calendar } from 'lucide-react';

const AddEntryModal = ({ activeTab, onClose, onEntryAdded }) => {
  const [entryType, setEntryType] = useState(
    activeTab === 'Symptoms' ? 'symptom' :
    activeTab === 'Goals' ? 'goal' :
    activeTab === 'Appointments' ? 'appointment' : 'symptom'
  );

  const renderSymptomForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptom Name
          </label>
          <input
            type="text"
            placeholder="e.g., Headache, Chest pain, Nausea"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="pain">Pain</option>
              <option value="digestive">Digestive</option>
              <option value="respiratory">Respiratory</option>
              <option value="cardiovascular">Cardiovascular</option>
              <option value="neurological">Neurological</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe your symptom in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When did it start?
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    );
  };

  const renderGoalForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goal Title
          </label>
          <input
            type="text"
            placeholder="e.g., Lose 5kg in 3 months"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="weight">Weight Management</option>
              <option value="blood-pressure">Blood Pressure</option>
              <option value="blood-sugar">Blood Sugar</option>
              <option value="exercise">Exercise</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe your goal and how you plan to achieve it..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Value
            </label>
            <input
              type="number"
              placeholder="65"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Title
          </label>
          <input
            type="text"
            placeholder="e.g., Annual Check-up, Cardiology Consultation"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor/Clinic
            </label>
            <input
              type="text"
              placeholder="Dr. Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="general-physician">General Physician</option>
              <option value="cardiologist">Cardiologist</option>
              <option value="endocrinologist">Endocrinologist</option>
              <option value="neurologist">Neurologist</option>
              <option value="dermatologist">Dermatologist</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <textarea
            rows={3}
            placeholder="Describe the reason for your appointment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="check-up">Check-up</option>
              <option value="procedure">Procedure</option>
              <option value="test">Test</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="in-person">In-person</option>
              <option value="telemedicine">Telemedicine</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    switch (entryType) {
      case 'symptom': return 'Record Symptom';
      case 'goal': return 'Create Health Goal';
      case 'appointment': return 'Schedule Appointment';
      default: return 'Add Entry';
    }
  };

  const getModalIcon = () => {
    switch (entryType) {
      case 'symptom': return AlertTriangle;
      case 'goal': return Target;
      case 'appointment': return Calendar;
      default: return AlertTriangle;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just close the modal
    // In a real implementation, you'd submit the form data
    onEntryAdded();
  };

  const ModalIcon = getModalIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ModalIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Entry Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'symptom', name: 'Symptom', icon: AlertTriangle },
                { id: 'goal', name: 'Goal', icon: Target },
                { id: 'appointment', name: 'Appointment', icon: Calendar }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEntryType(type.id)}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      entryType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          {entryType === 'symptom' && renderSymptomForm()}
          {entryType === 'goal' && renderGoalForm()}
          {entryType === 'appointment' && renderAppointmentForm()}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntryModal;