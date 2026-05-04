const express = require('express')
const router = express.Router()

const Sensordata =   require('../controllers/Sensordata');

router.get('/', Sensordata.getAll);

module.exports = router