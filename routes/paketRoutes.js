const router = require('express').Router();
const c = require('../controllers/paketController');

router.post('/', c.createPaket);
router.get('/', c.getPaket);
router.get('/:id', c.getPaketById);

module.exports = router;