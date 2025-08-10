const Patient = require('../models/patient.model');
const Caretaker = require('../models/caretaker.model');

// exports.login = async (req, res) => {
//   const { email, lastDigits } = req.body;
// //   console.log('Login attempt for:', email);

//   try {
//     // console.log('Searching for patient...');
//     const patient = await Patient.findOne({ email })
//       .select('+authDigits')
//       .lean();
//     // console.log('Patient query completed');

//     // console.log('Searching for caretaker...');
//     const caretaker = await Caretaker.findOne({ email })
//       .select('+authDigits')
//       .lean();
//     // console.log('Caretaker query completed');

//     const user = patient || caretaker;
//     console.log('User resolved:', user ? 'Found' : 'Not found');

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'User not found' });
//     }

//     console.log(
//       'Comparing digits - DB:',
//       user.authDigits,
//       'Input:',
//       lastDigits
//     );
//     if (user.authDigits !== lastDigits) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid credentials' });
//     }

//     // Remove sensitive data
//     delete user.authDigits;

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       user: user,
//       role: patient ? 'patient' : 'caretaker',
//     });
//   } catch (error) {
//     console.error('Full error details:', {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//     });
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };



// In your auth controller
exports.login = async (req, res) => {
  console.log('Login request body:', req.body); // Log the request body for debugging
  
  try {
    // Handle both frontend and Postman request formats
    let { email, lastDigits, role } = req.body;
    
    // If data is nested in formData (frontend request)
    if (req.body.formData && req.body.formData.formData) {
      ({ email, lastDigits, role } = req.body.formData.formData);
    }
    
    console.log('Login attempt for:', email, 'Role:', role);
    
    // Find user based on email and role
    const user = await (role === 'patient' ? Patient : Caretaker).findOne(
      { email }
    ).select('+authDigits');

    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate the lastDigits against user's authDigits
    if (user.authDigits !== lastDigits) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.authDigits;

    res.json({
      success: true,
      role,
      name: user.firstName,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};