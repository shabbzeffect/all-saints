# Data Request → Prisma Model Map

Maps each item in `docs/operations/data-request-to-school.md` to the Prisma models and fields in `prisma/schema.prisma` that consume it. Use this when validating the import mapping.

## Wave 1 — Samples, volumes & governance

| Requested item | Model(s) / field(s) | Notes |
|---|---|---|
| Learner register sample | `Student`, `Institution` | Master data; validate duplicates on admission no. (admission no. is not yet a field — kept as `Student.firstName/lastName` + grade link; see Gaps below) |
| Fee balances sample | `Invoice` (`amountRemaining`, `status`), `InvoiceLine`, `Payment`, `Receipt` | Used to set opening balances and `Invoice.status` directly |
| Volumes (learners, staff, …) | `Institution` settings JSON + `@@map` tables | Used for capacity/load testing, not stored as a column |
| Unique identifiers | `Student` (admission no. — gap), `Staff.userId`/`User`, `Guardian.idNumber`, `KPSEARegistration.registrationNumber`, `KJSEARegistration.registrationNumber` | Admission no. has no field — see Gaps |
| ODPC / consent authority | `ConsentPreference`, `Document` | `ConsentPreference.purpose/channel/source/evidence` |
| Go-live / roles | `User`, `Role`, `Permission`, `UserRole`, `InstitutionMembership`, `StaffRole` | Seed roles: SCHOOL_PRINCIPAL, SCHOOL_TEACHER, etc. |

## Wave 2 — Master data

### Institution & legal identity

| Item | Model / field | Notes |
|---|---|---|
| School name, parish name, type | `Institution.name`, `Institution.type` (`SCHOOL`/`PARISH`), `Institution.slug` | Two institutions, one DB; wing via `User.wing` / module `wing` fields |
| KRA PIN, KNEC/EMIS/NEMIS codes | `Institution.settings` (JSON) | No dedicated columns today |
| Address, city, county, phone, email, website | `Institution.address`, `city`, `county`, `phone`, `email`, `website` | Country defaults `KE`, timezone `Africa/Nairobi`, currency `KES` |
| Logo | `Institution.logoUrl` | Also `Document` for originals |
| Bank/paybill details | `Institution.settings` (JSON) | No dedicated columns; store as settings |
| Brand | Tailwind tokens (`tailwind.config.ts`), not the DB | |
| Board of Management contacts | `Institution.settings` or `Contact` via `Ticket`/`Document` | No dedicated model |

### Academic structure & calendar

| Item | Model / field | Notes |
|---|---|---|
| Academic year dates, term count | `AcademicYear` (`name`, `startDate`, `endDate`, `termCount`, `status`) | `termCount` defaults 3 (Kenya) |
| Term dates, current term | `Term` (`academicYearId`, `name`, `ordinal`, `startDate`, `endDate`, `isCurrent`) | Unique on `[academicYearId, ordinal]` |
| Grades (PP1–Grade 9/Form 4), capacity, room, class teacher | `Grade` (`name`, `level`, `formTeacher`, `roomNumber`, `capacity`, `currentStudentCount`, `academicYearId`) | `@@unique([institutionId, name])` |
| Streams | `StreamEntry` (`gradeId` (unique), `name`, `level`, `capacity`, `currentStudentCount`) | One stream per grade row today (`gradeId @unique`) |
| Class teacher assignment | `Grade.formTeacher` (string) **or** `User` via `TimetableLine.teacherId` | Form teacher is free text, not an FK — gap |
| Calendar events | `SchoolCalendarEvent` (`termId?`, `title`, `startDate`, `endDate`) | Include open days/exams/parents' meetings |
| Enrolment counts per grade | derived from `Student.gradeId` / `Enrolment` | |

### Learners

| Item | Model / field | Notes |
|---|---|---|
| Identity & demographics | `Student` (`firstName`, `lastName`, `gradeId`, `status`) — demographics (DOB, gender, NEMIS no., birth cert no., nationality, address) have **no columns** | See Gaps — `Student` is minimal by design; a learner profile is assembled from `User` + `Admission`/`Enrolment`/`StudentGuardian` |
| Admission / grade / status | `Student.gradeId`, `Student.status` (`StudentStatus`) | `ACTIVE/INACTIVE/GRADUATED/SUSPENDED/WITHDRAWN/ON_LEAVE` |
| Date of admission | `Enrolment.enrolledAt` + `Admission` | Admission pipeline in `Admission` |
| Day/boarding status | `Student.gradeId` + `RoomAssignment` / `RouteAssignment` | No boolean on `Student`; boarding via `RoomAssignment.isCurrent`, transport via `RouteAssignment.isCurrent` |
| Previous school | `Admission.currentSchool` | |
| Sibling links | `StudentGuardian` shared guardian ↔ `Student` | Sibling = same guardian |
| Medical info | `ConsentPreference` (medical consent) + free text — **no dedicated model** | See Gaps; consider `Document` uploads |
| Passport photo | `Staff.photoUrl` exists for staff; students — via `Document` or `User.avatarUrl` if linked | `Student.userId` → `User.avatarUrl` |
| KPSEA/KJSEA registration | `KPSEARegistration`, `KJSEARegistration` (`registrationNumber`, `entryYear`, `targetSecondarySchool`, `performanceIndex`) | Grade 6 / Grade 9 only |
| Promotion history | `Promotion`, `PromotionStudent` (`gradeFrom`, `gradeTo`, `studentTargetGrade`) | |

