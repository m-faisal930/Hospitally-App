import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/caretakerForm.css';
import { createCaretaker } from '../services/api';

const CaretakerForm = ({ onSubmit, isSubmitting }) => {
  const [caretakerData, setCaretakerData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    email: '',
    about: '',
    education: '',
    fieldOfStudy: [],
    availableDays: [],
    timeSlots: {
      morning: false,
      afternoon: false,
      evening: false
    },
    experience: '',
    certifications: [],
    languages: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const certificationOptions = [
    'First Aid',
    'CPR',
    'Nursing Certification',
    'Personal Support Worker',
    'Other'
  ];
  const languagesOptions = [
    'English',
    'French',
    'Spanish',
    'Mandarin',
    'Arabic',
    'Other'
  ];

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
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 100) return 'Please enter a valid date of birth';
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
      
      case 'about':
        if (!value.trim()) return 'About section is required';
        if (value.trim().length < 20) return 'About section must be at least 20 characters';
        if (value.trim().length > 500) return 'About section must be less than 500 characters';
        return '';
      
      case 'education':
        if (!value.trim()) return 'Education is required';
        if (value.trim().length < 3) return 'Education must be at least 3 characters';
        return '';
      
      case 'experience':
        if (!value) return 'Please select your experience level';
        return '';
      
      case 'fieldOfStudy':
        if (caretakerData.fieldOfStudy.length === 0) return 'Please select at least one field of study';
        return '';
      
      case 'availableDays':
        if (caretakerData.availableDays.length === 0) return 'Please select at least one available day';
        return '';
      
      case 'timeSlots':
        const hasTimeSlot = Object.values(caretakerData.timeSlots).some(slot => slot);
        if (!hasTimeSlot) return 'Please select at least one time slot';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(caretakerData).forEach(key => {
      if (key === 'timeSlots') {
        const error = validateField(key, caretakerData[key]);
        if (error) newErrors[key] = error;
      } else if (key === 'fieldOfStudy' || key === 'availableDays') {
        const error = validateField(key, caretakerData[key]);
        if (error) newErrors[key] = error;
      } else {
        const error = validateField(key, caretakerData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaretakerData(prev => ({ ...prev, [name]: value }));
    
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
    setCaretakerData(prev => {
      const updated = checked
        ? [...prev.fieldOfStudy, name]
        : prev.fieldOfStudy.filter(item => item !== name);
      return { ...prev, fieldOfStudy: updated };
    });
    
    // Clear field of study error when user makes selection
    if (errors.fieldOfStudy) {
      setErrors(prev => ({ ...prev, fieldOfStudy: '' }));
    }
  };

  const handleDayChange = (day) => {
    setCaretakerData(prev => {
      const updated = prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
    
    // Clear available days error when user makes selection
    if (errors.availableDays) {
      setErrors(prev => ({ ...prev, availableDays: '' }));
    }
  };

  const handleTimeSlotChange = (slot) => {
    setCaretakerData(prev => ({
      ...prev,
      timeSlots: { ...prev.timeSlots, [slot]: !prev.timeSlots[slot] }
    }));
    
    // Clear time slots error when user makes selection
    if (errors.timeSlots) {
      setErrors(prev => ({ ...prev, timeSlots: '' }));
    }
  };

  const handleCertificationChange = (cert) => {
    setCaretakerData(prev => {
      const updated = prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert];
      return { ...prev, certifications: updated };
    });
  };

  const handleLanguageChange = (lang) => {
    setCaretakerData(prev => {
      const updated = prev.languages.includes(lang)
        ? prev.languages.filter(c => c !== lang)
        : [...prev.languages, lang];
      return { ...prev, languages: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(caretakerData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    try {
      // Extract last 4 digits of phone
      const authDigits = caretakerData.phoneNumber.slice(-4);
      const caretakerData1 = { ...caretakerData, authDigits };

      const response = await createCaretaker(caretakerData1);

      // Store email for future reference
      localStorage.setItem('caretakerEmail', caretakerData1.email);
      localStorage.setItem('userRole', 'caretaker');

      onSubmit(caretakerData, '/professional-dashboard');

    } catch (error) {
      console.error('Error creating caretaker:', error);
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
      <h2 className="form-title">Welcome, Caretaker!</h2>
      <p className="form-subtitle">
        Please fill out the following information to create your profile.
      </p>

      <div className="form-columns">
        {/* Personal Information Column */}
        <div className="form-column">
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
                  value={caretakerData.firstName}
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
                  value={caretakerData.lastName}
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
                value={caretakerData.dob}
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
                value={caretakerData.gender}
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
                value={caretakerData.phoneNumber}
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
                value={caretakerData.email}
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
              <label htmlFor="about">
                About <span className="required">*</span>
              </label>
              <textarea
                id="about"
                name="about"
                value={caretakerData.about}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.about && touched.about ? 'error' : ''}
                placeholder="Tell us about yourself, your experience, and why you want to be a caretaker..."
                rows="4"
                maxLength="500"
                required
                disabled={isSubmitting}
              />
              <div className="char-count">
                {caretakerData.about.length}/500 characters
              </div>
              {renderFieldError('about')}
            </div>

            <div className="input-field">
              <label htmlFor="education">
                Education <span className="required">*</span>
              </label>
              <input
                type="text"
                id="education"
                name="education"
                value={caretakerData.education}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.education && touched.education ? 'error' : ''}
                placeholder="e.g., Bachelor's in Nursing, High School Diploma"
                required
                disabled={isSubmitting}
              />
              {renderFieldError('education')}
            </div>

            <h4 className="section-title">Languages</h4>
            <div className="checkbox-group">
              {languagesOptions.map((lang) => (
                <label key={lang} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={caretakerData.languages.includes(lang)}
                    onChange={() => handleLanguageChange(lang)}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  {lang}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Information Column */}
        <div className="form-column">
          <div className="input-group">
            <h3 className="section-title">Professional Information</h3>

            <div className="input-field">
              <label htmlFor="experience">
                Years of Experience <span className="required">*</span>
              </label>
              <select
                id="experience"
                name="experience"
                value={caretakerData.experience}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.experience && touched.experience ? 'error' : ''}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
              {renderFieldError('experience')}
            </div>

            <h4 className="section-title">
              Field of Study <span className="required">*</span>
            </h4>
            <div className="checkbox-group">
              {[
                'Nursing',
                'Nursing Assistant',
                'Personal Support Worker',
                'Physiotherapy',
                'Occupational Therapy',
                'Social Work',
                'Psychology',
                'Other Healthcare Field',
              ].map((field) => (
                <label key={field} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={field}
                    checked={caretakerData.fieldOfStudy.includes(field)}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  {field}
                </label>
              ))}
            </div>
            {renderFieldError('fieldOfStudy')}

            <h4 className="section-title">Certifications</h4>
            <div className="checkbox-group">
              {certificationOptions.map((cert) => (
                <label key={cert} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={caretakerData.certifications.includes(cert)}
                    onChange={() => handleCertificationChange(cert)}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  {cert}
                </label>
              ))}
            </div>

            <h3 className="section-title">Availability</h3>
            <div className="days-selection">
              <h4>
                Available Days <span className="required">*</span>
              </h4>
              <div className="days-container">
                {daysOfWeek.map((day) => (
                  <label key={day} className="day-checkbox-label">
                    <input
                      type="checkbox"
                      checked={caretakerData.availableDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                      disabled={isSubmitting}
                    />
                    <span className="custom-checkbox"></span>
                    {day}
                  </label>
                ))}
              </div>
            </div>
            {renderFieldError('availableDays')}

            <div className="time-slots-selection">
              <h4>
                Available Time Slots <span className="required">*</span>
              </h4>
              <div className="time-slots-container">
                <label className="time-slot-label">
                  <input
                    type="checkbox"
                    checked={caretakerData.timeSlots.morning}
                    onChange={() => handleTimeSlotChange('morning')}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  Morning (8AM - 12PM)
                </label>
                <label className="time-slot-label">
                  <input
                    type="checkbox"
                    checked={caretakerData.timeSlots.afternoon}
                    onChange={() => handleTimeSlotChange('afternoon')}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  Afternoon (12PM - 5PM)
                </label>
                <label className="time-slot-label">
                  <input
                    type="checkbox"
                    checked={caretakerData.timeSlots.evening}
                    onChange={() => handleTimeSlotChange('evening')}
                    disabled={isSubmitting}
                  />
                  <span className="custom-checkbox"></span>
                  Evening (5PM - 9PM)
                </label>
              </div>
            </div>
            {renderFieldError('timeSlots')}
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

export default CaretakerForm;