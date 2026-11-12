const express = require('express');
const router = express.Router();
const c = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Semua rute di file ini hanya untuk admin
router.use(verifyToken, hanyaRole('admin'));

router.get('/', c.getAll);
router.patch('/:id/role', c.updateRole);

module.exports = router;