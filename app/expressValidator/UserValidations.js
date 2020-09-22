const { check } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    case 'registerUser': {
      return [
        check('user_email', 'Email key doesnt exist').exists(),
        check('user_email', 'Email should not be empty').not().isEmpty(),
        check('user_email', 'Enter a valid email id').isEmail(),
        check('user_password', 'Password key doesnt exist').exists(),
        check('user_password', 'Password should not be empty').not().isEmpty(),
        check('user_password', 'Password should minimum 8').isLength({ min: 8 }),
        // check('user_password', 'Password should not be more than 15').isLength({ max: 15 }),
        check('user_name', 'Name key doesnt exist').exists(),
        check('user_name', 'Name should not be empty').not().isEmpty(),
        check('user_name', 'Invalid user name, Please enter valid name').matches(/^\w[\w ]*\w$/).exists(),
        check('user_mobile', 'Mobile key doesnt exist').exists(),
        check('user_mobile', 'Mobile should not be empty').not().isEmpty(),
        check('user_mobile', 'Invalid mobile number').isMobilePhone(),

      ]
    }
    case 'loginUser': {
      return [
        check('user_email', 'Email key doesnt exist').exists(),
        check('user_email', 'Email should not be empty').not().isEmpty(),
        check('user_email', 'Enter a valid email id').isEmail(),
        check('user_password', 'Password key doesnt exist').exists(),
        check('user_password', 'Password should not be empty').not().isEmpty()
      ]
    }
    case 'sendOTP': {
      return [
        check('user_email', 'Email key doesnt exist').exists(),
        check('user_mobile', 'Mobile key doesnt exist').exists(),
        check('user_mobile', 'Mobile should not be empty').not().isEmpty(),
        check('user_mobile', 'Invalid mobile number').isMobilePhone(),
        // check('user_email', 'Email should not be empty').not().isEmpty(),
        // check('user_email', 'Enter a valid email id').isEmail(),
      ]
    }
    case 'verifyOTP': {
      return [
        check('user_email', 'Email key doesnt exist').exists(),
        check('user_mobile', 'Mobile key doesnt exist').exists(),
        check('user_mobile', 'Mobile should not be empty').not().isEmpty(),
        check('user_mobile', 'Invalid mobile number').isMobilePhone(),
        // check('user_email', 'Email should not be empty').not().isEmpty(),
        // check('user_email', 'Enter a valid email id').isEmail(),
        check('otp', 'OTP key doesnt exist').exists(),
        check('otp', 'OTP key should not be empty').not().isEmpty(),
        check('otp', 'OTP should not be more than 6 letters').isLength({ max: 6 }),
        check('otp', 'Invalid otp, Please enter valid otp').matches(/^[A-Z0-9]+$/).exists(),
      ]
    }
    case 'updatePassword': {
      return [
        check('user_email', 'Email key doesnt exist').exists(),
        // check('user_email', 'Email should not be empty').not().isEmpty(),
        check('user_mobile', 'Mobile key doesnt exist').exists(),
        check('user_mobile', 'Mobile should not be empty').not().isEmpty(),
        check('user_mobile', 'Invalid mobile number').isMobilePhone(),
        check('user_password', 'Password key doesnt exist').exists(),
        check('user_password', 'Password should not be empty').not().isEmpty()
      ]
    }
  }
};

/*
^\w[\w ]*\w$
Also: If you intentionally worded your regex that it also allows empty Strings, you have to make the entire thing optional:

^(\w[\w ]*\w)?$
If you want to only allow single space chars, it looks a bit different:

^((\w+ )*\w+)?$
This matches 0..n words followed by a single space, plus one word without space. And makes the entire thing optional to allow empty strings.
*/