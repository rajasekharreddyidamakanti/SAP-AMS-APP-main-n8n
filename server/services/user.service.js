const userRepository =
require("../repositories/user.repository");

class UserService {

    async updateProfile(userId,data){

        return await userRepository.updateProfile(
            userId,
            data
        );

    }
    async getAllUsers(){

        return await userRepository.getAllUsers();

    }
    async getRegistry(){

        return await userRepository.getKeyContactRegistry();

    }

}

module.exports = new UserService();