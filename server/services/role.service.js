const roleRepository = require("../repositories/role.repository");

class RoleService {

    async requestRole(userId, roleId) {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 18);
        return await roleRepository.requestRole(
            userId,
            roleId,
            deadline
        );

    }

    async getPendingRoles() {

        return await roleRepository.getPendingRoles();

    }

    async approveRole(id) {

        const request =
            await roleRepository.getRoleRequest(id);

        if (!request) {

            throw {
                status:404,
                message:"Role request not found"
            };

        }

        await roleRepository.addUserRole(
            request.user_id,
            request.role_id
        );

        await roleRepository.approveRole(id);

    }

    async rejectRole(id,message){

        if(!message){

            throw{
                status:400,
                message:"Rejection message required"
            }

        }

        await roleRepository.rejectRole(id,message);

    }

    async getRoles(){

        return await roleRepository.getRoles();

    }

    async getUsersWithRoles() {
        return await roleRepository.getUsersWithRoles();
    }

    async assignRoleToUser(userId, roleId) {
        await roleRepository.assignRoleToUser(userId, roleId);
    }

    async removeRoleFromUser(userId, roleId) {
        await roleRepository.removeRoleFromUser(userId, roleId);
    }

    async getPendingRolesWithDetails() {
        return await roleRepository.getPendingRolesWithDetails();
    }

    async getPendingUsers(){

        return await roleRepository.getPendingUsers();

    }

    async approveUser(id){

        await roleRepository.approveUser(id);

    }

    async rejectUser(id,reason){

        if(!reason){

            throw{
                status:400,
                message:"Reason required"
            }

        }

        const user =
            await roleRepository.getUser(id);

        if(!user){

            throw{
                status:404,
                message:"User not found"
            }

        }

        await roleRepository.saveRejectedRegistration(

            user.email,
            user.name,
            reason

        );

        await roleRepository.deleteUser(id);

    }

}

module.exports = new RoleService();