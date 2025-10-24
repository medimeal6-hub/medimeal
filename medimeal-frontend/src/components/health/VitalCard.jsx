import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const VitalCard = ({ vital }) => {
  const {
    name,
    icon: Icon,
    value,
    unit,
    target,
    status,
    trend,
    color,
    iconColor
  } = vital;

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'abnormal':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'normal':
        return 'normal';
      case 'abnormal':
        return 'abnormal';
      default:
        return 'unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        {getTrendIcon()}
      </div>

      {/* Vital name */}
      <h3 className="text-gray-900 font-medium text-sm mb-2">{name}</h3>

      {/* Value and unit */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {value}
          </span>
          {value !== '--' && (
            <span className="text-sm text-gray-500 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Target and status */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Target: {target}</span>
        </div>
        <div className="flex items-center">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VitalCard;