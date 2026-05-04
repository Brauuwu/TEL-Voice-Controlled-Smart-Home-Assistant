const express = require('express')
const router = express.Router()

const Relay =   require('../controllers/Relay');

router.get('/', Relay.getAll);

module.exports = router