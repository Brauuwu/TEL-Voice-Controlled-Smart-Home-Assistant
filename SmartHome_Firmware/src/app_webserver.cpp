#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "app_webserver.h"
#include "wifi_manager.h"

WebServer server(80);

const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Home Configuration</title>
  <style>
    :root {
      --primary: #4ade80;
      --primary-hover: #22c55e;
      --bg-color: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.7);
      --text-color: #f8fafc;
      --border-color: rgba(255,255,255,0.1);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at top right, #1e293b, var(--bg-color));
      color: var(--text-color);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 40px 30px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(to right, #4ade80, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .header p {
      color: #94a3b8;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #cbd5e1;
    }
    select, input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      color: white;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    select:focus, input:focus {
      border-color: var(--primary);
    }
    button {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: #000;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }
    button:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(74, 222, 128, 0.3);
    }
    .scan-btn {
      background: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
      margin-bottom: 15px;
    }
    .scan-btn:hover {
      background: rgba(74, 222, 128, 0.1);
      box-shadow: none;
    }
    .loader {
      display: none;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #msg {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #4ade80;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Smart Home</h1>
      <p>Wi-Fi Configuration</p>
    </div>
    
    <button type="button" class="scan-btn" onclick="scanWifi()" id="scanBtn">Scan for Networks</button>
    <div class="loader" id="loader"></div>

    <form id="wifiForm">
      <div class="form-group">
        <label for="ssid">Select Wi-Fi Network</label>
        <select id="ssid" name="ssid">
          <option value="">-- Choose a network --</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="pass">Password</label>
        <input type="password" id="pass" name="pass" placeholder="Enter Wi-Fi password">
      </div>
      
      <button type="submit" id="saveBtn">Save & Connect</button>
    </form>
    
    <div id="msg">Credentials saved! Rebooting...</div>
  </div>

  <script>
    async function scanWifi() {
      const btn = document.getElementById('scanBtn');
      const loader = document.getElementById('loader');
      const select = document.getElementById('ssid');
      
      btn.style.display = 'none';
      loader.style.display = 'block';
      
      try {
        const res = await fetch('/scan');
        const networks = await res.json();
        
        select.innerHTML = '<option value="">-- Choose a network --</option>';
        networks.forEach(net => {
          const opt = document.createElement('option');
          opt.value = net.ssid;
          opt.textContent = `${net.ssid} (${net.rssi}dBm)`;
          select.appendChild(opt);
        });
      } catch (err) {
        alert('Failed to scan networks!');
      } finally {
        loader.style.display = 'none';
        btn.style.display = 'block';
      }
    }

    document.getElementById('wifiForm').onsubmit = async (e) => {
      e.preventDefault();
      const ssid = document.getElementById('ssid').value;
      const pass = document.getElementById('pass').value;
      const saveBtn = document.getElementById('saveBtn');
      
      if (!ssid) return alert('Please select a network!');
      
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      const formData = new URLSearchParams();
      formData.append('ssid', ssid);
      formData.append('pass', pass);
      
      try {
        await fetch('/save', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: formData
        });
        document.getElementById('msg').style.display = 'block';
        saveBtn.style.display = 'none';
      } catch (err) {
        alert('Failed to save!');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Connect';
      }
    };
    
    // Auto-scan on load
    window.onload = scanWifi;
  </script>
</body>
</html>
)rawliteral";

void webInit() {
  server.on("/", []() {
    server.send(200, "text/html", INDEX_HTML);
  });

  server.on("/scan", []() {
    int n = WiFi.scanNetworks();
    String json = "[";
    for (int i = 0; i < n; ++i) {
      if (i > 0) json += ",";
      json += "{\"ssid\":\"" + WiFi.SSID(i) + "\",\"rssi\":" + String(WiFi.RSSI(i)) + "}";
    }
    json += "]";
    server.send(200, "application/json", json);
    WiFi.scanDelete();
  });

  server.on("/save", HTTP_POST, []() {
    String ssid = server.arg("ssid");
    String pass = server.arg("pass");
    
    if (ssid.length() > 0) {
      saveWifiCredentials(ssid, pass);
      server.send(200, "text/plain", "OK");
      delay(1000);
      ESP.restart(); // Reboot to apply new credentials
    } else {
      server.send(400, "text/plain", "Bad Request");
    }
  });

  server.begin();
}

void webHandle() {
  server.handleClient();
}