### Guardians / parents

| Item | Model / field | Notes |
|---|---|---|
| Name, phone, ID, occupation, employer, email | `Guardian` (`firstName`, `lastName`, `otherNames`, `relationship`, `phone`, `idNumber`, `idNumberVerified`, `occupation`, `employer`, `email`) | `relationship` = `FATHER/MOTHER/GUARDIAN/GRANDPARENT/AUNT/UNCLE/OTHER` |
| Custodial vs fee payer | `Guardian.primaryPayer`, `StudentGuardian.primaryPayer` | Fee payer tracked per link |
| Pickup authorisation | `Guardian.pickupAuthorised`, `StudentGuardian.canPickUp` | |
| Primary/relationship flags | `StudentGuardian.isPrimary`, `canCollectReports`, `canAuthorizeAbsence` | |
| Consent (photos, medical, SMS/WhatsApp) | `ConsentPreference` (`purpose`, `channel`, `granted`, `source`, `evidence`) | Purposes: MARKETING, TRANSACTIONAL, PASTORAL, ACADEMIC, SCHOOL_ADMIN, FINANCE, ACADEMIC_ASSESSMENT |

### Staff & HR

| Item | Model / field | Notes |
|---|---|---|
| Staff identity | `Staff` (`userId` unique, `dateOfJoining`, `dateOfBirth`, `phone`, `address`, `photoUrl`, `status`) | `Staff` ↔ `User` 1:1; personal name lives on `User.name` |
| TSC number, KRA PIN | **No columns** — store in `User`? No; see Gaps | Suggest `Staff.settings` or a new field |
| Role/designation | `Staff.roleId` → `StaffRole` (key, name, priority) | e.g. PRINCIPAL, BURSAR, TEACHER |
| Employment type | `Staff.employmentTypeId` → `EmploymentType` | PERMANENT/CONTRACT/DAILY/… |
| Subjects taught | via `TimetableLine.teacherId` + `Subject` | No direct "subjects taught" FK on staff |
| Bank details | `Staff` (`bankName`, `bankBranch`, `bankAccount`, `bankCode`) | |
| NSSF / SHIF / Housing Levy | `StatutoryDeduction` (`nssfRate`→`EmployeeRate`, `shifRate` 2.75%, `housingLevyRate` 1.5%, `personalRelief`) | Per institution+year; verify current rates before payroll runs |
| PAYE bands | `PayeBand` (`minSalary`, `maxSalary`, `rate`) | Under `StatutoryDeduction` |
| Salary & contracts | `Contract` (`basicSalary`, `paymentSchedule`, `startDate`, `endDate`, `benefits`, `isActive`) | History preserved as multiple `Contract` rows |
| Allowances / loans | `PayslipLine` (type ALLOWANCE/DEDUCTION), `SalaryLoan`, `SalaryLoanRepayment` | SACCOs/advances supported |
| Leave types & balances | `LeaveType` (`daysPerYear`, `carryOverCap`, `isPaid`), `LeaveRequest`, `LeaveBalanceAdjustment` | |
| Emergency contacts | `EmergencyContact` (name, relationship, phone, isPrimary) | |
| Payslip template / cycle | `Payslip`, `PayslipLine`, `PayrollRun` (`period` "YYYY-MM", `payDate`) | Monthly cycle assumed |

### Fee structures & finance

