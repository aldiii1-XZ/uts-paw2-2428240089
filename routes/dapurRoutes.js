const router = require('express').Router();
const c = require('../controllers/dapurController');

router.post('/', c.createDapur);
router.get('/', c.getDapur);

module.exports = router;