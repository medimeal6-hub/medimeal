import React, { useState } from 'react';
import { X, Heart, Droplets, Weight, Activity } from 'lucide-react';
import axios from 'axios';

const LogVitalModal = ({ onClose, onVitalLogged }) => {
  const [formData, setFormData] = useState({
    type: 'blood-pressure',
    systolic: '',
    diastolic: '',
    value: '',
    notes: '',
    recordedAt: new Date().toISOString().slice(0, 16) // Format for datetime-local input
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vitalTypes = [
    {
      id: 'blood-pressure',
      name: 'Blood Pressure',
      icon: Heart,
      unit: 'mmHg',
      color: 'text-red-600',
      fields: ['systolic', 'diastolic']
    },
    {
      id: 'blood-sugar',
      name: 'Blood Sugar',
      icon: Droplets,
      unit: 'mg/dL',
      color: 'text-blue-600',
      fields: ['value']
    },
    {
      id: 'weight',
      name: 'Weight',
      icon: Weight,
      unit: 'kg',
      color: 'text-green-600',
      fields: ['value']
    },
    {
      id: 'heart-rate',
      name: 'Heart Rate',
      icon: Activity,
      unit: 'bpm',
      color: 'text-purple-600',
      fields: ['value']
    }
  ];

  const selectedVitalType = vitalTypes.find(type => type.id === formData.type);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.type === 'blood-pressure') {
      if (!formData.systolic || !formData.diastolic) {
        setError('Please enter both systolic and diastolic values');
        return false;
      }
      const systolic = parseFloat(formData.systolic);
      const diastolic = parseFloat(formData.diastolic);
      if (systolic <= 0 || diastolic <= 0 || systolic > 300 || diastolic > 200) {
        setError('Please enter valid blood pressure values');
        return false;
      }
      if (systolic <= diastolic) {
        setError('Systolic pressure should be higher than diastolic');
        return false;
      }
    } else {
      if (!formData.value) {
        setError('Please enter a value');
        return false;
      }
      const value = parseFloat(formData.value);
      if (value <= 0) {
        setError('Please enter a valid positive value');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        type: formData.type,
        values: formData.type === 'blood-pressure' ? 
          {
            systolic: parseFloat(formData.systolic),
            diastolic: parseFloat(formData.diastolic)
          } : 
          {
            value: parseFloat(formData.value)
          },
        unit: selectedVitalType.unit,
        recordedAt: formData.recordedAt,
        notes: formData.notes.trim() || undefined
      };

      const response = await axios.post('/api/health/records', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onVitalLogged();
      }
    } catch (err) {
      console.error('Log vital error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to log vital. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderValueInputs = () => {
    if (formData.type === 'blood-pressure') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Systolic
            </label>
            <input
              type="number"
              name="systolic"
              value={formData.systolic}
              onChange={handleInputChange}
              placeholder="120"
              min="50"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diastolic
            </label>
            <input
              type="number"
              name="diastolic"
              value={formData.diastolic}
              onChange={handleInputChange}
              placeholder="80"
              min="30"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Value ({selectedVitalType.unit})
        </label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          placeholder={
            formData.type === 'blood-sugar' ? '95' :
            formData.type === 'weight' ? '68.5' :
            formData.type === 'heart-rate' ? '72' : '0'
          }
          step={formData.type === 'weight' ? '0.1' : '1'}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Log Vital Signs</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vital Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vital Sign Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vitalTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      type: type.id,
                      systolic: '',
                      diastolic: '',
                      value: ''
                    }))}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${formData.type === type.id ? 'text-blue-600' : type.color}`} />
                    <span className={`text-xs font-medium ${
                      formData.type === type.id ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {type.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value Inputs */}
          {renderValueInputs()}

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="recordedAt"
              value={formData.recordedAt}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes about this reading..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging...' : 'Log Vital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogVitalModal;