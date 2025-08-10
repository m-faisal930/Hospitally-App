import React, { useState } from 'react';
import '../styles/caretakerForm.css';
import { createPatient } from '../services/api';

const PatientForm = ({ onSubmit, isSubmitting }) => {
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    assistanceType: [],
    availabilityStartDate: '',
    availabilityEndDate: '',
    startTime: '',
    endTime: '',
    totalHours: 0,
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'First name can only contain letters and spaces';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Last name can only contain letters and spaces';
        return '';
      
      case 'dob':
        if (!value) return 'Date of birth is required';
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 55) return 'You must be at least 55 years old to use this service';
        if (age > 120) return 'Please enter a valid date of birth';
        return '';
      
      case 'gender':
        if (!value) return 'Please select a gender';
        return '';
      
      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) return 'Phone number must be 10 digits';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'address':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Address must be at least 5 characters';
        return '';
      
      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'City must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'City can only contain letters and spaces';
        return '';
      
      case 'postalCode':
        if (!value) return 'Postal code is required';
        if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value)) return 'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
        return '';
      
      case 'assistanceType':
        if (patientData.assistanceType.length === 0) return 'Please select at least one type of assistance';
        return '';
      
      case 'availabilityStartDate':
        if (!value) return 'Start date is required';
        const startDate = new Date(value);
        if (startDate < new Date()) return 'Start date cannot be in the past';
        return '';
      
      case 'availabilityEndDate':
        if (!value) return 'End date is required';
        if (patientData.availabilityStartDate && value <= patientData.availabilityStartDate) {
          return 'End date must be after start date';
        }
        return '';
      
      case 'startTime':
        if (!value) return 'Start time is required';
        return '';
      
      case 'endTime':
        if (!value) return 'End time is required';
        if (patientData.startTime && value <= patientData.startTime) {
          return 'End time must be after start time';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(patientData).forEach(key => {
      if (key === 'assistanceType') {
        const error = validateField(key, patientData[key]);
        if (error) newErrors[key] = error;
      } else if (key !== 'totalHours' && key !== 'additionalNotes') {
        const error = validateField(key, patientData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPatientData((prev) => {
      const updated = checked
        ? [...prev.assistanceType, name]
        : prev.assistanceType.filter((item) => item !== name);
      return { ...prev, assistanceType: updated };
    });
    
    // Clear assistance type error when user makes selection
    if (errors.assistanceType) {
      setErrors(prev => ({ ...prev, assistanceType: '' }));
    }
  };

  const calculateTotalHours = () => {
    if (patientData.startTime && patientData.endTime) {
      const start = new Date(`1970-01-01T${patientData.startTime}:00`);
      const end = new Date(`1970-01-01T${patientData.endTime}:00`);
      const diff = (end - start) / (1000 * 60 * 60);
      setPatientData((prev) => ({ ...prev, totalHours: diff.toFixed(1) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(patientData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    try {
      // Extract last 4 digits of phone
      const authDigits = patientData.phoneNumber.slice(-4);
      const patientData1 = { ...patientData, authDigits };

      const response = await createPatient(patientData1);

      // Store email for future reference
      localStorage.setItem('patientEmail', patientData1.email);
      localStorage.setItem('userRole', 'patient');

      onSubmit(patientData, '/patient-dashboard');

    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const renderFieldError = (fieldName) => {
    if (errors[fieldName] && touched[fieldName]) {
      return <div className="field-error">{errors[fieldName]}</div>;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Welcome, Senior!</h2>
      <p className="form-subtitle">
        Please fill out the following information to create your profile.
      </p>

      <div className="form-columns">
        {/* Personal Information Column */}
        <div className="form-column personal-info">
          <div className="input-group">
            <div className="name-container">
              <div className="input-field">
                <label htmlFor="firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={patientData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.firstName && touched.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('firstName')}
              </div>
              <div className="input-field">
                <label htmlFor="lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={patientData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.lastName && touched.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('lastName')}
              </div>
            </div>

            <div className="input-field">
              <label htmlFor="dob">
                Date of Birth <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={patientData.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.dob && touched.dob ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={isSubmitting}
              />
              {renderFieldError('dob')}
            </div>

            <div className="input-field">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={patientData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.gender && touched.gender ? 'error' : ''}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {renderFieldError('gender')}
            </div>

            <div className="input-field">
              <label htmlFor="phoneNumber">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={patientData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phoneNumber && touched.phoneNumber ? 'error' : ''}
                placeholder="1234567890"
                pattern="[0-9]{10}"
                required
                disabled={isSubmitting}
              />
              {renderFieldError('phoneNumber')}
            </div>

            <div className="input-field">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={patientData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email ? 'error' : ''}
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting}
              />
              {renderFieldError('email')}
            </div>

            <div className="input-field">
              <label htmlFor="address">
                Street Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={patientData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.address && touched.address ? 'error' : ''}
                placeholder="123 Main Street"
                required
                disabled={isSubmitting}
              />
              {renderFieldError('address')}
            </div>

            <div className="address-group">
              <div className="input-field">
                <label htmlFor="city">
                  City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={patientData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.city && touched.city ? 'error' : ''}
                  placeholder="Enter your city"
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('city')}
              </div>
              <div className="input-field">
                <label htmlFor="postalCode">
                  Postal Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={patientData.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.postalCode && touched.postalCode ? 'error' : ''}
                  placeholder="A1A 1A1"
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('postalCode')}
              </div>
            </div>
          </div>
        </div>

        {/* Services & Availability Column */}
        <div className="form-column services-availability">
          <div className="input-group">
            <h3 className="section-title">
              What type of assistance are you needing?
            </h3>
            <div className="assistance-grid">
              {[
                {
                  id: 'personalCare',
                  label: 'Personal Care (Bathing, grooming, dressing, toilet)',
                },
                {
                  id: 'medicalSupport',
                  label: 'Medical Support (Wound care, vitals, medication)',
                },
                {
                  id: 'specializedCare',
                  label: "Specialized Care (Dementia/Alzheimer's care)",
                },
                {
                  id: 'mobilitySupport',
                  label: 'Mobility Support (Stretching, movement)',
                },
                {
                  id: 'mentalSupport',
                  label: 'Mental Support (Stress, anxiety, grief)',
                },
                { id: 'mealPrep', label: 'Meal Preparation' },
                { id: 'housekeeping', label: 'Light Housekeeping' },
                { id: 'transportation', label: 'Transportation Assistance' },
              ].map(({ id, label }) => (
                <label key={id} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={id}
                    checked={patientData.assistanceType.includes(id)}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  {label}
                </label>
              ))}
            </div>
            {renderFieldError('assistanceType')}

            <h3 className="section-title">When are you available for care?</h3>
            <div className="date-range-container">
              <div className="input-field">
                <label htmlFor="availabilityStartDate">
                  From Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="availabilityStartDate"
                  name="availabilityStartDate"
                  value={patientData.availabilityStartDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.availabilityStartDate && touched.availabilityStartDate ? 'error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('availabilityStartDate')}
              </div>
              <div className="input-field">
                <label htmlFor="availabilityEndDate">
                  To Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="availabilityEndDate"
                  name="availabilityEndDate"
                  value={patientData.availabilityEndDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.availabilityEndDate && touched.availabilityEndDate ? 'error' : ''}
                  min={patientData.availabilityStartDate || new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('availabilityEndDate')}
              </div>
            </div>

            <div className="time-range-container">
              <div className="input-field">
                <label htmlFor="startTime">
                  Start Time <span className="required">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={patientData.startTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.startTime && touched.startTime ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('startTime')}
              </div>
              <div className="input-field">
                <label htmlFor="endTime">
                  End Time <span className="required">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={patientData.endTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.endTime && touched.endTime ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                />
                {renderFieldError('endTime')}
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn btn-calculate"
                onClick={calculateTotalHours}
                disabled={isSubmitting || !patientData.startTime || !patientData.endTime}
              >
                Calculate Total Hours
              </button>
              <div className="total-hours-display">
                Total Hours: <strong>{patientData.totalHours}</strong> hrs per
                day
              </div>
            </div>

            <div className="input-field">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={patientData.additionalNotes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional information about your care needs..."
                maxLength="1000"
                disabled={isSubmitting}
              />
              <div className="char-count">
                {patientData.additionalNotes.length}/1000 characters
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          type="submit"
          className="btn btn-success"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