| Item | Model / field | Notes |
|---|---|---|
| Fee structure per grade/term | `FeeStructure` (`gradeId?`, `academicYearId`, `termId?`, `isActive`) → `FeeItem[]` | `FeeItem.type`: TUITION/TRANSPORT/MEALS/UNIFORM/EXAM/ACTIVITY/BOARDING/OTHER |
| Discounts, bursaries, sibling rates | `Invoice.discountAmount`, `Invoice.discountType` (`PERCENTAGE`/`FIXED_AMOUNT`) | No standing student-discount model — apply per invoice; see Gaps |
| M-Pesa paybill statement | `Payment.method = MPESA`, `Payment.reference`; `Transaction` for reconciliation | Receipt serial ranges → `Receipt.receiptNumber` |
| Opening arrears | `Invoice.amountRemaining`, `Invoice.status` | Import historical balances as invoices with status `OVERDUE`/`PARTIALLY_PAID` |
| Receipts | `Receipt` (`receiptNumber` unique, `paymentId` unique) | Auto-created from payments in portal |
| Budget | `Budget`, `BudgetLine` | Optional for v1 |
| Ledger / journal | `Transaction` (`type` INCOME/EXPENSE/…, `reference` unique) | Light ledger only; not a full accounting system |

### Boarding

| Item | Model / field | Notes |
|---|---|---|
| Dormitories | `Dormitory` (`name`, `type` BOYS/GIRLS, `capacity`, `currentOccupancy`) | |
| Rooms | `Room` (`dormitoryId`, `roomNumber`, `roomType` SINGLE/DOUBLE/TRIPLE, `capacity`, `features[]`) | |
| Room allocation | `RoomAssignment` (`roomId`, `studentId`, `leaseStart`, `leaseEnd`, `isCurrent`, `rentAmount`) | |
| Exeat passes | `ExeatPass` (`studentId`, `requestedBy`, `reason`, `startDate`, `endDate`, `status`) | `ExeatStatus` PENDING/APPROVED/REJECTED/EXPIRED |
| Boarding fees | `BoardingFee` (`amount` KES/term, `applicableGrades[]`, `dormitoryId?`) | Decoupled from `FeeStructure` — ensure consistent |
| Dorm rules | `DormitoryRule` (`category` CURFEW/VISITING/…, `title`, `description`) | |

### Transport

| Item | Model / field | Notes |
|---|---|---|
| Vehicles | `Vehicle` (`registrationNumber` unique, `model`, `year`, `capacity`, `fuelType`, `licenseExpires`, `insuranceExpires`, `status`) | Alertable expiries |
| Maintenance history | `VehicleMaintenance` (`maintenanceType` SERVICE/REPAIR/…, `cost`, `mileageAtService`, `status`) | |
| Routes & stops | `Route` → `RouteStop` (`stopName`, `order`, `latitude`, `longitude`, `contactPhone`, `timeWindow`) | |
| Student route allocation | `RouteAssignment` (`routeId`, `studentId`, `vehicleId?`, `isCurrent`) | |
| Transport fees | `TransportFee` (`amount` KES/term, `applicableGrades[]`) or as `FeeItem` type `TRANSPORT` | Prefer one source of truth — see Gaps |

### Library

| Item | Model / field | Notes |
|---|---|---|
| Book catalogue | `Book` (`title`, `isbn?`, `author`, `coAuthor?`, `publisher?`, `publicationYear`, `category`, `language`, `copiesTotal`, `copiesAvailable`, `libraryCategoryId?`) | Accession no. has no field — see Gaps (use `isbn` or a category convention) |
| Categories | `LibraryCategory` (`name`, `description`) | e.g. Fiction, Science, CBC textbooks |
| Borrowing | `BorrowRecord` (`bookId`, `studentId`, `issuedAt`, `dueDate`, `returnedAt`, `status`) | `status` uses `ExeatRecordStatus` (ISSUED/RETURNED/LOST/DAMAGED) — enum reused, see Gaps |
| Reservations | `ReserveRecord` (`status` PENDING/FULFILLED/CANCELLED) | |
| Fines | `LibraryFine` (`fineName`, `amount`, `fineType` OVERDUE/LOST/DAMAGED) | |

### Discipline & co-curricular

| Item | Model / field | Notes |
|---|---|---|
| Code of conduct / incident categories | `DisciplineIncident.category` (`DisciplineCategory`), `DisciplineIncident.actionTaken` (`DisciplineAction`) | |
| Historical incidents | `DisciplineIncident` (`studentId`, `teacherId?`, `date`, `severity` 1–5, `parentNotified`, `resolved`, `resolvedBy`) | May be anonymised for import |
| Clubs & patrons | `Club` (`name`, `type` SCIENCE_MATH/…/CU, `leaderId?`, `meetingSchedule`) | Patron = `leaderId` (a User) |
| Membership | `ClubMember` (`clubId`, `studentId`, `role`, `joinedAt`, `isActive`) | |

### Parish (optional scope)

