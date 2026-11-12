const router = require('express').Router();
const c = require('../controllers/dapurController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Publik
router.get('/', c.getDapur);

// admin saja
router.post('/', verifyToken, hanyaRole('admin'), c.createDapur);

module.exports = router;