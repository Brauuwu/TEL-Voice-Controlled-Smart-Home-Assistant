const Relay = require('../models/Relay');

// hàm điều khiển này có thể được xuất ra để điều khiển ở nơi khác
exports.getAll = function (req, res) {
    Relay.getAll(function (err, data) {
        console.log('controller');
        if (err) res.send(err);
        console.log('res', data);
        res.send(data);
    });
};
