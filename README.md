# Internship & Placement Tracking System — Backend

Node.js + Express.js + Supabase (PostgreSQL) backend following MVC architecture.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin ops) |
| `JWT_SECRET` | Secret for signing JWTs |

## Database Setup

Run `schema.sql` in your Supabase SQL editor to create all tables.

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user (role: admin/student) |
| POST | `/api/auth/login` | Public | Login and receive JWT |

**Register body:**
```json
{ "email": "user@example.com", "password": "secret", "role": "admin" }
```

---

### Students
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/students` | Auth | Get all students |
| GET | `/api/students/:id` | Auth | Get student by ID |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |

**Create body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "branch": "CSE",
  "year": 3,
  "skills": ["JavaScript", "Python"],
  "resume_url": "https://example.com/resume.pdf"
}
```

---

### Companies
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/companies` | Auth | Get all companies |
| GET | `/api/companies/:id` | Auth | Get company by ID |
| POST | `/api/companies` | Admin | Create company |
| PUT | `/api/companies/:id` | Admin | Update company |
| DELETE | `/api/companies/:id` | Admin | Delete company |

---

### Internships
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/internships` | Auth | Get all internships |
| GET | `/api/internships/:id` | Auth | Get internship by ID |
| POST | `/api/internships` | Admin | Assign internship |
| PUT | `/api/internships/:id` | Admin | Update internship |
| DELETE | `/api/internships/:id` | Admin | Delete internship |

**Create body:**
```json
{
  "student_id": "uuid",
  "company_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "status": "ongoing"
}
```

---

### Placements
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/placements` | Auth | Get all placements |
| GET | `/api/placements/:id` | Auth | Get placement by ID |
| POST | `/api/placements` | Admin | Add placement |
| PUT | `/api/placements/:id` | Admin | Update placement |
| DELETE | `/api/placements/:id` | Admin | Delete placement |

---

### Search & Filter
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/search/students` | Auth | Filter students |

**Query params:** `branch`, `skills`, `placement_status`

```
GET /api/search/students?branch=CSE&skills=Python&placement_status=confirmed
```

---

### Reports (Admin only)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/reports` | Admin | Get full report |

**Response:**
```json
{
  "total_students": 120,
  "placed_students": 85,
  "internship_count": 60,
  "company_wise_placements": { "Google": 10, "Amazon": 8 }
}
```

---

### Dashboard (Admin only)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Admin | Aggregated stats + recent placements |

---

## Folder Structure

```
src/
├── config/
│   └── supabase.js
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── companyController.js
│   ├── internshipController.js
│   ├── placementController.js
│   ├── searchController.js
│   ├── reportController.js
│   └── dashboardController.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── companyRoutes.js
│   ├── internshipRoutes.js
│   ├── placementRoutes.js
│   ├── searchRoutes.js
│   ├── reportRoutes.js
│   └── dashboardRoutes.js
├── app.js
└── server.js
```

## Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```
