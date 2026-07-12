#!/usr/bin/env bash
# detect_lan_ip.sh — Auto-detect host LAN IP and update .env
# Usage: bash automated_scripts/detect_lan_ip.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

# Detect LAN IP
if command -v ip &> /dev/null; then
    # Linux / WSL2
    DETECTED_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' || hostname -I 2>/dev/null | awk '{print $1}')
elif command -v ipconfig &> /dev/null; then
    # Windows (Git Bash)
    DETECTED_IP=$(ipconfig | grep -A 10 "Wireless\|Ethernet" | grep "IPv4" | head -1 | awk '{print $NF}')
else
    # macOS fallback
    DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

if [ -z "${DETECTED_IP:-}" ]; then
    echo "ERROR: Could not detect LAN IP. Set HOST_LAN_IP manually in .env"
    exit 1
fi

echo "Detected LAN IP: $DETECTED_IP"

# Create .env from example if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo "Created .env from .env.example"
    else
        echo "ERROR: .env.example not found"
        exit 1
    fi
fi

# Update HOST_LAN_IP in .env
if grep -q "HOST_LAN_IP=" "$ENV_FILE"; then
    sed -i "s|HOST_LAN_IP=.*|HOST_LAN_IP=$DETECTED_IP|" "$ENV_FILE"
else
    echo "HOST_LAN_IP=$DETECTED_IP" >> "$ENV_FILE"
fi

# Update VITE_API_URL to use the detected IP
if grep -q "VITE_API_URL=" "$ENV_FILE"; then
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$DETECTED_IP:8000/api|" "$ENV_FILE"
else
    echo "VITE_API_URL=http://$DETECTED_IP:8000/api" >> "$ENV_FILE"
fi

echo "Updated .env:"
echo "  HOST_LAN_IP=$DETECTED_IP"
echo "  VITE_API_URL=http://$DETECTED_IP:8000/api"
echo ""
echo "Other devices can access:"
echo "  Frontend: http://$DETECTED_IP:5173"
echo "  Backend:  http://$DETECTED_IP:8000/api"
