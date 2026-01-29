# ToolJet Setup Guide for Project Bridge

## Overview
This guide walks you through building the 3-page Admin Portal in ToolJet to connect to your Project Bridge API.

**Prerequisites:**
- API deployed and running (e.g., `https://api.projectbridge.com`)
- ToolJet Cloud account (or self-hosted)
- Test tenant_id and user_id for testing

---

## Step 1: Create Data Source

1. **Open ToolJet** → Go to **Data Sources**
2. **Add New Data Source** → Select **REST API**
3. **Configure:**
   - **Name:** `Project Bridge API`
   - **Base URL:** `https://your-api-url.com` (your deployed API)
   - **Headers:**
     - `Content-Type`: `application/json`
   - **Authentication:** None (for now - we'll add JWT later)

4. **Test Connection:**
   - Click **Test Connection**
   - Should return success if API is live

---

## Step 2: Create App "Project Bridge Admin"

1. **Create New App**
2. **Name:** `Project Bridge Admin`
3. **Icon:** Pick a notebook or ledger icon

---

## Page 1: The Feed (The Notebook)

### Purpose
Show all transactions in a table - the main dashboard.

### Setup

#### 1. Add Page
- Click **+** next to Pages
- **Name:** `Feed`
- **Icon:** Table/List icon

#### 2. Add Query (GET Transactions)

**Query Name:** `getTransactions`

**Configuration:**
```
Method: GET
URL: /transactions
Params:
  - tenant_id: {{globals.currentUser.tenant_id || "your-test-tenant-id"}}
  - status: {{components.statusFilter.value}}
  - type: {{components.typeFilter.value}}
  - date_from: {{components.dateFrom.value}}
  - date_to: {{components.dateTo.value}}
  - search: {{components.searchInput.value}}
```

**Transform (optional):**
```javascript
return data.map(t => ({
  ...t,
  amount_formatted: `${t.currency_code} ${t.total_amount.toLocaleString()}`,
  status_color: t.status === 'POSTED' ? 'green' : t.status === 'DRAFT' ? 'orange' : 'blue'
}));
```

#### 3. Add Components

**A. Header Text**
- **Component:** Text
- **Value:** `# The Feed`
- **Size:** Large

**B. Search Input**
- **Component:** Text Input
- **Placeholder:** `Search by customer, reference, or SKU...`
- **Name:** `searchInput`
- **Events:** On Change → Run Query `getTransactions`

**C. Filters Row**
Add 4 dropdowns side by side:

| Component | Name | Options | Label |
|-----------|------|---------|-------|
| Dropdown | `statusFilter` | All, DRAFT, POSTED, RECONCILED | Status |
| Dropdown | `typeFilter` | All, RETAIL, SERVICE, RENTAL | Type |
| Date Picker | `dateFrom` | - | From |
| Date Picker | `dateTo` | - | To |

**Events:** On Change for each → Run Query `getTransactions`

**D. Transactions Table**
- **Component:** Table
- **Data:** `{{queries.getTransactions.data}}`
- **Columns:**

| Column | Key | Format |
|--------|-----|--------|
| Date | transaction_date | Date (MMM DD, YYYY) |
| Customer | entities.display_name | Text |
| Type | type | Badge (color-coded) |
| Amount | amount_formatted | Text |
| Status | status | Badge (DRAFT=orange, POSTED=green, RECONCILED=blue) |
| Reference | reference | Text |

**Row Click Event:**
- Action: `Set Local Storage`
- Key: `selectedTransactionId`
- Value: `{{components.table1.selectedRow.id}}`
- Then: Navigate to Page `Transaction Detail` (we'll create this)

**E. "This Week" Quick Filter Button**
- **Component:** Button
- **Label:** `This Week`
- **Events:** On Click →
  - Set `dateFrom` to `{{moment().startOf('week').format('YYYY-MM-DD')}}`
  - Set `dateTo` to `{{moment().endOf('week').format('YYYY-MM-DD')}}`
  - Run Query `getTransactions`

---

## Page 2: The Writer (Entry Form)

### Purpose
Create new transactions - the data entry form.

### Setup

#### 1. Add Page
- **Name:** `Writer`
- **Icon:** Plus/Add icon

#### 2. Add Query (GET Entities for Dropdown)

**Query Name:** `getEntities`
```
Method: GET
URL: /entities
Params:
  - tenant_id: {{globals.currentUser.tenant_id || "your-test-tenant-id"}}
```

#### 3. Add Query (POST Create Transaction)

**Query Name:** `createTransaction`
```
Method: POST
URL: /transactions
Body:
{
  "tenant_id": "{{globals.currentUser.tenant_id || 'your-test-tenant-id'}}",
  "created_by_user_id": "{{globals.currentUser.id || 'your-test-user-id'}}",
  "entity_id": "{{components.customerSelect.value}}",
  "type": "{{components.typeSelect.value}}",
  "currency_code": "KES",
  "transaction_date": "{{components.dateInput.value}}",
  "reference": "{{components.referenceInput.value}}",
  "lines": {{components.lineItemsList.data}}
}
```

**Events:** On Success →
- Show Alert: "Transaction saved as DRAFT"
- Clear Form
- Navigate to Page `Feed`

#### 4. Add Components

**A. Header**
- **Text:** `# New Entry`

**B. Customer Select**
- **Component:** Dropdown
- **Name:** `customerSelect`
- **Label:** `Customer`
- **Options:** `{{queries.getEntities.data.map(e => ({label: e.display_name, value: e.id}))}}`
- **Placeholder:** `Select customer...`

**C. Type Select**
- **Component:** Dropdown
- **Name:** `typeSelect`
- **Label:** `Transaction Type`
- **Options:**
  - Retail
  - Service
  - Rental
- **Events:** On Change → Show/Hide SKU field

**D. Date Input**
- **Component:** Date Picker
- **Name:** `dateInput`
- **Label:** `Date`
- **Default:** `{{moment().format('YYYY-MM-DD')}}`

**E. Reference Input**
- **Component:** Text Input
- **Name:** `referenceInput`
- **Label:** `Reference (Optional)`
- **Placeholder:** `e.g., INV-001`

**F. Line Items Section**

**Container Header:** `Line Items`

**Line Items List (Repeater):**
- **Component:** List
- **Name:** `lineItemsList`
- **Data:** Array of objects

**Inside Each List Item:**
| Component | Name | Properties |
|-----------|------|------------|
| Text Input | `description_{{$index}}` | Label: Description, Required |
| Number Input | `quantity_{{$index}}` | Label: Qty, Default: 1 |
| Number Input | `unitPrice_{{$index}}` | Label: Unit Price |
| Text Input | `sku_{{$index}}` | Label: SKU, Hidden if type !== 'RETAIL' |
| Text Input | `accountCode_{{$index}}` | Label: Account Code, Default: 200-SALES |
| Button | `removeLine_{{$index}}` | Label: X, Style: Danger |

**Add Line Button:**
- **Component:** Button
- **Label:** `+ Add Line Item`
- **Events:** On Click →
  - Append to `lineItemsList.data`: `{description: '', quantity: 1, unit_price: 0, sku: '', account_code: '200-SALES'}`

**G. Total Display**
- **Component:** Text
- **Value:** `Total: KES {{components.lineItemsList.data.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0).toLocaleString()}}`
- **Style:** Large, Bold

**H. Save Button**
- **Component:** Button
- **Label:** `Save as Draft`
- **Style:** Primary, Full Width
- **Events:** On Click → Run Query `createTransaction`

---

## Page 3: The Manager (State Machine)

### Purpose
Manage DRAFT transactions - Post or Reverse them.

### Setup

#### 1. Add Page
- **Name:** `Manager`
- **Icon:** Settings/Gear icon

#### 2. Add Query (GET Draft Transactions)

**Query Name:** `getDraftTransactions`
```
Method: GET
URL: /transactions
Params:
  - tenant_id: {{globals.currentUser.tenant_id || "your-test-tenant-id"}}
  - status: DRAFT
```

#### 3. Add Query (POST Transaction)

**Query Name:** `postTransaction`
```
Method: POST
URL: /transactions/{{components.draftsTable.selectedRow.id}}/post
Body:
{
  "user_id": "{{globals.currentUser.id || 'your-test-user-id'}}"
}
```

**Events:** On Success →
- Show Alert: "Transaction POSTED successfully"
- Run Query `getDraftTransactions`

#### 4. Add Query (REVERSE Transaction)

**Query Name:** `reverseTransaction`
```
Method: POST
URL: /transactions/{{components.draftsTable.selectedRow.id}}/reverse
Body:
{
  "created_by_user_id": "{{globals.currentUser.id || 'your-test-user-id'}}",
  "reason": "{{components.reverseReason.value}}"
}
```

#### 5. Add Components

**A. Header**
- **Text:** `# Manager`
- **Subtext:** `Review and finalize draft transactions`

**B. Drafts Table**
- **Component:** Table
- **Data:** `{{queries.getDraftTransactions.data}}`
- **Columns:** Date, Customer, Type, Amount, Reference
- **Row Selection:** Single select

**C. Selected Transaction Detail Card**
- **Component:** Container
- **Visible When:** `{{components.draftsTable.selectedRow.id}}`

**Inside Card:**
| Component | Value |
|-----------|-------|
| Text (Label) | Selected Transaction |
| Text | Customer: {{components.draftsTable.selectedRow.entities.display_name}} |
| Text | Amount: {{components.draftsTable.selectedRow.total_amount}} |
| Text | Lines: {{components.draftsTable.selectedRow.lines.length}} items |

**D. Post Button**
- **Component:** Button
- **Label:** `✓ Post Transaction`
- **Style:** Success (Green)
- **Confirmation:** `Are you sure? This will lock the transaction permanently.`
- **Events:** On Click → Run Query `postTransaction`

**E. Reverse Button**
- **Component:** Button
- **Label:** `✕ Reverse (Cancel)`
- **Style:** Danger (Red)

**F. Reverse Reason Modal**
- **Component:** Modal
- **Title:** `Reverse Transaction`
- **Trigger:** Click Reverse Button

**Inside Modal:**
- Text: `Reason for reversal:`
- Text Area: `reverseReason` (Required)
- Button: `Confirm Reverse` → Run Query `reverseTransaction`

**G. Refresh Button**
- **Component:** Button
- **Label:** `↻ Refresh`
- **Style:** Secondary
- **Events:** On Click → Run Query `getDraftTransactions`

---

## Bonus: Transaction Detail Page (Optional)

### Purpose
Show full details when clicking a transaction in Feed.

### Setup

#### 1. Add Page
- **Name:** `Transaction Detail`
- **Hidden:** true (navigated programmatically)

#### 2. Add Query

**Query Name:** `getTransactionDetail`
```
Method: GET
URL: /transactions/{{localStorage.getItem('selectedTransactionId')}}
Run on Page Load: true
```

#### 3. Add Components

- Header: Transaction #{{queries.getTransactionDetail.data.reference}}
- Detail Cards showing all fields
- Lines Table showing all line items
- Export Button: Link to `{{apiUrl}}/transactions/{{id}}/export`

---

## Step 3: Configure Navigation

1. **App Menu** (Left sidebar)
   - Feed
   - Writer
   - Manager

2. **Home Page:** Set `Feed` as default page

---

## Step 4: Test the Loop

### Test Case 1: Create → View
1. Go to **Writer**
2. Fill form, add line items
3. Click **Save as Draft**
4. Should redirect to **Feed**
5. See new transaction with status `DRAFT`

### Test Case 2: Post → Immutable
1. Go to **Manager**
2. Select a DRAFT transaction
3. Click **Post**
4. Confirm
5. Should disappear from Manager (no longer DRAFT)
6. Go to **Feed** → Status should be `POSTED`

### Test Case 3: Search
1. Go to **Feed**
2. Type in search box
3. Should filter by customer name, reference, or SKU

---

## Troubleshooting

### "Cannot connect to API"
- Check API URL in Data Source
- Verify CORS is enabled on API
- Check API is deployed and running

### "No data showing"
- Check tenant_id is correct
- Check browser console for errors
- Verify query returns data in Query Preview

### "Form not submitting"
- Check all required fields are filled
- Check browser console for validation errors
- Verify JSON body format in query

---

## Next Steps After Setup

1. **Style it:** Add your brand colors, logo
2. **Add Users:** Invite your 3 test users
3. **Mobile Test:** Open ToolJet on phone, verify usability
4. **Dogfood:** Use it yourself for 7 days
5. **Gather Feedback:** What do users struggle with?

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transactions` | GET | List transactions |
| `/transactions` | POST | Create transaction |
| `/transactions/{id}` | GET | Get single transaction |
| `/transactions/{id}/post` | POST | Post transaction |
| `/transactions/{id}/reverse` | POST | Reverse transaction |
| `/transactions/{id}/export` | GET | Export to Universal Invoice |
| `/entities` | GET | List customers |
| `/entities/{id}/history` | GET | Customer history |

---

**You're ready to build! Start with Page 1 (Feed) and work your way through.**
