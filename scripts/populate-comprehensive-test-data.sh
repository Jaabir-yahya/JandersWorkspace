#!/bin/bash

# Comprehensive Test Data Population for Phase 3
# This script creates realistic test data for all three majors

set -e

API_URL="http://localhost:3000/api/v1"
TENANT_ID="00000000-0000-0000-0000-000000000001"

echo "=========================================="
echo "Phase 3 Comprehensive Test Data Population"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to create entity
create_entity() {
    local name="$1"
    local type="$2"
    local phone="$3"
    local email="$4"
    
    response=$(curl -s -X POST "$API_URL/entities" \
        -H "Content-Type: application/json" \
        -d "{
            \"tenant_id\": \"$TENANT_ID\",
            \"name\": \"$name\",
            \"type\": \"$type\",
            \"phone\": \"$phone\",
            \"email\": \"$email\",
            \"address\": \"Test Address\",
            \"tax_id\": \"TAX-$RANDOM\"
        }")
    
    entity_id=$(echo $response | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "$entity_id"
}

# Helper function to create transaction
create_transaction() {
    local entity_id="$1"
    local major="$2"
    local amount="$3"
    local direction="$4"
    local metadata="$5"
    
    response=$(curl -s -X POST "$API_URL/transactions" \
        -H "Content-Type: application/json" \
        -d "{
            \"tenant_id\": \"$TENANT_ID\",
            \"entity_id\": \"$entity_id\",
            \"major\": \"$major\",
            \"amount\": $amount,
            \"direction\": \"$direction\",
            \"currency\": \"KES\",
            \"transaction_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
            \"metadata\": $metadata
        }")
    
    txn_id=$(echo $response | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "$txn_id"
}

# Helper function to post transaction
post_transaction() {
    local txn_id="$1"
    
    response=$(curl -s -X POST "$API_URL/transactions/$txn_id/post" \
        -H "Content-Type: application/json" \
        -d "{}")
    
    echo "$response"
}

# Helper function to create payment record
create_payment() {
    local txn_id="$1"
    local amount="$2"
    local method="$3"
    local reference="$4"
    
    response=$(curl -s -X POST "$API_URL/payment-records" \
        -H "Content-Type: application/json" \
        -d "{
            \"tenant_id\": \"$TENANT_ID\",
            \"transaction_id\": \"$txn_id\",
            \"amount\": $amount,
            \"payment_method\": \"$method\",
            \"payment_date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",
            \"reference\": \"$reference\",
            \"status\": \"COMPLETED\"
        }")
    
    echo "$response"
}

echo -e "${BLUE}Step 1: Creating Entities${NC}"
echo "----------------------------------------"

# Create Customers
echo "Creating customers..."
CUSTOMER_1=$(create_entity "John Kamau" "CUSTOMER" "+254712345678" "john@example.com")
echo -e "${GREEN}✓${NC} Created customer: John Kamau ($CUSTOMER_1)"

CUSTOMER_2=$(create_entity "Mary Wanjiku" "CUSTOMER" "+254723456789" "mary@example.com")
echo -e "${GREEN}✓${NC} Created customer: Mary Wanjiku ($CUSTOMER_2)"

CUSTOMER_3=$(create_entity "Peter Ochieng" "CUSTOMER" "+254734567890" "peter@example.com")
echo -e "${GREEN}✓${NC} Created customer: Peter Ochieng ($CUSTOMER_3)"

# Create Suppliers
echo "Creating suppliers..."
SUPPLIER_1=$(create_entity "ABC Electronics Ltd" "SUPPLIER" "+254745678901" "sales@abcelectronics.com")
echo -e "${GREEN}✓${NC} Created supplier: ABC Electronics Ltd ($SUPPLIER_1)"

SUPPLIER_2=$(create_entity "Global Services Inc" "SUPPLIER" "+254756789012" "info@globalservices.com")
echo -e "${GREEN}✓${NC} Created supplier: Global Services Inc ($SUPPLIER_2)"

echo ""
echo -e "${BLUE}Step 2: Creating RETAIL Transactions${NC}"
echo "----------------------------------------"

# Retail Transaction 1 - Sale
RETAIL_TXN_1=$(create_transaction "$CUSTOMER_1" "RETAIL" 15000 "DEBIT" '{"sku": "SKU-001", "quantity": 5, "unit_price": 3000, "product_name": "Laptop Stand"}')
echo -e "${GREEN}✓${NC} Created RETAIL transaction: Laptop Stand sale ($RETAIL_TXN_1)"

# Retail Transaction 2 - Purchase
RETAIL_TXN_2=$(create_transaction "$SUPPLIER_1" "RETAIL" 50000 "CREDIT" '{"sku": "SKU-002", "quantity": 10, "unit_price": 5000, "product_name": "Wireless Mouse"}')
echo -e "${GREEN}✓${NC} Created RETAIL transaction: Wireless Mouse purchase ($RETAIL_TXN_2)"

# Retail Transaction 3 - Sale
RETAIL_TXN_3=$(create_transaction "$CUSTOMER_2" "RETAIL" 8500 "DEBIT" '{"sku": "SKU-003", "quantity": 2, "unit_price": 4250, "product_name": "USB-C Hub"}')
echo -e "${GREEN}✓${NC} Created RETAIL transaction: USB-C Hub sale ($RETAIL_TXN_3)"

echo ""
echo -e "${BLUE}Step 3: Creating SERVICE Transactions${NC}"
echo "----------------------------------------"

# Service Transaction 1 - Service rendered
SERVICE_TXN_1=$(create_transaction "$CUSTOMER_1" "SERVICE" 25000 "DEBIT" '{"service_type": "CONSULTING", "hours": 10, "hourly_rate": 2500, "description": "Business consulting services"}')
echo -e "${GREEN}✓${NC} Created SERVICE transaction: Consulting services ($SERVICE_TXN_1)"

# Service Transaction 2 - Service received
SERVICE_TXN_2=$(create_transaction "$SUPPLIER_2" "SERVICE" 15000 "CREDIT" '{"service_type": "MAINTENANCE", "hours": 5, "hourly_rate": 3000, "description": "IT maintenance services"}')
echo -e "${GREEN}✓${NC} Created SERVICE transaction: IT maintenance ($SERVICE_TXN_2)"

# Service Transaction 3 - Service rendered
SERVICE_TXN_3=$(create_transaction "$CUSTOMER_3" "SERVICE" 18000 "DEBIT" '{"service_type": "TRAINING", "hours": 6, "hourly_rate": 3000, "description": "Staff training program"}')
echo -e "${GREEN}✓${NC} Created SERVICE transaction: Staff training ($SERVICE_TXN_3)"

echo ""
echo -e "${BLUE}Step 4: Creating RENTAL Transactions${NC}"
echo "----------------------------------------"

# Rental Transaction 1 - Equipment rental
RENTAL_TXN_1=$(create_transaction "$CUSTOMER_2" "RENTAL" 12000 "DEBIT" '{"item_name": "Projector", "rental_period_days": 7, "daily_rate": 1500, "deposit": 5000, "return_date": "2026-02-05"}')
echo -e "${GREEN}✓${NC} Created RENTAL transaction: Projector rental ($RENTAL_TXN_1)"

# Rental Transaction 2 - Equipment rental
RENTAL_TXN_2=$(create_transaction "$CUSTOMER_3" "RENTAL" 8000 "DEBIT" '{"item_name": "Camera Kit", "rental_period_days": 4, "daily_rate": 2000, "deposit": 3000, "return_date": "2026-02-02"}')
echo -e "${GREEN}✓${NC} Created RENTAL transaction: Camera Kit rental ($RENTAL_TXN_2)"

# Rental Transaction 3 - Equipment rental
RENTAL_TXN_3=$(create_transaction "$CUSTOMER_1" "RENTAL" 15000 "DEBIT" '{"item_name": "Sound System", "rental_period_days": 5, "daily_rate": 3000, "deposit": 6000, "return_date": "2026-02-03"}')
echo -e "${GREEN}✓${NC} Created RENTAL transaction: Sound System rental ($RENTAL_TXN_3)"

echo ""
echo -e "${BLUE}Step 5: Posting Transactions${NC}"
echo "----------------------------------------"

# Post some transactions
post_transaction "$RETAIL_TXN_1"
echo -e "${GREEN}✓${NC} Posted RETAIL transaction 1"

post_transaction "$RETAIL_TXN_2"
echo -e "${GREEN}✓${NC} Posted RETAIL transaction 2"

post_transaction "$SERVICE_TXN_1"
echo -e "${GREEN}✓${NC} Posted SERVICE transaction 1"

post_transaction "$RENTAL_TXN_1"
echo -e "${GREEN}✓${NC} Posted RENTAL transaction 1"

echo ""
echo -e "${BLUE}Step 6: Creating Payment Records${NC}"
echo "----------------------------------------"

# Create payment records
create_payment "$RETAIL_TXN_1" 10000 "MPESA" "MPESA-REF-001"
echo -e "${GREEN}✓${NC} Created payment record for RETAIL txn 1 (MPESA: KES 10,000)"

create_payment "$RETAIL_TXN_1" 5000 "CASH" "CASH-REF-001"
echo -e "${GREEN}✓${NC} Created payment record for RETAIL txn 1 (CASH: KES 5,000)"

create_payment "$SERVICE_TXN_1" 15000 "BANK_TRANSFER" "BANK-REF-001"
echo -e "${GREEN}✓${NC} Created payment record for SERVICE txn 1 (BANK: KES 15,000)"

create_payment "$RENTAL_TXN_1" 12000 "MPESA" "MPESA-REF-002"
echo -e "${GREEN}✓${NC} Created payment record for RENTAL txn 1 (MPESA: KES 12,000)"

echo ""
echo -e "${BLUE}Step 7: Verifying Data${NC}"
echo "----------------------------------------"

# Fetch all transactions
TOTAL_TXNS=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓${NC} Total transactions in system: $TOTAL_TXNS"

# Fetch all entities
TOTAL_ENTITIES=$(curl -s "$API_URL/entities?tenant_id=$TENANT_ID" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓${NC} Total entities in system: $TOTAL_ENTITIES"

# Fetch transactions by major
RETAIL_COUNT=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=RETAIL" | grep -o '"id"' | wc -l)
SERVICE_COUNT=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=SERVICE" | grep -o '"id"' | wc -l)
RENTAL_COUNT=$(curl -s "$API_URL/transactions?tenant_id=$TENANT_ID&major=RENTAL" | grep -o '"id"' | wc -l)

echo ""
echo "Transaction Summary by Major:"
echo "  - RETAIL: $RETAIL_COUNT transactions"
echo "  - SERVICE: $SERVICE_COUNT transactions"
echo "  - RENTAL: $RENTAL_COUNT transactions"

echo ""
echo "=========================================="
echo -e "${GREEN}Test Data Population Complete!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Created 5 entities (3 customers, 2 suppliers)"
echo "  - Created 9 transactions (3 RETAIL, 3 SERVICE, 3 RENTAL)"
echo "  - Posted 4 transactions"
echo "  - Created 4 payment records"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:3001 to verify frontend displays data"
echo "  2. Test state machine transitions (POST → REVERSE)"
echo "  3. Test filtering by major and status"
echo "  4. Test entity 360 view"
echo ""
