# Distributor Self-Service Portal with ERP Integration

## Project Overview
A Salesforce Experience Cloud portal enabling external distributor partners to submit and track order requests, with live order status fetched from an external ERP system via REST API integration.

---

## Business Scenario
A company sells products through a network of external distributor partners. These distributors are external companies — not internal employees. They need to submit order requests, track their order status in real time, and receive notifications when orders are resolved — all through a secure self-service portal without having internal Salesforce access.

---

## Week 1 Progress — Org Setup, Data Model, Security, Portal

### 1. Custom Objects Created

#### Distributor__c
Represents an external distributor partner company.

| Field | Type | Required |
|-------|------|----------|
| Distributor Name | Text (Record Name) | Yes |
| Contact Email | Email | Yes |
| Contact Phone | Phone | No |
| Status | Picklist (Active, Inactive, Suspended) | Yes |
| Region | Text (100) | No |

#### Order_Request__c
Core object of the entire project. Every LWC component, integration, and automation revolves around this object.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Order Request Number | Auto Number (ORD-{0000}) | Auto | Unique order identifier |
| Distributor | Lookup (Distributor__c) | Yes | Links order to distributor |
| Product Name | Text (255) | Yes | |
| Quantity | Number | Yes | |
| Total Amount | Currency | No | |
| Status | Picklist (New, In Review, Processing, Resolved, Cancelled) | Yes | Default: New |
| Description | Long Text Area | Yes | Distributor must explain the order |
| Order Date | Date | Yes | |
| External Order ID | Text (100) | No | Stores ERP system ID — backend only, never shown to distributor |

**Why Auto Number for Order Request?**
Gives every order a clean identifier like ORD-0001, ORD-0002 — mirrors how real enterprise systems work.

**Why External Order ID?**
When the nightly Batch Apex calls the external ERP, it needs to know which ERP record to ask about. MockAPI assigns its own ID to each order. This field stores that ID so the batch can call /orders/{id} and get the correct status back.

---

### 2. Security Model

#### OWD — Organisation Wide Defaults

| Object | Internal Access | External Access |
|--------|----------------|-----------------|
| Order_Request__c | Private | Private |
| Distributor__c | Private | Private |

**Why Private for Order_Request__c:**
Every distributor submits orders here. If OWD was Public, Distributor A could see Distributor B's orders, quantities, product names, and amounts — a complete data breach. Private ensures each distributor only sees records they own.

**Why Private for Distributor__c:**
Contains company details — contact email, phone, region. One distributor must never see another distributor's company profile.

**Why both Internal and External set to Private:**
Internal Private blocks internal Salesforce users from seeing records they do not own.
External Private blocks community portal users from seeing records they do not own.
Both are needed because the portal has external community users AND internal admin users managing the same objects.

OWD is the locked door. Sharing Sets are the selective keys. You can only open access up from OWD — never restrict below it.

---

#### Distributor Community User Profile
Cloned from Customer Community User — a license designed for external portal users with restricted access by default.

| Permission | Order Request | Distributor |
|------------|--------------|-------------|
| Read | Yes | Yes |
| Create | Yes | No |
| Edit | Yes | No |
| Delete | No | No |
| View All | No | No |
| Modify All | No | No |

Distributors can submit and track their own orders. They can view but not modify their company profile. They cannot delete orders — audit trail must be maintained.

---

#### Field Level Security — External Order ID
Read Access: No. Edit Access: No. Set on Distributor Community User profile.

**Defence in Depth — three layers protecting this field:**

1. UI Layer — field never added to the LWC order submission form
2. Platform Layer — FLS blocks read and write for community profile (applies to both UI and direct API calls)
3. Code Layer — Apex createOrder() never maps this field even if someone passes it in a raw API request

Any one layer is sufficient. All three together is production-quality security.

---

#### Permission Set — Distributor Portal Access
License: Customer Community. Object permissions mirror the profile currently.

Created as a scalable access management pattern. If specific distributors need additional access in future — assign a new Permission Set to only those users without touching the base profile for everyone. Profile is for all distributors. Permission Sets are for specific distributors.

---

### 3. Salesforce App and Navigation

- Custom tab for Distributor__c
- Custom tab for Order_Request__c
- Lightning App: Distributor Portal Admin — internal app for admins managing distributor orders

---

### 4. Experience Cloud Portal

| Setting | Value |
|---------|-------|
| Site Name | Distributor Portal |
| Template | Customer Account Portal |
| Status | Active |
| Self-Registration | Enabled |
| Profile auto-assigned on registration | Distributor Community User |

**Portal URL:**
```
https://orgfarm-cc9a5e60a6-dev-ed.develop.my.site.com/distributorportal
```

**Why Customer Account Portal template?**
Comes with built-in login, registration, home, and profile pages out of the box. Customisation effort is focused on the functional pages — order submission and order tracking — where the real business value is delivered through custom LWC components.

**Why self-registration?**
Distributors register themselves on the portal. Salesforce automatically creates their community user account and assigns the Distributor Community User profile. No admin manually creates accounts.

---

### 5. MockAPI — External ERP Simulation

**Endpoint:**
```
https://6a0d55b6769682b8ee75fc97.mockapi.io/api/v1/orders
```

**Test data:**
```json
[
  { "id": "1", "status": "Processing", "productName": "Industrial Pump A", "quantity": 50, "lastUpdated": "2026-05-19" },
  { "id": "2", "status": "In Review", "productName": "Control Valve B", "quantity": 120, "lastUpdated": "2026-05-19" },
  { "id": "3", "status": "Resolved", "productName": "Pressure Gauge C", "quantity": 30, "lastUpdated": "2026-05-19" }
]
```

---

## What is Coming Next
Week 2 — Sharing rules, sharing sets, guest user security
Week 3-4 — Custom LWC components
Week 5-8 — REST API integration, Platform Events, Batch Apex, test classes, final cleanup

*Built by Pragya Singh | Salesforce Developer | 2026*
