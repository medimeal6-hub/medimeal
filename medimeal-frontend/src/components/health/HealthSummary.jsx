import React from 'react';
import { Activity, Target, AlertTriangle, Calendar } from 'lucide-react';

const HealthSummary = ({ summary }) => {
  if (!summary) return null;

  const summaryCards = [
    {
      icon: Activity,
      label: 'Records Tracked',
      value: summary.totalRecords,
      color: 'bg-blue-100 text-blue-600',
      description: `in ${summary.daysTracked} days`
    },
    {
      icon: AlertTriangle,
      label: 'Urgent Symptoms',
      value: summary.urgentSymptoms,
      color: summary.urgentSymptoms > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
      description: 'need attention'
    },
    {
      icon: Target,
      label: 'Goals On Track',
      value: summary.goalsOnTrack,
      color: 'bg-green-100 text-green-600',
      description: 'progressing well'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {card.value}
              </h3>
              <p className="text-sm font-medium text-gray-700">
                {card.label}
              </p>
              <p className="text-xs text-gray-500">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HealthSummary;