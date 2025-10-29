# Development Workflow & Feature Requirements

## Core Features Required

### Authentication & Account Management
- Coordinator accounts (can create other coordinators)
- Student accounts (no self-registration)
- Bulk import via CSV
- Temporary password system
- Password reset functionality
- Audit logging

### Eligibility Engine Rules
```
Company Categories:
- Elite: CTC >= 18 LPA
- Super Dream: 9 LPA <= CTC < 18 LPA
- Dream: 6 LPA <= CTC < 9 LPA

Demerit System:
- 2 demerits → block next 1 company
- 4 demerits → block next 3 companies
- 6 demerits → block next 5 companies

Offer Jump Policy:
- New CTC must be >= (current_offer + 5 LPA)
- Max 3 attempts for category jumps
- No CGPA rounding
```

### Student Dashboard Features
- Profile management
- Resume upload (multiple versions)
- Company listings with eligibility badges
- Real-time eligibility checker
- Application tracking
- Notifications center

### Coordinator Dashboard Features
- Student management (search, filter)
- Company management
- Application management
- Training/attendance tracking
- Analytics & reports
- Bulk operations

## Technical Stack
- Next.js 14 + TypeScript + App Router
- PostgreSQL + Prisma
- JWT Authentication
- Zod validation
- Tailwind CSS
- Cloudinary/S3 for file uploads
- NodeMailer for emails

## File Structure
```
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   └── auth/
├── components/
├── lib/
│   ├── auth/
│   ├── eligibility/
│   └── prisma/
└── types/
```