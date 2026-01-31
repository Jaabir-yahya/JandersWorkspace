#!/bin/bash

# Simple Test Data Population for Phase 3
# This script creates test data using the correct API format

set -e

API_URL="http://localhost:3000/api/v1"
TENANT_ID="00000000-0000-0000-0000-000000000001"

echo "=========================================="
echo "Phase 3 Simple Test Data Population"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Creating Entities${NC}"
echo "----------------------------------------"

# Create Customer 1
echo "Creating customer 1..."
RESPONSE=$(curl -s -X POST "$API_URL/entities" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"name\": \"John Kamau\",
        \"type\": \"CUSTOMER\",
        \"phone\": \"+254712345678\",
        \"email\": \"john@example.com\",
        \"address\": \"Nairobi, Kenya\",
        \"tax_id\": \"TAX-001\"
    }")
echo "Response: $RESPONSE"
CUSTOMER_1=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created customer: John Kamau ($CUSTOMER_1)"
echo ""

# Create Customer 2
echo "Creating customer 2..."
RESPONSE=$(curl -s -X POST "$API_URL/entities" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"name\": \"Mary Wanjiku\",
        \"type\": \"CUSTOMER\",
        \"phone\": \"+254723456789\",
        \"email\": \"mary@example.com\",
        \"address\": \"Mombasa, Kenya\",
        \"tax_id\": \"TAX-002\"
    }")
echo "Response: $RESPONSE"
CUSTOMER_2=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created customer: Mary Wanjiku ($CUSTOMER_2)"
echo ""

# Create Supplier 1
echo "Creating supplier 1..."
RESPONSE=$(curl -s -X POST "$API_URL/entities" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"name\": \"ABC Electronics Ltd\",
        \"type\": \"SUPPLIER\",
        \"phone\": \"+254745678901\",
        \"email\": \"sales@abcelectronics.com\",
        \"address\": \"Industrial Area, Nairobi\",
        \"tax_id\": \"TAX-003\"
    }")
echo "Response: $RESPONSE"
SUPPLIER_1=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created supplier: ABC Electronics Ltd ($SUPPLIER_1)"
echo ""

echo -e "${BLUE}Step 2: Creating RETAIL Transactions${NC}"
echo "----------------------------------------"

# Create RETAIL Transaction 1
echo "Creating RETAIL transaction 1..."
RESPONSE=$(curl -s -X POST "$API_URL/transactions" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"entity_id\": \"$CUSTOMER_1\",
        \"major\": \"RETAIL\",
        \"amount\": 15000,
        \"direction\": \"DEBIT\",
        \"currency\": \"KES\",
        \"transaction_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
        \"metadata\": {
            \"sku\": \"SKU-001\",
            \"quantity\": 5,
            \"unit_price\": 3000,
            \"product_name\": \"Laptop Stand\"
        }
    }")
echo "Response: $RESPONSE"
RETAIL_TXN_1=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created RETAIL transaction: Laptop Stand sale ($RETAIL_TXN_1)"
echo ""

# Create RETAIL Transaction 2
echo "Creating RETAIL transaction 2..."
RESPONSE=$(curl -s -X POST "$API_URL/transactions" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"entity_id\": \"$SUPPLIER_1\",
        \"major\": \"RETAIL\",
        \"amount\": 50000,
        \"direction\": \"CREDIT\",
        \"currency\": \"KES\",
        \"transaction_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
        \"metadata\": {
            \"sku\": \"SKU-002\",
            \"quantity\": 10,
            \"unit_price\": 5000,
            \"product_name\": \"Wireless Mouse\"
        }
    }")
echo "Response: $RESPONSE"
RETAIL_TXN_2=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created RETAIL transaction: Wireless Mouse purchase ($RETAIL_TXN_2)"
echo ""

echo -e "${BLUE}Step 3: Creating SERVICE Transactions${NC}"
echo "----------------------------------------"

# Create SERVICE Transaction 1
echo "Creating SERVICE transaction 1..."
RESPONSE=$(curl -s -X POST "$API_URL/transactions" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"entity_id\": \"$CUSTOMER_2\",
        \"major\": \"SERVICE\",
        \"amount\": 25000,
        \"direction\": \"DEBIT\",
        \"currency\": \"KES\",
        \"transaction_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
        \"metadata\": {
            \"service_type\": \"CONSULTING\",
            \"hours\": 10,
            \"hourly_rate\": 2500,
            \"description\": \"Business consulting services\"
        }
    }")
echo "Response: $RESPONSE"
SERVICE_TXN_1=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created SERVICE transaction: Consulting services ($SERVICE_TXN_1)"
echo ""

echo -e "${BLUE}Step 4: Creating RENTAL Transactions${NC}"
echo "----------------------------------------"

