import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import VitalCard from './VitalCard';
import { Heart, Activity, Weight, Droplets } from 'lucide-react';

describe('VitalCard Component', () => {
  const mockVitalNormal = {
    name: 'Blood Pressure',
    icon: Heart,
    value: '120/80',
    unit: 'mmHg',
    target: '< 130/85',
    status: 'normal',
    trend: 'stable',
    color: 'bg-green-100',
    iconColor: 'text-green-600'
  };

  const mockVitalAbnormal = {
    name: 'Heart Rate',
    icon: Activity,
    value: '120',
    unit: 'bpm',
    target: '60-80',
    status: 'abnormal',
    trend: 'increasing',
    color: 'bg-red-100',
    iconColor: 'text-red-600'
  };

  const mockVitalNoData = {
    name: 'Weight',
    icon: Weight,
    value: '--',
    unit: 'kg',
    target: '65-70',
    status: 'unknown',
    trend: 'stable',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600'
  };

  describe('Rendering', () => {
    test('renders vital card with normal values', () => {
      render(<VitalCard vital={mockVitalNormal} />);
      
      expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
      expect(screen.getByText('120/80')).toBeInTheDocument();
      expect(screen.getByText('mmHg')).toBeInTheDocument();
      expect(screen.getByText('Target: < 130/85')).toBeInTheDocument();
      expect(screen.getByText('normal')).toBeInTheDocument();
    });

    test('renders vital card with abnormal values', () => {
      render(<VitalCard vital={mockVitalAbnormal} />);
      
      expect(screen.getByText('Heart Rate')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('bpm')).toBeInTheDocument();
      expect(screen.getByText('abnormal')).toBeInTheDocument();
    });

    test('renders vital card with no data', () => {
      render(<VitalCard vital={mockVitalNoData} />);
      
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('--')).toBeInTheDocument();
      expect(screen.queryByText('kg')).not.toBeInTheDocument(); // Unit should not show when no data
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    test('renders icon correctly', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      const iconElement = container.querySelector('.text-green-600');
      expect(iconElement).toBeInTheDocument();
    });

    test('applies correct background color', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      const coloredDiv = container.querySelector('.bg-green-100');
      expect(coloredDiv).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    test('displays normal status with green color', () => {
      render(<VitalCard vital={mockVitalNormal} />);
      
      const statusElement = screen.getByText('normal');
      expect(statusElement).toHaveClass('text-green-600');
    });

    test('displays abnormal status with red color', () => {
      render(<VitalCard vital={mockVitalAbnormal} />);
      
      const statusElement = screen.getByText('abnormal');
      expect(statusElement).toHaveClass('text-red-600');
    });

    test('displays unknown status with gray color', () => {
      render(<VitalCard vital={mockVitalNoData} />);
      
      const statusElement = screen.getByText('unknown');
      expect(statusElement).toHaveClass('text-gray-600');
    });
  });

  describe('Trend Display', () => {
    test('shows increasing trend icon', () => {
      const { container } = render(<VitalCard vital={mockVitalAbnormal} />);
      const trendIcon = container.querySelector('.text-green-500');
      expect(trendIcon).toBeInTheDocument();
    });

    test('shows stable trend icon', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      const trendIcon = container.querySelector('.text-gray-400');
      expect(trendIcon).toBeInTheDocument();
    });

    test('shows decreasing trend icon', () => {
      const mockDecreasing = {
        ...mockVitalNormal,
        trend: 'decreasing'
      };
      
      const { container } = render(<VitalCard vital={mockDecreasing} />);
      const trendIcon = container.querySelector('.text-red-500');
      expect(trendIcon).toBeInTheDocument();
    });
  });

  describe('Value and Unit Display', () => {
    test('shows unit when value is present', () => {
      render(<VitalCard vital={mockVitalNormal} />);
      expect(screen.getByText('mmHg')).toBeInTheDocument();
    });

    test('hides unit when no data available', () => {
      render(<VitalCard vital={mockVitalNoData} />);
      expect(screen.queryByText('kg')).not.toBeInTheDocument();
    });

    test('displays blood sugar values correctly', () => {
      const bloodSugarVital = {
        name: 'Blood Sugar',
        icon: Droplets,
        value: '95',
        unit: 'mg/dL',
        target: '80-120',
        status: 'normal',
        trend: 'stable',
        color: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };

      render(<VitalCard vital={bloodSugarVital} />);
      
      expect(screen.getByText('Blood Sugar')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('mg/dL')).toBeInTheDocument();
      expect(screen.getByText('Target: 80-120')).toBeInTheDocument();
    });

    test('displays weight values with decimals', () => {
      const weightVital = {
        name: 'Weight',
        icon: Weight,
        value: '68.5',
        unit: 'kg',
        target: '65-70',
        status: 'normal',
        trend: 'decreasing',
        color: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };

      render(<VitalCard vital={weightVital} />);
      
      expect(screen.getByText('68.5')).toBeInTheDocument();
      expect(screen.getByText('kg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper structure for screen readers', () => {
      render(<VitalCard vital={mockVitalNormal} />);
      
      const heading = screen.getByText('Blood Pressure');
      expect(heading).toBeInTheDocument();
      
      const value = screen.getByText('120/80');
      expect(value).toBeInTheDocument();
      
      const target = screen.getByText('Target: < 130/85');
      expect(target).toBeInTheDocument();
    });

    test('maintains semantic structure', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      
      // Check that the card has a proper container structure
      expect(container.firstChild).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm');
    });
  });

  describe('Responsive Design', () => {
    test('applies hover effects', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
    });

    test('maintains proper padding and margins', () => {
      const { container } = render(<VitalCard vital={mockVitalNormal} />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing vital properties gracefully', () => {
      const incompleteVital = {
        name: 'Test Vital',
        icon: Heart,
        value: '100',
        // Missing other properties
      };

      expect(() => render(<VitalCard vital={incompleteVital} />)).not.toThrow();
    });

    test('handles very long vital names', () => {
      const longNameVital = {
        ...mockVitalNormal,
        name: 'Very Long Vital Name That Might Wrap To Multiple Lines'
      };

      render(<VitalCard vital={longNameVital} />);
      expect(screen.getByText('Very Long Vital Name That Might Wrap To Multiple Lines')).toBeInTheDocument();
    });

    test('handles very large values', () => {
      const largeValueVital = {
        ...mockVitalNormal,
        value: '999999'
      };

      render(<VitalCard vital={largeValueVital} />);
      expect(screen.getByText('999999')).toBeInTheDocument();
    });
  });
});