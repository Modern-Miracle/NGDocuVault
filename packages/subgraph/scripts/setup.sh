#!/bin/bash

set -e

# Get the IP address of the Docker host
HOST_IP=$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')

if [ -z "$HOST_IP" ]; then
  echo "Could not determine Docker host IP address. Using default gateway."
  # Alternative approach - get default gateway
  HOST_IP=$(ip route | grep default | awk '{print $3}')
  
  if [ -z "$HOST_IP" ]; then
    echo "Could not determine default gateway. Using 172.17.0.1 as fallback."
    HOST_IP="172.17.0.1"
  fi
fi

echo "Using Docker host IP: $HOST_IP"

# Update docker-compose.yml file
# We're replacing the ethereum connection URL with the one using our detected host IP
sed -i "s|ethereum: 'hardhat:http://172.17.0.1:8545'|ethereum: 'hardhat:http://$HOST_IP:8545'|g" docker-compose.yml

echo "Updated docker-compose.yml with host IP: $HOST_IP"
echo "Now you can start the Graph Node with: docker compose up -d" 
