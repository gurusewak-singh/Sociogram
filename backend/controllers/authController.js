// backend/controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      needsSetup: true, // Mark this user for the onboarding flow
    });
    
    await newUser.save();

    // Log the user in immediately
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password before sending user object back
    const userObject = newUser.toObject();
    delete userObject.password;

    // Send back token and user object, just like the login endpoint
    res.status(201).json({ token, user: userObject });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res)=>{
try{
  const { emailOrUsername = "", password } = req.body;


  let user;


   if(emailOrUsername.includes('@')){
    user = await User.findOne({email: emailOrUsername})
   }
   else{
    user = await User.findOne({username: emailOrUsername})
   }
   if(!user){
    return res.status(404).json({message: "User not found"})
   }

   const isMatch = await bcrypt.compare(password, user.password)
   if(!isMatch){
    return res.status(400).json({message: "Invalid credentials"})
   }  
   console.log("LOGIN HIT");
   const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
   res.json({token, user});
}catch(err){
  res.status(500).json({message: err.message})
}
}