#!/bin/bash

# Default values
TELEGRAM_ID="123456789"  # Default test user
AMOUNT=1000             # Default 1000 DOGE

# Check if custom telegram ID is provided
if [ ! -z "$1" ]; then
  TELEGRAM_ID=$1
fi

# Check if custom amount is provided
if [ ! -z "$2" ]; then
  AMOUNT=$2
fi

# Make the deposit request
curl -X POST http://localhost:5000/api/test/deposit \
  -H "Content-Type: application/json" \
  -d "{\"telegramId\": \"$TELEGRAM_ID\", \"amount\": $AMOUNT}" \
  | json_pp

echo ""
echo "✓ Deposit request completed"