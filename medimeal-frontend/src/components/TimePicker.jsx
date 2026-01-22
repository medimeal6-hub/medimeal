import { useState } from 'react'
import { Clock } from 'lucide-react'

const TimePicker = ({ value, onChange, name, required = false }) => {
  const [isAmPmMode, setIsAmPmMode] = useState(false)
  
  // Parse the 24-hour time format (HH:MM) to 12-hour format
  const parseTime = (time24) => {
    if (!time24) return { hours: 12, minutes: 0, ampm: 'AM' }
    
    const [hours, minutes] = time24.split(':').map(Number)
    let hours12 = hours
    let ampm = 'AM'
    
    if (hours === 0) {
      hours12 = 12
    } else if (hours === 12) {
      ampm = 'PM'
    } else if (hours > 12) {
      hours12 = hours - 12
      ampm = 'PM'
    }
    
    return { hours: hours12, minutes, ampm }
  }
  
  // Convert 12-hour format back to 24-hour format
  const formatTime24 = (hours12, minutes, ampm) => {
    let hours24 = hours12
    
    if (ampm === 'AM' && hours12 === 12) {
      hours24 = 0
    } else if (ampm === 'PM' && hours12 !== 12) {
      hours24 = hours12 + 12
    }
    
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  const { hours, minutes, ampm } = parseTime(value)
  
  const handleHoursChange = (newHours) => {
    const newTime24 = formatTime24(newHours, minutes, ampm)
    onChange({ target: { name, value: newTime24 } })
  }
  
  const handleMinutesChange = (newMinutes) => {
    const newTime24 = formatTime24(hours, newMinutes, ampm)
    onChange({ target: { name, value: newTime24 } })
  }
  
  const handleAmPmChange = (newAmPm) => {
    const newTime24 = formatTime24(hours, minutes, newAmPm)
    onChange({ target: { name, value: newTime24 } })
  }
  
  const handleModeToggle = () => {
    setIsAmPmMode(!isAmPmMode)
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Time</label>
        <button
          type="button"
          onClick={handleModeToggle}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isAmPmMode ? '24H' : '12H'}
        </button>
      </div>
      
      {isAmPmMode ? (
        // 12-hour format with AM/PM
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <select
              value={hours}
              onChange={(e) => handleHoursChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
          
          <span className="text-gray-500">:</span>
          
          <div className="flex-1">
            <select
              value={minutes}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={ampm}
              onChange={(e) => handleAmPmChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      ) : (
        // 24-hour format (default)
        <div className="relative">
          <input
            type="time"
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}

export default TimePicker

