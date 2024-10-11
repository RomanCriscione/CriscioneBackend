const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

module.exports = {
    createHash: password => bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    isValidPassword: (user, password) => bcrypt.compareSync(password, user.password),
};
