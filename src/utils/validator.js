
class Validator {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
  }

  static isValidUsername(username) {
    // Alphanumeric and underscores only, 3-30 characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  static isValidRole(role) {
    return ['student', 'professor'].includes(role);
  }

  static isValidDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  static isValidTimeSlot(slot) {
    if (!slot || typeof slot !== 'object') {
      return false;
    }

    const { startTime, endTime } = slot;
    
    if (!this.isValidDateTime(startTime) || !this.isValidDateTime(endTime)) {
      return false;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // End time should be after start time
    return end > start;
  }

  static validateRegistration(userData) {
    const errors = [];
    const { username, password, role } = userData;

    if (!username) {
      errors.push('Username is required');
    } else if (!this.isValidUsername(username)) {
      errors.push('Username must be 3-30 characters long and contain only letters, numbers, and underscores');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (!this.isValidPassword(password)) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!role) {
      errors.push('Role is required');
    } else if (!this.isValidRole(role)) {
      errors.push('Role must be either "student" or "professor"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLogin(credentials) {
    const errors = [];
    const { username, password } = credentials;

    if (!username) {
      errors.push('Username is required');
    }

    if (!password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTimeSlots(timeSlots) {
    const errors = [];

    if (!Array.isArray(timeSlots)) {
      errors.push('Time slots must be an array');
      return { isValid: false, errors };
    }

    if (timeSlots.length === 0) {
      errors.push('At least one time slot is required');
      return { isValid: false, errors };
    }

    timeSlots.forEach((slot, index) => {
      if (!this.isValidTimeSlot(slot)) {
        errors.push(`Invalid time slot at index ${index}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validator;