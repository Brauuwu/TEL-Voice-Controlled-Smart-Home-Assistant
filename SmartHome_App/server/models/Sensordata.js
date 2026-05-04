const dbConn = require('../config/dbConn');

const Sensordata = function (dataSensor) {
    this.temp = dataSensor.temp;
    this.humi = dataSensor.humi;
    this.light = dataSensor.light;
    this.date = dataSensor.date;
};

Sensordata.getAll = function (result) {
    dbConn.query('SELECT * FROM sensordata ORDER BY id DESC', function (err, res) {   //SELECT * FROM sensordata ORDER BY id DESC
        if (err) {
            // console.log('error: ', err);
            result(null, err);
        } else {
            // console.log('data : ', res);
            result(null, res);
        }
    });
};
module.exports = Sensordata;
