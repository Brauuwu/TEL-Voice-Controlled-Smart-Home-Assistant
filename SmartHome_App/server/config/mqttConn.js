const mqtt = require('mqtt');
require('dotenv').config();

const broker = process.env.MQTT_BROKER || 'mqtt://localhost';
const options = {
    clientId: 'SmartHome_Backend_' + Math.random().toString(16).substr(2, 8),
    username: process.env.MQTT_USER || '',
    password: process.env.MQTT_PASS || '',
    clean: true,
    reconnectPeriod: 5000
};

const mqttClient = mqtt.connect(broker, options);

mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT Broker:', broker);
    mqttClient.subscribe('smarthome/sensors');
    mqttClient.subscribe('smarthome/status');
});

mqttClient.on('error', (err) => {
    console.error('❌ MQTT Connection Error:', err);
});

mqttClient.on('reconnect', () => {
    console.log('🔄 Retrying MQTT connection...');
});

module.exports = mqttClient;
