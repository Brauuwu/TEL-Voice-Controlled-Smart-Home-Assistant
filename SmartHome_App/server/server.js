const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const port = process.env.PORT || 8688;

app.use(cors());
app.use(bodyParser.json());

// Global State
app.locals.currentMode = 'manual';
app.locals.lastState = { fan: false, led: false, buzzer: false };
app.locals.latestSensors = { temperature: 0, humidity: 0, ldr: 0, motion: false };

// Helper to evaluate auto logic
const evaluateAutoLogic = async (sensors) => {
    const { temperature, ldr, motion } = sensors;
    const mode = app.locals.currentMode;
    if (mode !== 'auto') return;

    // Logic 1: LDR or Motion -> LED
    const shouldLedBeOn = (ldr < 100 || motion === true || motion === 1);
    if (shouldLedBeOn !== app.locals.lastState.led) {
        const action = shouldLedBeOn ? 'ON' : 'OFF';
        mqttClient.publish('smarthome/commands/led', JSON.stringify({ device: 'led', action, username: 'auto', type: 'auto' }));
        db.query('INSERT INTO activity_logs (event_type, device, action, username, details) VALUES (?, ?, ?, ?, ?)', ['auto', 'led', action, 'System', `Auto-trigger (LDR:${ldr}, Motion:${motion})`]);
        io.emit('new_activity', { event_type: 'auto', device: 'led', action, username: 'System', details: 'Auto-trigger', timestamp: new Date() });
        io.emit('status_update', { device: 'led', status: action });
    }

    // Logic 2: Temperature -> Fan & Buzzer
    const shouldCoolingBeOn = (temperature > 30);
    if (shouldCoolingBeOn !== app.locals.lastState.fan) {
        const action = shouldCoolingBeOn ? 'ON' : 'OFF';
        mqttClient.publish('smarthome/commands/fan', JSON.stringify({ device: 'fan', action, username: 'auto', type: 'auto' }));
        db.query('INSERT INTO activity_logs (event_type, device, action, username, details) VALUES (?, ?, ?, ?, ?)', ['auto', 'fan', action, 'System', `Auto-trigger (Temp:${temperature})`]);
        io.emit('new_activity', { event_type: 'auto', device: 'fan', action, username: 'System', details: 'Auto-trigger', timestamp: new Date() });
        io.emit('status_update', { device: 'fan', status: action });
    }
    
    if (shouldCoolingBeOn !== app.locals.lastState.buzzer) {
        const action = shouldCoolingBeOn ? 'ON' : 'OFF';
        mqttClient.publish('smarthome/commands/buzzer', JSON.stringify({ device: 'buzzer', action, username: 'auto', type: 'auto' }));
        io.emit('status_update', { device: 'buzzer', status: action });
    }

    app.locals.lastState = { fan: shouldCoolingBeOn, led: shouldLedBeOn, buzzer: shouldCoolingBeOn };
};

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'btliot'
}).promise();

// MQTT Connection
const mqttClient = require('./config/mqttConn');

mqttClient.on('message', async (topic, message) => {
    const messageStr = message.toString();
    
    if (topic === 'smarthome/sensors') {
        try {
            const payload = JSON.parse(messageStr);
            const { temperature, humidity, motion, ldr, fan, led } = payload;
            app.locals.latestSensors = { temperature, humidity, ldr, motion };
            const mode = app.locals.currentMode;
            
            // Auto-detection logic for activity logs
            if (mode === 'auto') {
                await evaluateAutoLogic(app.locals.latestSensors);
            }

            // Save to DB
            await db.query(
                'INSERT INTO sensordata (temp, humi, light, motion) VALUES (?, ?, ?, ?)',
                [temperature, humidity, ldr, motion]
            );
            
            // Emit to Frontend with correct mode
            io.emit('sensor_update', { ...payload, mode });
        } catch (e) {
            console.error('❌ Error parsing sensor JSON:', e.message);
        }
    } 
    else if (topic === 'smarthome/status') {
        const status = messageStr.trim().toLowerCase();
        if (status === 'online' || status === 'offline') {
            console.log(`📡 Gateway is now: ${status.toUpperCase()}`);
            try {
                await db.query(
                    'INSERT INTO device_status (device_id, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status=?, last_seen=CURRENT_TIMESTAMP',
                    ['gateway', status, status]
                );
                
                // Log status change in activity logs
                const logData = {
                    event_type: 'system',
                    device: 'gateway',
                    action: status.toUpperCase(),
                    username: 'System',
                    details: `Gateway connection changed to ${status}`,
                    timestamp: new Date()
                };
                await db.query(
                    'INSERT INTO activity_logs (event_type, device, action, username, details) VALUES (?, ?, ?, ?, ?)',
                    [logData.event_type, logData.device, logData.action, logData.username, logData.details]
                );

                io.emit('status_update', { device: 'gateway', status: status });
                io.emit('new_activity', logData);
            } catch (err) {
                console.error('❌ Database error updating status:', err.message);
            }
        } else {
            console.warn(`⚠️ Received invalid status message: "${messageStr}"`);
        }
    }
});

