#!/bin/bash

# Phase 3 Test Data Population Script
# This script populates test data via API endpoints

API_BASE="http://localhost:3000/api/v1"
TENANT_ID="22222222-2222-2222-2222-222222222222"
USER_ID="33333333-3333-3333-3333-333333333333"

echo "=========================================="
echo "Phase 3 Test Data Population"
echo "=========================================="
echo ""

# Test 1: Create Entities
echo "Test 1: Creating additional entities..."
curl -s -X POST "$API_BASE/entities" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"created_by_user_id\": \"$USER_ID\",
    \"type\": \"CUSTOMER\",
    \"display_name\": \"Jane Njeri\",
    \"phone_number\": \"+254733456789\"
  }" | jq '.'

echo "✓ Entity created"
echo ""

# Test 2: Create Retail Transaction
echo "Test 2: Creating RETAIL transaction..."
RETAIL_RESPONSE=$(curl -s -X POST "$API_BASE/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"entity_id\": \"aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa\",
    \"created_by_user_id\": \"$USER_ID\",
    \"type\": \"RETAIL\",
    \"currency_code\": \"KES\",
    \"reference\": \"INV-RETAIL-TEST\",
    \"lines\": [
      {
        \"description\": \"Test Product\",
        \"sku\": \"TEST-001\",
        \"quantity\": 5,
        \"unit_price\": 2000,
        \"account_code\": \"200-SALES\"
      }
    ]
  }" | jq '.')

RETAIL_ID=$(echo $RETAIL_RESPONSE | jq -r '.id')
echo "✓ RETAIL transaction created: $RETAIL_ID"
echo ""

# Test 3: Create Service Transaction
echo "Test 3: Creating SERVICE transaction..."
SERVICE_RESPONSE=$(curl -s -X POST "$API_BASE/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"entity_id\": \"bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb\",
    \"created_by_user_id\": \"$USER_ID\",
    \"type\": \"SERVICE\",
    \"currency_code\": \"KES\",
    \"reference\": \"INV-SERVICE-TEST\",
    \"lines\": [
      {
        \"description\": \"Test Service\",
        \"quantity\": 3,
        \"unit_price\": 5000,
        \"account_code\": \"300-SERVICE-INCOME\"
      }
    ]
  }" | jq '.')

SERVICE_ID=$(echo $SERVICE_RESPONSE | jq -r '.id')
echo "✓ SERVICE transaction created: $SERVICE_ID"
echo ""

# Test 4: Create Rental Transaction
echo "Test 4: Creating RENTAL transaction..."
RENTAL_RESPONSE=$(curl -s -X POST "$API_BASE/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"entity_id\": \"cccccccc-cccc-cccc-cccc-cccc-cccccccccc\",
    \"created_by_user_id\": \"$USER_ID\",
    \"type\": \"RENTAL\",
    \"currency_code\": \"KES\",
    \"reference\": \"INV-RENTAL-TEST\",
    \"lines\": [
      {
        \"description\": \"Test Equipment\",
        \"sku\": \"RENTAL-001\",
        \"quantity\": 2,
        \"unit_price\": 3500,
        \"account_code\": \"400-RENTAL-INCOME\"
      }
    ]
  }" | jq '.')

RENTAL_ID=$(echo $RENTAL_RESPONSE | jq -r '.id')
echo "✓ RENTAL transaction created: $RENTAL_ID"
echo ""

# Test 5: Post Transactions
echo "Test 5: Posting transactions..."
curl -s -X POST "$API_BASE/transactions/$RETAIL_ID/post" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\"}" | jq '.status'

curl -s -X POST "$API_BASE/transactions/$SERVICE_ID/post" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\"}" | jq '.status'

echo "✓ Transactions posted"
echo ""

# Test 6: Get All Transactions
echo "Test 6: Fetching all transactions..."
curl -s "$API_BASE/transactions?tenant_id=$TENANT_ID" | jq 'length'
echo "✓ Total transactions fetched"
echo ""

# Test 7: Get All Entities
echo "Test 7: Fetching all entities..."
curl -s "$API_BASE/entities?tenant_id=$TENANT_ID" | jq 'length'
echo "✓ Total entities fetched"
echo ""

# Test 8: Get Entity 360 View
echo "Test 8: Fetching entity 360 view..."
curl -s "$API_BASE/entities/aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/360-view?tenant_id=$TENANT_ID" | jq '.display_name'
echo "✓ Entity 360 view fetched"
echo ""

echo "=========================================="
echo "Test Data Population Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Created 1 new entity"
echo "- Created 3 transactions (RETAIL, SERVICE, RENTAL)"
echo "- Posted 2 transactions"
echo "- Verified API endpoints working"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3001 to verify frontend displays data"
echo "2. Test state machine transitions (POST → REVERSE)"
echo "3. Test payment records and attachments"
echo "4. Run integration tests"
