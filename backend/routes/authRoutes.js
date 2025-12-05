import express from 'express';
import jwt from 'jsonwebtoken';
import User from './../src/models/user.js';
import authenticateToken from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {email,password, username, gender, profileImage} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return  res.status(400).json({message: "User already exists"});
        
        const existingUsername = await User.findOne({username});
        if(existingUsername) return  res.status(400).json({message: "Username already taken"});

        const user = new User({email, password, username, gender, profileImage, outfits:[]});
        await user.save();

        // Generate a JWT token
        const token  = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '30d'});
        res.status(201).json({
            token, 
            user:{
                id: user._id,
                email: user.email,
                username: user.username,
                gender: user.gender,
                profileImage: user.profileImage,
                outfits: user.outfits
            }
         });
        
    } catch (error) {
        console.log("Error in register route:", error);
        res.status(500).json({message: "Server error"});
    }
})

router.post("/login", async(req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({message: "Email and password are required"});

        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: "Invalid credentials"});
        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(401).json({message: "Invalid credentials"});

        // Generate a JWT token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '30d'});

        // Send this to client
        res.status(200).json({
            token,
            user:{
                id: user._id,
                email: user.email,
                username: user.username,
                gender: user.gender,
                profileImage: user.profileImage,
                outfits: user.outfits
            }
         });

    } catch (error) {
        console.log("Error in login route:", error);
        res.status(500).json({message: "Server error"});
    }
})

router.get("/me", authenticateToken ,async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if(!user) return res.status(404).json({message: "User not found"});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Server error in fetching user data"});
    }
})

export default router;