// Socket.io for Real-time control
io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial status to the newly connected client
    try {
        const [rows] = await db.query('SELECT status FROM device_status WHERE device_id = ?', ['gateway']);
        if (rows.length > 0) {
            socket.emit('status_update', { device: 'gateway', status: rows[0].status });
        }
        
        // Send current mode and device states
        socket.emit('status_update', { device: 'mode', status: app.locals.currentMode });
        Object.keys(app.locals.lastState).forEach(device => {
            socket.emit('status_update', { device, status: app.locals.lastState[device] ? 'ON' : 'OFF' });
        });
    } catch (err) {
        console.error('❌ Error sending initial status to client:', err.message);
    }
    
    socket.on('control_device', async (data) => {
        const { device, action, username, type } = data;
        
        if (device === 'mode') {
            app.locals.currentMode = action;
            console.log(`🛠️ System Mode changed to: ${action.toUpperCase()}`);
            
            const modeLog = {
                event_type: 'system',
                device: 'mode',
                action: action.toUpperCase(),
                username,
                details: `System switched to ${action.toUpperCase()} mode`,
                timestamp: new Date()
            };
            await db.query(
                'INSERT INTO activity_logs (event_type, device, action, username, details) VALUES (?, ?, ?, ?, ?)',
                [modeLog.event_type, modeLog.device, modeLog.action, modeLog.username, modeLog.details]
            );
            io.emit('new_activity', modeLog);

            if (action === 'auto') {
                evaluateAutoLogic(app.locals.latestSensors);
            }
            io.emit('status_update', { device: 'mode', status: action });
            return; // Mode change logged separately
        }

        // Publish to MQTT
        mqttClient.publish(`smarthome/commands/${device}`, JSON.stringify(data));
        
        const logData = {
            event_type: type,
            device,
            action,
            username,
            details: `Control via ${type.toUpperCase()} [Mode: ${app.locals.currentMode.toUpperCase()}]`,
            timestamp: new Date()
        };

        // Log activity
        await db.query(
            'INSERT INTO activity_logs (event_type, device, action, username, details) VALUES (?, ?, ?, ?, ?)',
            [logData.event_type, logData.device, logData.action, logData.username, logData.details]
        );
        
        // Emit to Frontend
        io.emit('new_activity', logData);
        io.emit('status_update', { device, status: action });
        
        console.log(`Control: ${device} -> ${action} by ${username}`);
    });
});

// API Routes
app.get('/api/logs', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
});

app.get('/api/sensors/history', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM sensordata ORDER BY timestamp DESC LIMIT 20');
    res.json(rows);
});

const bcrypt = require('bcryptjs');

// Login Route with Hashing
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`🔑 Login attempt: ${username}`);
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            const user = rows[0];
            console.log(`Found user: ${user.username}, Hash in DB: ${user.password.substring(0, 10)}...`);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password match: ${isMatch}`);
            
            if (isMatch) {
                const { password, ...userWithoutPassword } = user;
                return res.json({ success: true, user: userWithoutPassword });
            }
        } else {
            console.log(`User not found: ${username}`);
        }
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// User Management Routes (Admin only check in frontend, but good to have here too)
app.get('/api/users', async (req, res) => {
    const [rows] = await db.query('SELECT id, username, role FROM users');
    res.json(rows);
});

app.post('/api/users', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Username already exists' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/status/gateway', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT status FROM device_status WHERE device_id = ?', ['gateway']);
        res.json({ status: rows.length > 0 ? rows[0].status : 'offline' });
    } catch (error) {
        res.status(500).json({ status: 'offline' });
    }
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
