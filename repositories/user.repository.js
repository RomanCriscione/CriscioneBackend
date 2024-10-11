const User = require('../models/user');

class UserRepository {
    async createUser(data) {
        const user = new User(data);
        await user.save();
        return user;
    }

    async getUserById(id) {
        return await User.findById(id);
    }

    async updateUser(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async getAllUsers() {
        return await User.find();
    }
}

module.exports = new UserRepository();
