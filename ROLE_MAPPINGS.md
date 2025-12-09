# Role Name Mappings - Updated

## Current Role Configuration

### Frontend Display Names (User-Facing)
These are what users see in the UI:

1. **Defence Personnel** - Active military service members
2. **Family Member / Dependent** - Family members of defence personnel
3. **Veteran / Retired Officer** - Retired military personnel
4. **CERT Analyst** - Computer Emergency Response Team analysts
5. **Admin / MoD Authority** - System administrators and Ministry of Defence officials

### Backend Role Keys (Database/API)
These are the internal identifiers used in the database and API:

| Display Name | Backend Key | Route Path |
|-------------|-------------|------------|
| Defence Personnel | `officer` | `/dashboard/officer` |
| Family Member / Dependent | `staff` | `/dashboard/staff` |
| Veteran / Retired Officer | `analyst` | `/dashboard/analyst` |
| CERT Analyst | `guest` | `/dashboard/guest` |
| Admin / MoD Authority | `admin` | `/dashboard/admin` |

### Role-Specific Features

#### Defence Personnel (`officer`)
- Personnel Records
- Service Details
- Leave Management
- Training & Assignments
- Access to defence operations and personnel resources

#### Family Member / Dependent (`staff`)
- Family Benefits
- Medical Services
- Education Support
- Welfare Programs
- Family services, benefits, and dependent support portal

#### Veteran / Retired Officer (`analyst`)
- Pension Management
- Medical Facilities
- Veteran Services
- Retirement Benefits
- Veteran affairs, pension management, and retirement services

#### CERT Analyst (`guest`)
- Threat Analysis
- Incident Reports
- Security Monitoring
- CERT Operations
- CERT operations, threat analysis, and security intelligence

#### Admin / MoD Authority (`admin`)
- User Management
- System Configuration
- Access Control
- Audit & Compliance
- System administration, user management, and MoD authority controls

## Dashboard Redirect Structure

### Regular Users (To be implemented)
- Defence Personnel (`officer`)
- Family Member / Dependent (`staff`)
- Veteran / Retired Officer (`analyst`)

**Redirect Path:** TBD by user

### Privileged Users (To be implemented)
- CERT Analyst (`guest`)
- Admin / MoD Authority (`admin`)

**Redirect Path:** TBD by user

## Files Updated

1. **src/lib/roleConfig.ts** - Updated `roleOptions` labels
2. **src/pages/Dashboard.tsx** - Updated `getRoleName()`, `getRoleDescription()`, and Quick Actions
3. **Backend remains unchanged** - Uses enum values: `['officer', 'staff', 'analyst', 'admin', 'guest']`

## Notes

- Frontend displays user-friendly names
- Backend uses short enum keys for consistency
- All role validations use backend keys
- MongoDB schema enum: `['officer', 'staff', 'analyst', 'admin', 'guest']`
- JWT tokens contain backend role keys
- Middleware uses backend role keys for authorization
