const router = require('express').Router();
const c = require('../controllers/paketController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Publik
router.get('/', c.getPaket);
router.get('/:id', c.getPaketById);

// user dan admin
router.post('/', verifyToken, hanyaRole('user', 'admin'), c.createPaket);

module.exports = router;