# Create RENTAL Transaction 1
echo "Creating RENTAL transaction 1..."
RESPONSE=$(curl -s -X POST "$API_URL/transactions" \
    -H "Content-Type: application/json" \
    -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"entity_id\": \"$CUSTOMER_1\",
        \"major\": \"RENTAL\",
        \"amount\": 12000,
        \"direction\": \"DEBIT\",
        \"currency\": \"KES\",
        \"transaction_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
        \"metadata\": {
            \"item_name\": \"Projector\",
            \"rental_period_days\": 7,
            \"daily_rate\": 1500,
            \"deposit\": 5000,
            \"return_date\": \"2026-02-05\"
        }
    }")
echo "Response: $RESPONSE"
RENTAL_TXN_1=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Created RENTAL transaction: Projector rental ($RENTAL_TXN_1)"
echo ""

echo -e "${BLUE}Step 5: Posting Transactions${NC}"
echo "----------------------------------------"

# Post RETAIL Transaction 1
if [ ! -z "$RETAIL_TXN_1" ]; then
    echo "Posting RETAIL transaction 1..."
    RESPONSE=$(curl -s -X POST "$API_URL/transactions/$RETAIL_TXN_1/post" \
        -H "Content-Type: application/json" \
        -d "{}")
    echo "Response: $RESPONSE"
    echo -e "${GREEN}✓${NC} Posted RETAIL transaction 1"
    echo ""
fi

# Post SERVICE Transaction 1
if [ ! -z "$SERVICE_TXN_1" ]; then
    echo "Posting SERVICE transaction 1..."
    RESPONSE=$(curl -s -X POST "$API_URL/transactions/$SERVICE_TXN_1/post" \
        -H "Content-Type: application/json" \
        -d "{}")
    echo "Response: $RESPONSE"
    echo -e "${GREEN}✓${NC} Posted SERVICE transaction 1"
    echo ""
fi

echo -e "${BLUE}Step 6: Creating Payment Records${NC}"
echo "----------------------------------------"

# Create Payment Record for RETAIL Transaction 1
if [ ! -z "$RETAIL_TXN_1" ]; then
    echo "Creating payment record for RETAIL transaction 1..."
    RESPONSE=$(curl -s -X POST "$API_URL/payment-records" \
        -H "Content-Type: application/json" \
        -d "{
            \"transaction_id\": \"$RETAIL_TXN_1\",
            \"method\": \"M-PESA\",
            \"amount\": 10000,
            \"reference\": \"MPESA-REF-001\",
            \"paid_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\"
        }")
    echo "Response: $RESPONSE"
    echo -e "${GREEN}✓${NC} Created payment record (M-PESA: KES 10,000)"
    echo ""
fi

# Create Payment Record for SERVICE Transaction 1
if [ ! -z "$SERVICE_TXN_1" ]; then
    echo "Creating payment record for SERVICE transaction 1..."
    RESPONSE=$(curl -s -X POST "$API_URL/payment-records" \
        -H "Content-Type: application/json" \
        -d "{
            \"transaction_id\": \"$SERVICE_TXN_1\",
            \"method\": \"BANK_TRANSFER\",
            \"amount\": 15000,
            \"reference\": \"BANK-REF-001\",
            \"paid_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\"
        }")
    echo "Response: $RESPONSE"
    echo -e "${GREEN}✓${NC} Created payment record (BANK: KES 15,000)"
    echo ""
fi

echo -e "${BLUE}Step 7: Verifying Data${NC}"
echo "----------------------------------------"

# Fetch all transactions
echo "Fetching all transactions..."
RESPONSE=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID")
echo "Response: $RESPONSE"
TOTAL_TXNS=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓${NC} Total transactions in system: $TOTAL_TXNS"
echo ""

# Fetch all entities
echo "Fetching all entities..."
RESPONSE=$(curl -s "$API_URL/entities?tenant_id=$TENANT_ID")
echo "Response: $RESPONSE"
TOTAL_ENTITIES=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓${NC} Total entities in system: $TOTAL_ENTITIES"
echo ""

# Fetch transactions by major
echo "Fetching RETAIL transactions..."
RESPONSE=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=RETAIL")
echo "Response: $RESPONSE"
RETAIL_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo "RETAIL transactions: $RETAIL_COUNT"
echo ""

echo "Fetching SERVICE transactions..."
RESPONSE=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=SERVICE")
echo "Response: $RESPONSE"
SERVICE_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo "SERVICE transactions: $SERVICE_COUNT"
echo ""

echo "Fetching RENTAL transactions..."
RESPONSE=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=RENTAL")
echo "Response: $RESPONSE"
RENTAL_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo "RENTAL transactions: $RENTAL_COUNT"
echo ""

echo ""
echo "=========================================="
echo -e "${GREEN}Test Data Population Complete!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Created 3 entities (2 customers, 1 supplier)"
echo "  - Created 4 transactions (2 RETAIL, 1 SERVICE, 1 RENTAL)"
echo "  - Posted 2 transactions"
echo "  - Created 2 payment records"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:3001 to verify frontend displays data"
echo "  2. Test state machine transitions (POST → REVERSE)"
echo "  3. Test filtering by major and status"
echo "  4. Test entity 360 view"
echo ""
