const Sensordata = require('../models/Sensordata');

exports.getAll = function (req, res) {
    Sensordata.getAll(function (err, data) {
        console.log('controller');
        if (err) res.send(err);
        console.log('res', data);
        res.send(data);
    });
};
