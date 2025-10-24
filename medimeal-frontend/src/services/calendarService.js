import { config } from '../config/environment';

const API_BASE_URL = config.API_BASE_URL;
console.log('CalendarService - API_BASE_URL:', API_BASE_URL);
console.log('CalendarService - Version 2.0 - Cache Bust:', Date.now());

class CalendarService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Get all calendar events
  async getEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.type) queryParams.append('type', params.type);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.completed !== undefined) queryParams.append('completed', params.completed);
      
      const url = `${API_BASE_URL}/calendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      // Debug logging
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', url);
      console.log('Headers:', this.getHeaders());
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get events by date range
  async getEventsByDateRange(startDate, endDate) {
    return this.getEvents({ startDate, endDate });
  }

  // Get a specific calendar event
  async getEvent(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      throw error;
    }
  }

  // Create a new calendar event
  async createEvent(eventData) {
    try {
      const url = `${API_BASE_URL}/calendar/events`;
      
      // Debug logging
      console.log('Create Event - API_BASE_URL:', API_BASE_URL);
      console.log('Create Event - Full URL:', url);
      console.log('Create Event - Headers:', this.getHeaders());
      console.log('Create Event - Data:', eventData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update a calendar event
  async updateEvent(eventId, eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete a calendar event
  async deleteEvent(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Toggle event completion status
  async toggleEventComplete(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/toggle-complete`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error toggling event completion:', error);
      throw error;
    }
  }

  // Duplicate a calendar event
  async duplicateEvent(eventId, newDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/duplicate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ newDate })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error duplicating calendar event:', error);
      throw error;
    }
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/upcoming?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  // Get overdue events
  async getOverdueEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/events/overdue`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching overdue events:', error);
      throw error;
    }
  }

  // Get calendar statistics
  async getCalendarStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching calendar stats:', error);
      throw error;
    }
  }

  // Export calendar data
  async exportCalendarData() {
    try {
      const response = await this.getEvents();
      return response.data;
    } catch (error) {
      console.error('Error exporting calendar data:', error);
      throw error;
    }
  }

  // Import calendar data
  async importCalendarData(events) {
    try {
      const results = [];
      
      for (const event of events) {
        try {
          const result = await this.createEvent(event);
          results.push({ success: true, data: result.data });
        } catch (error) {
          results.push({ success: false, error: error.message, event });
        }
      }
      
      return {
        success: true,
        message: 'Calendar data import completed',
        results
      };
    } catch (error) {
      console.error('Error importing calendar data:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const calendarService = new CalendarService();
export default calendarService;