| Item | Model / field | Notes |
|---|---|---|
| Parish members/groups | `InstitutionMembership` + `Role` (PARISH_*), `ParishRelation` | Parish membership flows through the shared User/Role system |
| Events | `SchoolCalendarEvent` (no parish_event model) — reuse with parish institutionId | See Gaps |
| Giving & pledges | No dedicated giving models — use `Transaction` + `ConsentPreference` (GIVING) | See Gaps; parish giving needs models if in scope |

## Wave 3 — Historical / transactional data

| Item | Model / field | Notes |
|---|---|---|
| Attendance | `Attendance` (`studentId`, `termId?`, `date`, `status` string — "PRESENT"/"ABSENT"/"LATE") | Status is free text; standardise codes on import |
| Marks & assessments | `Assessment` (`assessmentType` FORMATIVE/SUMMATIVE/SBA, `rubric` JSON EE/ME/AE/BE, `maxScore`) → `AssessmentScore` (`score`, `gradeBand`) | CBC bands natively supported |
| Report card sample | `ReportCard` (`status` DRAFT/ISSUED/ARCHIVED, `pdfGenerated`, `distributed`, `parentAcknowledged`) | Import layout into PDF generator, not the DB |
| KPSEA / KJSEA registrations | `KPSEARegistration`, `KJSEARegistration` | |
| Invoices/payments/receipts | `Invoice`, `InvoiceLine`, `Payment`, `Receipt` | Arrears imported as `Invoice` rows with `status=OVERDUE` |
| Promotions | `Promotion`, `PromotionStudent` | |
| Timetable | `Timetable` (`gradeId` unique per term) → `TimetableLine` (`dayOfWeek`, `period`, `subjectId`, `teacherId?`, `classroom`, `isDoublePeriod`) | Bell times have no model — gap |
| Lesson plans / schemes | `LessonPlan` (`gradeId` unique per subject+week, `objectives` JSON, `activities` JSON, `resources` JSON) | One row per week; matches CBC schemes |
| Notices / templates | `Notification`, `MessageTemplate` (enum `MessageTemplateType`) | Templates seeded, not asked from school |

---

## Gaps found while mapping (fix before import)

1. **Admission number** — no field on `Student`. Add `admissionNumber String? @unique` (and on `Admission`) or use `Student.id` as the surrogate key everywhere.
2. **Student demographics** — DOB, gender, NEMIS/birth-cert numbers, nationality, address have no columns. Add a `StudentProfile` (1:1 with `Student`) or extend `Student`.
3. **TSC number / KRA PIN on staff** — store in `Staff` (add `tscNumber`, `kraPin`) rather than `User`.
4. **Form teacher FK** — `Grade.formTeacher` is a string. Make it a proper relation to `Staff` if teacher-level reporting is needed.
5. **Student allergies / medical conditions** — no dedicated model. Add `StudentMedical` or use `Document` uploads until one exists.
6. **Standing discounts / bursaries** — discounts are per-invoice only. Add `StudentDiscount` if the school applies them recurring.
7. **Transport fee vs `FeeItem(TRANSPORT)` vs `TransportFee`** — three overlapping mechanisms. Pick one source of truth per route/grade to avoid double counting.
8. **`BorrowRecord.status` reuses `ExeatRecordStatus`** (ISSUED/RETURNED/LOST/DAMAGED) — works, but a dedicated `BorrowStatus` enum is cleaner.
9. **Bell times / periods-per-day / chapel** — no model. Store in `Timetable.description` or `Institution.settings` JSON.
10. **Parish giving/pledges & parish member directory** — no models. Required if parish scope is confirmed; add `Pledge`, `Giving`, `Ministry` before Wave 2.
11. **Library accession number** — no field on `Book`. Add `accessionNumber String? @unique`.
12. **`Club.createdById` not unique vs one portal admin** — fine; no action.

## Suggested import order (respects FKs)

1. `Institution` → `AcademicYear` → `Term` → `Grade` → `StreamEntry` → `Subject`
2. `User` (staff/guardians) → `StaffRole` / `EmploymentType` / `Staff` → `Role` / `Permission` / `UserRole`
3. `Guardian` → `Student` → `StudentGuardian` → `Admission` → `Enrolment`
4. `FeeStructure` → `FeeItem` → `Invoice` → `InvoiceLine` → `Payment` → `Receipt`
5. `Dormitory` → `Room` → `RoomAssignment`;  `Route` → `RouteStop` → `RouteAssignment`
6. `Book` / `LibraryCategory` → `BorrowRecord`
7. `Assessment` → `AssessmentScore` → `ReportCard`;  `KPSEARegistration` / `KJSEARegistration`
8. `Club` / `ClubMember`, `DisciplineIncident`, `Attendance`, `Promotion`
