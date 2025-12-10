#!/bin/bash
# Test script for Gemini API

# Test if API endpoint is working
echo "Testing Gemini API endpoint..."

# Get API key from environment
if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Error: GEMINI_API_KEY not set in environment"
  exit 1
fi

# Make a test request
RESPONSE=$(curl -s -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in JSON format","model":"gemini-2.0-flash"}')

echo "Response:"
echo "$RESPONSE"

# Check if response contains error
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ API returned an error"
  exit 1
else
  echo "✅ API test successful"
  exit 0
fi
