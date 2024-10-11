const { Router } = require('express');
const UserRepository = require('../repositories/user.repository')
const UserDTO = require('../dto/user.dto');
const verifyToken = require('../middleware/auth').verifyToken;

const router = Router();

router.get('/current', verifyToken, async (req, res) => {
    try {
        const user = await UserRepository.getUserById(req.user.id)
        const userDto = new UserDTO(user)
        res.send(userDto)
    } catch (err) {
        res.status(500).send({ message: 'Error retrieving user' });
    }
});

module.exports = router;
