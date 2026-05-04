const dbConn = require('../config/dbConn');

const Relay = function (relay) {
    this.relayId = relay.relayId;
    this.state = relay.state;
    this.date = relay.date;
};

Relay.getAll = function (result) {
    dbConn.query('SELECT * FROM relay ORDER BY id DESC', function (err, res) {   
        if (err) {
            console.log('error: ', err);
            result(null, err);
        } else {
            console.log('data : ', res);
            result(null, res);
        }
    });
};
module.exports = Relay;
