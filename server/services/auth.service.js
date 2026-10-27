

// added for testing the project
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtConfig = require("../config/jwt");

const userRepository = require("../repositories/auth.repository");
const roleService = require("./role.service");
const contactRepository = require("../repositories/contact.repository");

class AuthService {

    async register(data) {

        const {
            name,
            email,
            password,
            department,
            phone_number,
            role_id
        } = data;

        // Check if email already exists
        const existingUser = await userRepository.findUserByEmail(email);

        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Save user
        const user = await userRepository.createUser({
            name,
            email,
            passwordHash,
            department,
            phone_number: phone_number || null
        });

        // Record the requested role at signup time (no auth token exists yet,
        // so this must happen server-side using the newly created user's id
        // rather than via a second authenticated request from the client).
        if (role_id) {
            await roleService.requestRole(user.user_id, role_id);
        }

        return user;
    }

    // Till here
    async login(data) {

        const {
            email,
            password
        } = data;

        // Find user
        const user = await userRepository.findUserByEmail(email);

        if (!user) {

            const rejectedRegistration =
                await userRepository.findRejectedRegistration(email);

            if (rejectedRegistration) {

                await userRepository.deleteRejectedRegistration(
                    rejectedRegistration.id
                );

                throw {
                    status: 403,
                    message: "Your registration was rejected.",
                    code: "registration_rejected",
                    reason: rejectedRegistration.reason
                };
            }

            throw {
                status: 401,
                message: "Invalid email or password"
            };
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            throw {
                status: 401,
                message: "Invalid email or password"
            };
        }

        // Approval check
        if (!user.is_approved) {

            throw {
                status: 403,
                message:
                    "Your account is pending admin approval.",
                code: "pending"
            };
        }

        // Check rejected role
        const rejectedRole =
            await userRepository.findRejectedRole(user.user_id);

        if (
            rejectedRole &&
            rejectedRole.rejection_message
        ) {

            throw {
                status: 403,
                message: "Your role request was rejected.",
                code: "role_rejected",
                rejection_message:
                    rejectedRole.rejection_message
            };
        }

        // Fetch roles
        const roles =
            await userRepository.getUserRoles(user.user_id);

        await contactRepository.syncUserContact(user.user_id);

        
                // Generate JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                roles
            },
            jwtConfig.SECRET,
            {
                expiresIn: jwtConfig.EXPIRES_IN
            }
        );
        return {

            token,

            user: {

                id: user.user_id,
                user_id: user.user_id,

                name: user.name,

                email: user.email,

                department: user.department,

                phone_number: user.phone_number || null,
                role: user.role || null,
                roles
            }

        };

    }

}

module.exports = new AuthService();