import os
from os.path import isfile, join

Import("env")

# Path to .env file in the firmware directory
env_file = join(env.get("PROJECT_DIR"), ".env")

if isfile(env_file):
    print(f"Reading secrets from {env_file}")
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                try:
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    
                    # Add as global define
                    # StringifyQuote ensures it's passed as a "string" to C++ if it's text
                    if key == "MQTT_PORT":
                        env.Append(CPPDEFINES=[(key, value)])
                    else:
                        env.Append(CPPDEFINES=[(key, f'\\"{value}\\"')])
                except ValueError:
                    continue # Skip malformed lines
else:
    print(".env file not found!")
