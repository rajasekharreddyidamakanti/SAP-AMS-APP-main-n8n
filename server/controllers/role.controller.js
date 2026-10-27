const roleService = require("../services/role.service");

const requestRole = async (req, res) => {
    try {

        const result = await roleService.requestRole(
            req.user.userId,
            req.body.role_id
        );

        res.status(201).json(result);

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const getPendingRoles = async(req,res)=>{

    try{

        const result =
            await roleService.getPendingRoles();

        res.json(result);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

const approveRole = async(req,res)=>{

    try{

        await roleService.approveRole(req.params.id);

        res.json({
            message:"Role approved"
        });

    }catch(error){

        res.status(error.status||500).json({
            message:error.message
        });

    }

};

const rejectRole = async(req,res)=>{

    try{

        await roleService.rejectRole(
            req.params.id,
            req.body.message
        );

        res.json({
            message:"Role rejected"
        });

    }catch(error){

        res.status(error.status||500).json({
            message:error.message
        });

    }

};

const getRoles = async(req,res)=>{

    res.json(await roleService.getRoles());

};

const getPendingUsers = async(req,res)=>{

    res.json(
        await roleService.getPendingUsers()
    );

};

const approveUser = async(req,res)=>{

    await roleService.approveUser(req.params.id);

    res.json({
        message:"User approved"
    });

};

const rejectUser = async(req,res)=>{

    await roleService.rejectUser(
        req.params.id,
        req.body.reason
    );

    res.json({
        message:"User rejected"
    });

};

const getUsersWithRoles = async (req, res) => {
    try {
        const result = await roleService.getUsersWithRoles();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignRoleToUser = async (req, res) => {
    try {
        await roleService.assignRoleToUser(req.params.userId, req.body.role_id);
        res.json({ message: "Role assigned" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const removeRoleFromUser = async (req, res) => {
    try {
        await roleService.removeRoleFromUser(req.params.userId, req.params.roleId);
        res.json({ message: "Role removed" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const getPendingRolesWithDetails = async (req, res) => {
    try {
        const result = await roleService.getPendingRolesWithDetails();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={
    requestRole,
    getPendingRoles,
    approveRole,
    rejectRole,
    getRoles,
    getPendingUsers,
    approveUser,
    rejectUser,
    getUsersWithRoles,
    assignRoleToUser,
    removeRoleFromUser,
    getPendingRolesWithDetails,
};