const authService = require("../services/auth.service");
const userService =require("../services/user.service");

const registerUser = async (req, res) => {
    try {

        const user = await authService.register(req.body);

        res.status(201).json({
            message: "Registration successful. Your account is pending admin approval.",
            user
        });

    } catch (error) {

        console.log(error);

        res.status(error.status || 500).json({
            message: error.message || "Server Error",
            reason: error.reason,
            rejection_message: error.rejection_message,
            status: error.code
        });

    }
};

const loginUser = async (req, res) => {
    try {

        const result = await authService.login(req.body);

        res.json({
            message: "Login successful",
            token: result.token,
            user: result.user
        });

    } catch (error) {

        console.log(error);

        res.status(error.status || 500).json({
            message: error.message || "Server Error",
            reason: error.reason,
            rejection_message: error.rejection_message,
            status: error.code
        });

    }
};
const updateProfile = async(req,res)=>{

    try{

        const user =
        await userService.updateProfile(
            req.user.userId,
            req.body
        );

        res.json({

            message:"Profile updated",

            user

        });

    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};
const getKeyContactRegistry = async(req,res)=>{

    try{

        const contacts =
        await userService.getRegistry();

        res.json(contacts);

    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    getKeyContactRegistry
};