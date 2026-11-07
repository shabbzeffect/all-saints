// ============================================================================
// SAINTSHUB — School SIS Seed
// All Saints Mushililie Academy (fictional demo data)
//
//   npm run db:seed                 # idempotent — safe to re-run
//   SEED_RESET=1 npm run db:seed    # wipe this tenant's data first
//
// Written against the actual schema.prisma — every field name verified.
//
// KNOWN SCHEMA LIMITS (see warnings printed at the end of a run):
//   Assessment.gradeId  @unique -> max 1 assessment  per grade, ever
//   Timetable.gradeId   @unique -> max 1 timetable   per grade, ever
//   LessonPlan.gradeId  @unique -> max 1 lesson plan per grade, ever
//   StreamEntry.gradeId @unique -> max 1 stream      per grade, ever
// ============================================================================

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SLUG = "allsaints-academy";
const DOMAIN = "allsaintsmushililie.ac.ke";
const DEMO_PASSWORD = "TempPass123!";
const TARGET_STUDENTS = 120;
const ATTENDANCE_DAYS = 12;
const SHOULD_RESET = process.env.SEED_RESET === "1";

// ---------------------------------------------------------------------------
// Deterministic PRNG — same run produces the same data, so E2E tests can
// assert against fixed records. Never use bare Math.random() in a seed.
// ---------------------------------------------------------------------------

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(20240115);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

/** Fisher-Yates on a COPY — never mutates the source array. */
function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** get-or-create for models with no usable compound @@unique. */
async function findOrCreate<T>(
  delegate: {
    findFirst: (a: any) => Promise<T | null>;
    create: (a: any) => Promise<T>;
  },
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<T> {
  const hit = await delegate.findFirst({ where });
  return hit ?? delegate.create({ data });
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/** `level` is a plain String in your schema; values mirror the GradeLevel enum. */
const GRADE_DEFS = [
  { name: "PP1", level: "PP1", band: "PP", capacity: 45, room: "A1" },
  { name: "PP2", level: "PP2", band: "PP", capacity: 45, room: "A2" },
  {
    name: "Grade 1",
    level: "GRADE_1",
    band: "LOWER",
    capacity: 45,
    room: "B1",
  },
  {
    name: "Grade 2",
    level: "GRADE_2",
    band: "LOWER",
    capacity: 45,
    room: "B2",
  },
  {
    name: "Grade 3",
    level: "GRADE_3",
    band: "LOWER",
    capacity: 42,
    room: "B3",
  },
  {
    name: "Grade 4",
    level: "GRADE_4",
    band: "UPPER",
    capacity: 42,
    room: "C1",
  },
  {
    name: "Grade 5",
    level: "GRADE_5",
    band: "UPPER",
    capacity: 40,
    room: "C2",
  },
  {
    name: "Grade 6",
    level: "GRADE_6",
    band: "UPPER",
    capacity: 40,
    room: "C3",
  },
  {
    name: "Grade 7",
    level: "GRADE_7",
    band: "JUNIOR",
    capacity: 38,
    room: "D1",
  },
  {
    name: "Grade 8",
    level: "GRADE_8",
    band: "JUNIOR",
    capacity: 38,
    room: "D2",
  },
  {
    name: "Grade 9",
    level: "GRADE_9",
    band: "JUNIOR",
    capacity: 35,
    room: "D3",
  },
] as const;

/** Real Kenyan calendar shape — three NON-overlapping terms. */
const TERM_DEFS = [
  { ordinal: 1, name: "Term 1", start: "2024-01-08", end: "2024-04-05" },
  { ordinal: 2, name: "Term 2", start: "2024-05-06", end: "2024-08-02" },
  { ordinal: 3, name: "Term 3", start: "2024-08-26", end: "2024-10-25" },
] as const;

const SUBJECT_DEFS = [
  { name: "English", code: "ENG" },
  { name: "Mathematics", code: "MAT" },
  { name: "Kiswahili", code: "KIS" },
  { name: "Kenyan Sign Language", code: "KSL" },
  { name: "Christian Religious Ed.", code: "CRE" },
  { name: "Integrated Science", code: "SCI" },
  { name: "Social Studies", code: "SST" },
  { name: "Hygiene & Nutrition", code: "HYN" },
  { name: "Agriculture", code: "AGR" },
  { name: "Creative Arts", code: "CRA" },
] as const;

const STAFF_DEFS = [
  {
    first: "Musa",
    last: "Omondi",
    roleKey: "SCHOOL_PRINCIPAL",
    label: "Principal",
    mfa: true,
    emp: "PERMANENT",
  },
  {
    first: "Amina",
    last: "Hassan",
    roleKey: "SCHOOL_DEPUTY",
    label: "Deputy Head",
    mfa: true,
    emp: "PERMANENT",
  },
  {
    first: "Peter",
    last: "Kamau",
    roleKey: "SCHOOL_BURSAR",
    label: "Bursar",
    mfa: true,
    emp: "PERMANENT",
  },
  {
    first: "Josephine",
    last: "Achieng",
    roleKey: "SCHOOL_REGISTRAR",
    label: "Registrar",
    mfa: false,
    emp: "PERMANENT",
  },
  {
    first: "Jane",
    last: "Wangari",
    roleKey: "SCHOOL_TEACHER",
    label: "Teacher",
    mfa: false,
    emp: "PERMANENT",
  },
  {
    first: "Robert",
    last: "Kiptanui",
    roleKey: "SCHOOL_TEACHER",
    label: "Teacher",
    mfa: false,
    emp: "CONTRACT",
  },
  {
    first: "Mercy",
    last: "Jepketer",
    roleKey: "SCHOOL_TEACHER",
    label: "Teacher",
    mfa: false,
    emp: "CONTRACT",
  },
  {
    first: "Simon",
    last: "Oduor",
    roleKey: "SCHOOL_TEACHER",
    label: "Teacher",
    mfa: false,
    emp: "PERMANENT",
  },
] as const;

const BOY_NAMES = [
  "Abdulahi",
  "Brian",
  "Dennis",
  "Elijah",
  "Frank",
  "George",
  "Henry",
  "Isaac",
  "Joshua",
  "Kevin",
  "Michael",
  "Nathan",
  "Oscar",
  "Paul",
  "Richard",
  "Stephen",
  "Thomas",
  "Victor",
  "Yusuf",
  "Zachary",
] as const;
const GIRL_NAMES = [
  "Amina",
  "Betty",
  "Christine",
  "Dorothy",
  "Esther",
  "Fiona",
  "Grace",
  "Hellen",
  "Irene",
  "Jackline",
  "Carol",
  "Mercy",
  "Naomi",
  "Peninah",
  "Ruth",
  "Sarah",
  "Tabitha",
  "Valary",
  "Winnie",
  "Zawadi",
] as const;
const SURNAMES = [
  "Omondi",
  "Achieng",
  "Kamau",
  "Wanjiru",
  "Otieno",
  "Mutiso",
  "Kiptanui",
  "Jepchumba",
  "Njoroge",
  "Atieno",
  "Barasa",
  "Chebet",
  "Mwangi",
  "Odhiambo",
  "Wekesa",
  "Nyambura",
] as const;
const OCCUPATIONS = [
  "Teacher",
  "Trader",
  "Farmer",
  "Civil Servant",
  "Boda Operator",
  "Nurse",
  "Mechanic",
] as const;

/** Termly fee schedule in KES, by grade band. */
const FEE_PLAN: Record<
  string,
  Array<{ name: string; type: any; amount: number; optional?: boolean }>
> = {
  PP: [
    { name: "Tuition", type: "TUITION", amount: 12000 },
    { name: "Meals", type: "MEALS", amount: 4500 },
    { name: "Activity Fee", type: "ACTIVITY", amount: 1500 },
  ],
  LOWER: [
    { name: "Tuition", type: "TUITION", amount: 15000 },
    { name: "Meals", type: "MEALS", amount: 5000 },
    { name: "Activity Fee", type: "ACTIVITY", amount: 2000 },
    { name: "Assessment Fee", type: "EXAM", amount: 1000 },
  ],
  UPPER: [
    { name: "Tuition", type: "TUITION", amount: 18000 },
    { name: "Meals", type: "MEALS", amount: 5500 },
    { name: "Activity Fee", type: "ACTIVITY", amount: 2000 },
    { name: "Assessment Fee", type: "EXAM", amount: 1500 },
    { name: "Transport", type: "TRANSPORT", amount: 6000, optional: true },
  ],
  JUNIOR: [
    { name: "Tuition", type: "TUITION", amount: 22000 },
    { name: "Meals", type: "MEALS", amount: 6000 },
    { name: "Activity Fee", type: "ACTIVITY", amount: 2500 },
    { name: "Assessment Fee", type: "EXAM", amount: 1500 },
    { name: "Boarding", type: "BOARDING", amount: 18000, optional: true },
  ],
};

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

async function resetTenant(institutionId: string) {
  console.log("🧨 SEED_RESET=1 — wiping tenant data…");

  const steps: Array<[string, () => Promise<{ count: number }>]> = [
    ["receipts", () => prisma.receipt.deleteMany({ where: { institutionId } })],
    ["payments", () => prisma.payment.deleteMany({ where: { institutionId } })],
    [
      "invoiceLines",
      () =>
        prisma.invoiceLine.deleteMany({
          where: { invoice: { institutionId } },
        }),
    ],
    ["invoices", () => prisma.invoice.deleteMany({ where: { institutionId } })],
    [
      "feeItems",
      () =>
        prisma.feeItem.deleteMany({
          where: { feeStructure: { institutionId } },
        }),
    ],
    [
      "feeStructures",
      () => prisma.feeStructure.deleteMany({ where: { institutionId } }),
    ],
    [
      "budgetLines",
      () =>
        prisma.budgetLine.deleteMany({ where: { budget: { institutionId } } }),
    ],
    ["budgets", () => prisma.budget.deleteMany({ where: { institutionId } })],
    [
      "transactions",
      () => prisma.transaction.deleteMany({ where: { institutionId } }),
    ],
    [
      "assessmentScores",
      () => prisma.assessmentScore.deleteMany({ where: { institutionId } }),
    ],
    [
      "assessments",
      () => prisma.assessment.deleteMany({ where: { institutionId } }),
    ],
    [
      "reportCards",
      () => prisma.reportCard.deleteMany({ where: { institutionId } }),
    ],
    [
      "attendances",
      () => prisma.attendance.deleteMany({ where: { institutionId } }),
    ],
    [
      "timetableLines",
      () =>
        prisma.timetableLine.deleteMany({
          where: { timetable: { institutionId } },
        }),
    ],
    [
      "timetables",
      () => prisma.timetable.deleteMany({ where: { institutionId } }),
    ],
    [
      "lessonPlans",
      () => prisma.lessonPlan.deleteMany({ where: { institutionId } }),
    ],
    [
      "clubMembers",
      () => prisma.clubMember.deleteMany({ where: { institutionId } }),
    ],
    ["clubs", () => prisma.club.deleteMany({ where: { institutionId } })],
    [
      "disciplineIncidents",
      () => prisma.disciplineIncident.deleteMany({ where: { institutionId } }),
    ],
    [
      "kpsea",
      () => prisma.kPSEARegistration.deleteMany({ where: { institutionId } }),
    ],
    [
      "kjsea",
      () => prisma.kJSEARegistration.deleteMany({ where: { institutionId } }),
    ],
    [
      "promotionStudents",
      () =>
        prisma.promotionStudent.deleteMany({
          where: { promotion: { institutionId } },
        }),
    ],
    [
      "promotions",
      () => prisma.promotion.deleteMany({ where: { institutionId } }),
    ],
    [
      "enrolments",
      () => prisma.enrolment.deleteMany({ where: { institutionId } }),
    ],
    [
      "admissions",
      () => prisma.admission.deleteMany({ where: { institutionId } }),
    ],
    [
      "studentGuardians",
      () => prisma.studentGuardian.deleteMany({ where: { institutionId } }),
    ],
    [
      "guardians",
      () => prisma.guardian.deleteMany({ where: { institutionId } }),
    ],
    [
      "calendarEvents",
      () => prisma.schoolCalendarEvent.deleteMany({ where: { institutionId } }),
    ],
    ["students", () => prisma.student.deleteMany({ where: { institutionId } })],
    [
      "streams",
      () => prisma.streamEntry.deleteMany({ where: { institutionId } }),
    ],
    ["grades", () => prisma.grade.deleteMany({ where: { institutionId } })],
    ["subjects", () => prisma.subject.deleteMany({ where: { institutionId } })],
    ["terms", () => prisma.term.deleteMany({ where: { institutionId } })],
    [
      "academicYears",
      () => prisma.academicYear.deleteMany({ where: { institutionId } }),
    ],
    [
      "emergencyContacts",
      () =>
        prisma.emergencyContact.deleteMany({
          where: { staff: { institutionId } },
        }),
    ],
    [
      "contracts",
      () => prisma.contract.deleteMany({ where: { staff: { institutionId } } }),
    ],
    ["staff", () => prisma.staff.deleteMany({ where: { institutionId } })],
    [
      "employmentTypes",
      () => prisma.employmentType.deleteMany({ where: { institutionId } }),
    ],
    [
      "staffRoles",
      () => prisma.staffRole.deleteMany({ where: { institutionId } }),
    ],
    [
      "userRoles",
      () =>
        prisma.userRole.deleteMany({
          where: { membership: { institutionId } },
        }),
    ],
    [
      "memberships",
      () =>
        prisma.institutionMembership.deleteMany({ where: { institutionId } }),
    ],
    ["roles", () => prisma.role.deleteMany({ where: { institutionId } })],
    [
      "consentPreferences",
      () => prisma.consentPreference.deleteMany({ where: { institutionId } }),
    ],
    [
      "notifications",
      () => prisma.notification.deleteMany({ where: { institutionId } }),
    ],
    ["users", () => prisma.user.deleteMany({ where: { institutionId } })],
  ];

  for (const [label, run] of steps) {
    try {
      const { count } = await run();
      if (count) console.log(`   – ${label}: ${count}`);
    } catch (err: any) {
      console.warn(
        `   ⚠ ${label}: ${String(err?.message ?? err).split("\n")[0]}`,
      );
    }
  }
  console.log("✓ Tenant wiped\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding SAINTSHUB School SIS…\n");
  const t0 = Date.now();
  const warnings: string[] = [];

  // ======================================================================
  // 1. INSTITUTION  (slug is @unique -> real upsert)
  // ======================================================================
  const school = await prisma.institution.upsert({
    where: { slug: SLUG },
    update: { status: "ACTIVE" },
    create: {
      name: "All Saints Mushililie Academy",
      slug: SLUG,
      type: "SCHOOL",
      status: "ACTIVE",
      description:
        "Pre-Primary (PP1–PP2), Primary (Grade 1–6), Junior School (Grade 7–9)",
      address: "P.O. Box 142-50100",
      city: "Mushililie",
      county: "Kakamega",
      country: "KE",
      phone: "+254712000100",
      email: `info@${DOMAIN}`,
      website: `https://${DOMAIN}`,
      currency: "KES",
      dateFormat: "dd/MM/yyyy",
      timezone: "Africa/Nairobi",
    },
  });
  console.log(`✓ Institution: ${school.name}`);

  if (SHOULD_RESET) await resetTenant(school.id);

  // ======================================================================
  // 2. USERS + MEMBERSHIPS + ROLES
  //    Must come first: AcademicYear.createdById / Subject.createdById /
  //    Assessment.createdById are all REQUIRED FKs to User.
  // ======================================================================
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const staff: Array<{
    userId: string;
    email: string;
    roleKey: string;
    label: string;
    name: string;
  }> = [];

  for (let i = 0; i < STAFF_DEFS.length; i++) {
    const s = STAFF_DEFS[i];
    const email = `${s.first}.${s.last}`.toLowerCase() + `@${DOMAIN}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { status: "ACTIVE" },
      create: {
        email,
        emailVerified: new Date("2024-01-02"),
        phone: `+2547120001${String(10 + i).padStart(2, "0")}`,
        name: `${s.first} ${s.last}`,
        passwordHash,
        status: "ACTIVE",
        mfaEnabled: s.mfa,
        wing: "SCHOOL",
        institutionId: school.id,
      },
    });

    // InstitutionMembership.role is a required String in your schema.
    const membership = await prisma.institutionMembership.upsert({
      where: {
        institutionId_userId: { institutionId: school.id, userId: user.id },
      },
      update: { status: "ACTIVE" },
      create: {
        institutionId: school.id,
        userId: user.id,
        role: s.roleKey,
        status: "ACTIVE",
        joinedAt: new Date("2024-01-02"),
      },
    });

    const role = await prisma.role.upsert({
      where: {
        institutionId_key: { institutionId: school.id, key: s.roleKey },
      },
      update: {},
      create: {
        institutionId: school.id,
        key: s.roleKey,
        name: s.label,
        description: `${s.label} at ${school.name}`,
        isSystem: true,
        priority: Math.max(1, 100 - i * 10), // never negative
      },
    });

    // UserRole.membershipId is REQUIRED — pass the real id, never "".
    await prisma.userRole.upsert({
      where: {
        userId_roleId_membershipId: {
          userId: user.id,
          roleId: role.id,
          membershipId: membership.id,
        },
      },
      update: { isActive: true },
      create: {
        userId: user.id,
        roleId: role.id,
        membershipId: membership.id,
        isActive: true,
      },
    });

    staff.push({
      userId: user.id,
      email,
      roleKey: s.roleKey,
      label: s.label,
      name: `${s.first} ${s.last}`,
    });
  }

  const principal = staff.find((s) => s.roleKey === "SCHOOL_PRINCIPAL")!;
  const bursar = staff.find((s) => s.roleKey === "SCHOOL_BURSAR")!;
  const teachers = staff.filter((s) => s.roleKey === "SCHOOL_TEACHER");
  const creatorId = principal.userId;

  console.log(`✓ ${staff.length} users + memberships + roles`);

  // ======================================================================
  // 3. HR: StaffRole, EmploymentType, Staff, Contract, EmergencyContact
  // ======================================================================
  const empTypes: Record<string, string> = {};
  for (const [key, name] of [
    ["PERMANENT", "Permanent & Pensionable"],
    ["CONTRACT", "Fixed-Term Contract"],
  ]) {
    const et = await prisma.employmentType.upsert({
      where: { institutionId_key: { institutionId: school.id, key } },
      update: {},
      create: { institutionId: school.id, key, name, isActive: true },
    });
    empTypes[key] = et.id;
  }

  for (let i = 0; i < STAFF_DEFS.length; i++) {
    const s = STAFF_DEFS[i];
    const me = staff[i];

    const staffRole = await prisma.staffRole.upsert({
      where: {
        institutionId_key: { institutionId: school.id, key: s.roleKey },
      },
      update: {},
      create: {
        institutionId: school.id,
        key: s.roleKey,
        name: s.label,
        isSystem: true,
        priority: Math.max(1, 100 - i * 10),
      },
    });

    const record = await prisma.staff.upsert({
      where: { userId: me.userId },
      update: { status: "ACTIVE" },
      create: {
        institutionId: school.id,
        userId: me.userId,
        roleId: staffRole.id,
        employmentTypeId: empTypes[s.emp],
        dateOfJoining: new Date("2024-01-02"),
        dateOfBirth: new Date(
          `19${randInt(72, 95)}-0${randInt(1, 9)}-1${randInt(0, 8)}`,
        ),
        phone: `+2547120001${String(10 + i).padStart(2, "0")}`,
        address: `P.O. Box 142-50100, Kakamega`,
        emergencyPhone: `+2547330002${String(10 + i).padStart(2, "0")}`,
        status: "ACTIVE",
      },
    });

    const hasContract = await prisma.contract.findFirst({
      where: { staffId: record.id },
    });
    if (!hasContract) {
      await prisma.contract.create({
        data: {
          staffId: record.id,
          title: `${s.label} Contract`,
          basicSalary:
            s.roleKey === "SCHOOL_PRINCIPAL"
              ? 145000
              : s.roleKey === "SCHOOL_DEPUTY"
                ? 110000
                : s.roleKey === "SCHOOL_BURSAR"
                  ? 95000
                  : 62000,
          benefits: ["House allowance", "Medical cover", "Commuter allowance"],
          startDate: new Date("2024-01-02"),
          isActive: true,
          paymentSchedule: "MONTHLY",
        },
      });
    }

    const hasEc = await prisma.emergencyContact.findFirst({
      where: { staffId: record.id },
    });
    if (!hasEc) {
      await prisma.emergencyContact.create({
        data: {
          staffId: record.id,
          name: `${pick(BOY_NAMES)} ${pick(SURNAMES)}`,
          relationship: "SPOUSE",
          phone: `+2547330002${String(10 + i).padStart(2, "0")}`,
          isPrimary: true,
        },
      });
    }
  }
  console.log(`✓ ${STAFF_DEFS.length} staff records + contracts`);

  // ======================================================================
  // 4. ACADEMIC YEAR + TERMS
  //    AcademicYear has NO compound @@unique -> findFirst/create.
  // ======================================================================
  const academicYear = await findOrCreate<any>(
    prisma.academicYear,
    { institutionId: school.id, name: "2024 Academic Year" },
    {
      institutionId: school.id,
      name: "2024 Academic Year",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      termCount: TERM_DEFS.length,
      status: "ACTIVE",
      createdById: creatorId, // REQUIRED
    },
  );

  const now = new Date();
  const terms: any[] = [];
  for (const t of TERM_DEFS) {
    const startDate = new Date(t.start);
    const endDate = new Date(t.end);
    terms.push(
      await prisma.term.upsert({
        where: {
          academicYearId_ordinal: {
            academicYearId: academicYear.id,
            ordinal: t.ordinal,
          },
        },
        update: { startDate, endDate },
        create: {
          academicYearId: academicYear.id,
          institutionId: school.id,
          name: t.name,
          ordinal: t.ordinal,
          startDate,
          endDate,
          isCurrent: now >= startDate && now <= endDate, // derived, not hard-coded
          status: "ACTIVE",
        },
      }),
    );
  }
  if (!terms.some((t) => t.isCurrent)) {
    await prisma.term.update({
      where: { id: terms[0].id },
      data: { isCurrent: true },
    });
    terms[0].isCurrent = true;
  }
  const term1 = terms[0];
  console.log(`✓ Academic year + ${terms.length} non-overlapping terms`);

  // ======================================================================
  // 5. GRADES  (@@unique([institutionId, name]) -> upsert works)
  // ======================================================================
  const grades: any[] = [];
  for (let i = 0; i < GRADE_DEFS.length; i++) {
    const g = GRADE_DEFS[i];
    grades.push(
      await prisma.grade.upsert({
        where: {
          institutionId_name: { institutionId: school.id, name: g.name },
        },
        update: { capacity: g.capacity },
        create: {
          institutionId: school.id,
          academicYearId: academicYear.id,
          name: g.name,
          level: g.level,
          capacity: g.capacity,
          currentStudentCount: 0,
          roomNumber: g.room,
          formTeacher: teachers[i % teachers.length]?.name ?? null,
        },
      }),
    );
  }
  console.log(`✓ ${grades.length} grades`);

  // ======================================================================
  // 6. STREAMS — schema allows only ONE per grade (gradeId @unique)
  // ======================================================================
  const juniorGrades = grades.filter((g) =>
    ["Grade 7", "Grade 8", "Grade 9"].includes(g.name),
  );
  for (const grade of juniorGrades) {
    await prisma.streamEntry.upsert({
      where: { gradeId: grade.id },
      update: {},
      create: {
        gradeId: grade.id,
        institutionId: school.id,
        name: "Main Stream",
        level: "MAIN",
        capacity: grade.capacity,
        currentStudentCount: 0,
      },
    });
  }
  warnings.push(
    "StreamEntry.gradeId is @unique — only 1 stream per grade was created. " +
      "Remove that @unique to support East/West streams.",
  );
  console.log(
    `✓ ${juniorGrades.length} streams (1 per junior grade — schema limit)`,
  );

  // ======================================================================
  // 7. SUBJECTS  (@@unique([institutionId, code]))
  // ======================================================================
  const subjects: any[] = [];
  for (const s of SUBJECT_DEFS) {
    subjects.push(
      await prisma.subject.upsert({
        where: {
          institutionId_code: { institutionId: school.id, code: s.code },
        },
        update: { name: s.name },
        create: {
          institutionId: school.id,
          name: s.name,
          code: s.code,
          description: `${s.name} learning area`,
          isActive: true,
          createdById: creatorId, // REQUIRED
        },
      }),
    );
  }
  console.log(`✓ ${subjects.length} subjects`);

  // ======================================================================
  // 8. STUDENTS — exactly TARGET_STUDENTS
  //    Largest-remainder apportionment, so the total is exact (not 121).
  //    NOTE: your Student model has no admissionNumber / gender / DOB.
  // ======================================================================
  const weights = GRADE_DEFS.map((g) => g.capacity);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / totalWeight) * TARGET_STUDENTS);
  const counts = raw.map(Math.floor);
  let remainder = TARGET_STUDENTS - counts.reduce((a, b) => a + b, 0);
  const byFrac = raw
    .map((v, i) => ({ i, f: v - Math.floor(v) }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; remainder > 0; k++, remainder--)
    counts[byFrac[k % byFrac.length].i]++;

  const existingStudents = await prisma.student.count({
    where: { institutionId: school.id },
  });
  if (existingStudents >= TARGET_STUDENTS) {
    console.log(
      `↻ ${existingStudents} students already present — skipping insert`,
    );
  } else {
    const rows: Prisma.StudentCreateManyInput[] = [];
    grades.forEach((grade, gi) => {
      for (let s = 0; s < counts[gi]; s++) {
        const male = (rows.length + gi) % 2 === 0;
        rows.push({
          institutionId: school.id,
          gradeId: grade.id,
          firstName: male ? pick(BOY_NAMES) : pick(GIRL_NAMES),
          lastName: pick(SURNAMES), // always populated
          status: "ACTIVE",
        });
      }
    });
    for (const batch of chunk(rows, 200)) {
      await prisma.student.createMany({ data: batch });
    }
  }

  // Read back REAL ids. Never overwrite `id` with a loop counter.
  const students = await prisma.student.findMany({
    where: { institutionId: school.id },
    select: { id: true, gradeId: true, firstName: true, lastName: true },
    orderBy: { id: "asc" },
  });
  console.log(`✓ ${students.length} students (target ${TARGET_STUDENTS})`);

  const byGrade = (gradeId: string) =>
    students.filter((s) => s.gradeId === gradeId);

  // Keep the denormalised counters honest.
  for (const grade of grades) {
    await prisma.grade.update({
      where: { id: grade.id },
      data: { currentStudentCount: byGrade(grade.id).length },
    });
  }

  // ======================================================================
  // 9. GUARDIANS + LINKS
  //    idNumber is set deterministically so read-back order is reliable.
  // ======================================================================
  const existingGuardians = await prisma.guardian.count({
    where: { institutionId: school.id },
  });
  if (existingGuardians >= students.length) {
    console.log(
      `↻ ${existingGuardians} guardians already present — skipping insert`,
    );
  } else {
    const rows: Prisma.GuardianCreateManyInput[] = students.map((st, i) => {
      const father = i % 2 === 0;
      return {
        institutionId: school.id,
        firstName: father ? pick(BOY_NAMES) : pick(GIRL_NAMES),
        lastName: st.lastName, // shares the child's surname
        relationship: father ? "FATHER" : i % 5 === 0 ? "GUARDIAN" : "MOTHER",
        phone: `+2547${String(20000000 + i).slice(-8)}`,
        idNumber: `G-${String(i + 1).padStart(5, "0")}`, // padStart, correct width
        idNumberVerified: i % 4 !== 0,
        occupation: pick(OCCUPATIONS),
        primaryPayer: true,
        pickupAuthorised: true,
        email: i % 3 === 0 ? `guardian${i + 1}@example.co.ke` : null,
      };
    });
    for (const batch of chunk(rows, 200)) {
      await prisma.guardian.createMany({ data: batch });
    }
  }

  const guardians = await prisma.guardian.findMany({
    where: { institutionId: school.id },
    select: { id: true },
    orderBy: { idNumber: "asc" },
  });

  if (guardians.length < students.length) {
    throw new Error(
      `Guardian/student mismatch: ${guardians.length} vs ${students.length}. ` +
        `Re-run with SEED_RESET=1.`,
    );
  }

  const existingLinks = await prisma.studentGuardian.count({
    where: { institutionId: school.id },
  });
  if (existingLinks >= students.length) {
    console.log(`↻ ${existingLinks} guardian links already present — skipping`);
  } else {
    await prisma.studentGuardian.createMany({
      data: students.map((st, i) => ({
        institutionId: school.id,
        studentId: st.id,
        guardianId: guardians[i].id,
        isPrimary: true,
        primaryPayer: true,
        canPickUp: true,
        canCollectReports: true,
        canAuthorizeAbsence: true,
      })),
      skipDuplicates: true, // @@unique([studentId, guardianId])
    });
  }
  console.log(`✓ ${students.length} guardians linked`);

  // ======================================================================
  // 10. ENROLMENTS (Term 1) — no @@unique, so count-guard
  // ======================================================================
  const existingEnrolments = await prisma.enrolment.count({
    where: { institutionId: school.id, termId: term1.id },
  });
  if (existingEnrolments >= students.length) {
    console.log(
      `↻ ${existingEnrolments} enrolments already present — skipping`,
    );
  } else {
    await prisma.enrolment.createMany({
      data: students.map((st) => ({
        institutionId: school.id,
        studentId: st.id,
        gradeId: st.gradeId!, // from the record, NOT an un-included relation
        termId: term1.id,
        status: "ACTIVE",
        enrolledAt: new Date("2024-01-08"),
      })),
    });
    console.log(`✓ ${students.length} enrolments (Term 1)`);
  }

  // ======================================================================
  // 11. ATTENDANCE — ~92% present, so analytics render
  // ======================================================================
  const existingAttendance = await prisma.attendance.count({
    where: { institutionId: school.id },
  });
  if (existingAttendance > 0) {
    console.log(
      `↻ ${existingAttendance} attendance rows already present — skipping`,
    );
  } else {
    const rows: Prisma.AttendanceCreateManyInput[] = [];
    const start = new Date("2024-01-08");
    for (let d = 0; d < ATTENDANCE_DAYS; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + d + Math.floor(d / 5) * 2); // skip weekends
      for (const st of students) {
        const r = rng();
        rows.push({
          institutionId: school.id,
          studentId: st.id,
          termId: term1.id,
          date,
          status: r < 0.92 ? "PRESENT" : r < 0.97 ? "LATE" : "ABSENT",
        });
      }
    }
    for (const batch of chunk(rows, 500)) {
      await prisma.attendance.createMany({ data: batch });
    }
    console.log(
      `✓ ${rows.length} attendance records (${ATTENDANCE_DAYS} days)`,
    );
  }

  // ======================================================================
  // 12. ASSESSMENTS — schema allows only ONE per grade (gradeId @unique)
  // ======================================================================
  const bandFor = (p: number) =>
    p >= 80 ? "EXCEEDS" : p >= 60 ? "MEETS" : p >= 40 ? "APPROACHES" : "BELOW";

  let assessmentCount = 0;
  let scoreCount = 0;

  for (let i = 0; i < grades.length; i++) {
    const grade = grades[i];
    const cohort = byGrade(grade.id);
    if (!cohort.length) continue;

    const subject = subjects[i % subjects.length];

    const existing = await prisma.assessment.findUnique({
      where: { gradeId: grade.id },
    });
    const assessment =
      existing ??
      (await prisma.assessment.create({
        data: {
          institutionId: school.id,
          termId: term1.id,
          gradeId: grade.id,
          subjectId: subject.id,
          assessmentType: "SUMMATIVE",
          title: `${subject.name} — End of Term 1 Assessment`,
          description: `Summative assessment for ${grade.name}`,
          rubric: {
            EXCEEDS: "80-100 — Exceeds Expectations",
            MEETS: "60-79 — Meets Expectations",
            APPROACHES: "40-59 — Approaches Expectations",
            BELOW: "0-39 — Below Expectations",
          },
          maxScore: 100,
          createdById: teachers[i % teachers.length].userId, // REQUIRED
        },
      }));
    if (!existing) assessmentCount++;

    const marker = teachers[i % teachers.length];
    for (const st of shuffled(cohort)) {
      const score = randInt(28, 98);
      await prisma.assessmentScore.upsert({
        where: {
          institutionId_assessmentId_studentId: {
            institutionId: school.id,
            assessmentId: assessment.id,
            studentId: st.id,
          },
        },
        update: {},
        create: {
          institutionId: school.id,
          assessmentId: assessment.id,
          studentId: st.id,
          score,
          gradeBand: bandFor(score) as any,
          comments:
            score >= 60
              ? "Good progress this term."
              : "Needs targeted support.",
          assessedBy: marker.name, // plain String in your schema, not an FK
        },
      });
      scoreCount++;
    }
  }
  warnings.push(
    "Assessment.gradeId is @unique — only 1 assessment per grade could be created. " +
      "Remove that @unique to seed multiple subjects/terms.",
  );
  console.log(
    `✓ ${assessmentCount} assessments, ${scoreCount} scores (schema limit: 1 per grade)`,
  );

  // ======================================================================
  // 13. REPORT CARDS — @@unique([institutionId, studentId, termId])
  //     ReportCard.issuedBy is an FK to User.id (confusingly named).
  // ======================================================================
  const rcStudents = students.slice(0, 40);
  for (const st of rcStudents) {
    await prisma.reportCard.upsert({
      where: {
        institutionId_studentId_termId: {
          institutionId: school.id,
          studentId: st.id,
          termId: term1.id,
        },
      },
      update: {},
      create: {
        institutionId: school.id,
        studentId: st.id,
        termId: term1.id,
        gradeId: st.gradeId!,
        academicYearId: academicYear.id,
        issuedAt: new Date("2024-04-05"),
        issuedBy: principal.userId, // FK to User, not a free-text name
        status: "ISSUED",
        pdfGenerated: true,
        pdfUrl: `/reports/2024/t1/${st.id}.pdf`,
        distributed: true,
        distributedAt: new Date("2024-04-08"),
        parentAcknowledged: rng() > 0.3,
        parentAcknowledgedAt: new Date("2024-04-10"),
      },
    });
  }
  console.log(`✓ ${rcStudents.length} report cards (Term 1)`);

  // ======================================================================
  // 14. PROMOTION — gradeFrom/gradeTo are GradeLevel ENUMS, not FKs
  // ======================================================================
  const promotion = await findOrCreate<any>(
    prisma.promotion,
    {
      institutionId: school.id,
      academicYearId: academicYear.id,
      gradeFrom: "GRADE_6",
    },
    {
      institutionId: school.id,
      academicYearId: academicYear.id,
      termId: terms[2].id,
      gradeFrom: "GRADE_6",
      gradeTo: "GRADE_7",
      status: "PENDING",
      notes: "End-of-year transition into Junior School.",
    },
  );

  const g6 = grades.find((g) => g.name === "Grade 6")!;
  const g6Students = byGrade(g6.id);
  const existingPs = await prisma.promotionStudent.count({
    where: { promotionId: promotion.id },
  });
  if (existingPs === 0 && g6Students.length) {
    await prisma.promotionStudent.createMany({
      data: g6Students.map((st) => ({
        promotionId: promotion.id,
        studentId: st.id,
        studentTargetGrade: "GRADE_7",
        status: "PENDING",
      })),
    });
  }
  console.log(
    `✓ Promotion GRADE_6 → GRADE_7 (${g6Students.length} candidates)`,
  );

  // ======================================================================
  // 15. NATIONAL EXAM REGISTRATIONS (KPSEA Grade 6, KJSEA Grade 9)
  // ======================================================================
  const g9 = grades.find((g) => g.name === "Grade 9")!;
  let examCount = 0;

  for (let i = 0; i < g6Students.length; i++) {
    const st = g6Students[i];
    await prisma.kPSEARegistration.upsert({
      where: {
        institutionId_studentId: { institutionId: school.id, studentId: st.id },
      },
      update: {},
      create: {
        institutionId: school.id,
        studentId: st.id,
        registrationNumber: `KPSEA-2024-${String(i + 1).padStart(4, "0")}`,
        entryYear: 2024,
        targetSecondarySchool: pick([
          "Kakamega High",
          "Bunyore Girls",
          "St. Peter's Mumias",
          "Local Junior School",
        ]),
        performanceIndex: randInt(45, 95),
      },
    });
    examCount++;
  }

  for (let i = 0; i < byGrade(g9.id).length; i++) {
    const st = byGrade(g9.id)[i];
    await prisma.kJSEARegistration.upsert({
      where: {
        institutionId_studentId: { institutionId: school.id, studentId: st.id },
      },
      update: {},
      create: {
        institutionId: school.id,
        studentId: st.id,
        registrationNumber: `KJSEA-2024-${String(i + 1).padStart(4, "0")}`,
        entryYear: 2024,
        targetSecondarySchool: pick([
          "Kakamega School",
          "Shimo la Tewa",
          "Alliance High",
          "Butere Girls",
        ]),
        performanceIndex: randInt(48, 97),
      },
    });
    examCount++;
  }
  console.log(`✓ ${examCount} national exam registrations`);

  // ======================================================================
  // 16. DISCIPLINE INCIDENTS
  // ======================================================================
  const existingDiscipline = await prisma.disciplineIncident.count({
    where: { institutionId: school.id },
  });
  if (existingDiscipline > 0) {
    console.log(
      `↻ ${existingDiscipline} discipline records already present — skipping`,
    );
  } else {
    const CATS = [
      "BEHAVIOR",
      "ATTENDANCE",
      "UNIFORM_VIOLATION",
      "ACADEMIC_MISCONDUCT",
    ] as const;
    const ACTS = [
      "WARNING",
      "PARENT_CONFERENCE",
      "DETENTION",
      "COUNSELLING",
    ] as const;
    const sample = shuffled(students).slice(0, 14);
    for (let i = 0; i < sample.length; i++) {
      await prisma.disciplineIncident.create({
        data: {
          institutionId: school.id,
          studentId: sample[i].id,
          teacherId: teachers[i % teachers.length].userId,
          category: pick(CATS) as any,
          actionTaken: pick(ACTS) as any,
          description: "Logged by the class teacher during morning session.",
          date: new Date(2024, 1, randInt(1, 28)),
          severity: randInt(1, 4),
          parentNotified: rng() > 0.4,
          parentNotifiedAt: new Date(2024, 1, 28),
          resolved: rng() > 0.5,
          resolvedAt: new Date(2024, 2, 5),
        },
      });
    }
    console.log(`✓ ${sample.length} discipline incidents`);
  }

  // ======================================================================
  // 17. CLUBS  (guarded — ClubMember reuses one relation name twice)
  // ======================================================================
  try {
    const CLUB_DEFS = [
      { name: "Science & Mathematics Club", type: "SCIENCE_MATH" },
      { name: "Drama & Music Club", type: "MUSIC_DRAMA" },
      { name: "Scouts", type: "SCOUTS" },
      { name: "Christian Union", type: "CU" },
    ] as const;

    let members = 0;
    for (let i = 0; i < CLUB_DEFS.length; i++) {
      const c = CLUB_DEFS[i];
      const club = await findOrCreate<any>(
        prisma.club,
        { institutionId: school.id, name: c.name },
        {
          institutionId: school.id,
          name: c.name,
          type: c.type as any,
          description: `${c.name} — meets weekly.`,
          leaderId: teachers[i % teachers.length].userId,
          meetingSchedule: "Friday 14:00–15:30",
          isActive: true,
          createdById: creatorId, // REQUIRED
        },
      );

      for (const st of shuffled(students).slice(0, 15)) {
        await prisma.clubMember.upsert({
          where: {
            clubId_studentId_institutionId: {
              clubId: club.id,
              studentId: st.id,
              institutionId: school.id,
            },
          },
          update: {},
          create: {
            institutionId: school.id,
            clubId: club.id,
            studentId: st.id,
            role: "Member",
            isActive: true,
          },
        });
        members++;
      }
    }
    console.log(`✓ ${CLUB_DEFS.length} clubs, ${members} memberships`);
  } catch (err: any) {
    warnings.push(
      `Clubs skipped: ${String(err?.message ?? err).split("\n")[0]}`,
    );
  }

  // ======================================================================
  // 18. TIMETABLE — one per grade (gradeId @unique)
  // ======================================================================
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  let lineCount = 0;

  for (const grade of grades.slice(0, 6)) {
    const existing = await prisma.timetable.findUnique({
      where: { gradeId: grade.id },
    });
    const timetable =
      existing ??
      (await prisma.timetable.create({
        data: {
          institutionId: school.id,
          gradeId: grade.id,
          termId: term1.id,
          name: `${grade.name} — Term 1 Timetable`,
          description: `Weekly schedule for ${grade.name}`,
          isRecurring: true,
          createdById: creatorId, // REQUIRED
        },
      }));

    if (existing) continue;

    for (const day of DAYS) {
      for (let period = 1; period <= 6; period++) {
        const subject =
          subjects[(DAYS.indexOf(day) + period) % subjects.length];
        await prisma.timetableLine.upsert({
          where: {
            timetableId_dayOfWeek_period: {
              timetableId: timetable.id,
              dayOfWeek: day,
              period,
            },
          },
          update: {},
          create: {
            timetableId: timetable.id,
            dayOfWeek: day,
            period,
            subjectId: subject.id,
            teacherId:
              teachers[(period + DAYS.indexOf(day)) % teachers.length].userId,
            classroom: grade.roomNumber,
            isDoublePeriod: period === 3,
          },
        });
        lineCount++;
      }
    }
  }
  warnings.push(
    "Timetable.gradeId and LessonPlan.gradeId are @unique — only 1 of each per grade.",
  );
  console.log(`✓ Timetables for 6 grades, ${lineCount} periods`);

  // ======================================================================
  // 19. FINANCE — the bursar dashboard finally has data
  // ======================================================================
  const existingInvoices = await prisma.invoice.count({
    where: { institutionId: school.id },
  });

  if (existingInvoices > 0) {
    console.log(
      `↻ ${existingInvoices} invoices already present — skipping finance`,
    );
  } else {
    let invoiceSeq = 1;
    let receiptSeq = 1;
    let paidTotal = 0;
    let billedTotal = 0;

    for (let gi = 0; gi < grades.length; gi++) {
      const grade = grades[gi];
      const cohort = byGrade(grade.id);
      if (!cohort.length) continue;

      const plan = FEE_PLAN[GRADE_DEFS[gi].band];

      const structure = await prisma.feeStructure.create({
        data: {
          institutionId: school.id,
          name: `${grade.name} — Term 1 2024 Fees`,
          gradeId: grade.id,
          academicYearId: academicYear.id,
          termId: term1.id,
          description: `Termly fee structure for ${grade.name}`,
          isActive: true,
        },
      });

      const feeItems = [];
      for (const item of plan) {
        feeItems.push(
          await prisma.feeItem.create({
            data: {
              feeStructureId: structure.id,
              name: item.name,
              type: item.type,
              amount: new Prisma.Decimal(item.amount),
              isOptional: item.optional ?? false,
              isRecurring: true,
            },
          }),
        );
      }

      // Mandatory items only — optional extras go to ~30% of students.
      for (const st of cohort) {
        const takesOptional = rng() < 0.3;
        const lines = plan
          .map((p, idx) => ({ ...p, feeItemId: feeItems[idx].id }))
          .filter((p) => !p.optional || takesOptional);

        const subtotal = lines.reduce((a, l) => a + l.amount, 0);
        const discount = rng() < 0.08 ? Math.round(subtotal * 0.1) : 0;
        const total = subtotal - discount;

        // Payment behaviour: 55% paid in full, 25% partial, 20% unpaid.
        const r = rng();
        const paid =
          r < 0.55
            ? total
            : r < 0.8
              ? Math.round(total * (0.3 + rng() * 0.4))
              : 0;
        const remaining = total - paid;

        const status =
          remaining === 0 ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "OVERDUE";

        const invoice = await prisma.invoice.create({
          data: {
            institutionId: school.id,
            studentId: st.id,
            termId: term1.id,
            academicYearId: academicYear.id,
            feeStructureId: structure.id,
            invoiceNumber: `INV-2024-T1-${String(invoiceSeq++).padStart(4, "0")}`,
            issueDate: new Date("2024-01-10"),
            dueDate: new Date("2024-02-10"),
            subtotal: new Prisma.Decimal(subtotal),
            discountAmount: new Prisma.Decimal(discount),
            discountType: discount > 0 ? "PERCENTAGE" : "NONE",
            totalAmount: new Prisma.Decimal(total),
            amountRemaining: new Prisma.Decimal(remaining),
            status: status as any,
            lines: {
              create: lines.map((l) => ({
                feeItemId: l.feeItemId,
                description: l.name,
                quantity: 1,
                unitAmount: new Prisma.Decimal(l.amount),
                lineAmount: new Prisma.Decimal(l.amount),
              })),
            },
          },
        });

        billedTotal += total;

        if (paid > 0) {
          const method = pick([
            "MPESA",
            "MPESA",
            "MPESA",
            "BANK_TRANSFER",
            "CASH",
          ]) as any;
          const payment = await prisma.payment.create({
            data: {
              institutionId: school.id,
              invoiceId: invoice.id,
              studentId: st.id,
              amount: new Prisma.Decimal(paid),
              method,
              reference:
                method === "MPESA"
                  ? `S${randInt(100000, 999999)}${String.fromCharCode(65 + randInt(0, 25))}`
                  : `BNK-${randInt(100000, 999999)}`,
              transactionDate: new Date(2024, 0, randInt(12, 31)),
              recordedById: bursar.userId,
              notes:
                remaining > 0 ? "Part payment received." : "Settled in full.",
            },
          });

          await prisma.receipt.create({
            data: {
              institutionId: school.id,
              paymentId: payment.id,
              receiptNumber: `RCP-2024-${String(receiptSeq++).padStart(4, "0")}`,
              issuedDate: payment.transactionDate,
              issuedById: bursar.userId,
            },
          });

          paidTotal += paid;
        }
      }
    }

    // Budgets + ledger, so the finance dashboard isn't half-empty.
    const budget = await prisma.budget.create({
      data: {
        institutionId: school.id,
        academicYearId: academicYear.id,
        name: "2024 Operating Budget",
        category: "OPERATIONS",
        allocated: new Prisma.Decimal(8_500_000),
        spent: new Prisma.Decimal(3_120_000),
        status: "ACTIVE",
        lines: {
          create: [
            {
              item: "Staff Salaries",
              amount: new Prisma.Decimal(5_200_000),
              spent: new Prisma.Decimal(2_100_000),
            },
            {
              item: "Teaching Materials",
              amount: new Prisma.Decimal(900_000),
              spent: new Prisma.Decimal(410_000),
            },
            {
              item: "Utilities",
              amount: new Prisma.Decimal(620_000),
              spent: new Prisma.Decimal(295_000),
            },
            {
              item: "Maintenance",
              amount: new Prisma.Decimal(780_000),
              spent: new Prisma.Decimal(315_000),
            },
            {
              item: "Transport & Fuel",
              amount: new Prisma.Decimal(1_000_000),
              spent: new Prisma.Decimal(0),
            },
          ],
        },
      },
    });

    await prisma.transaction.createMany({
      data: [
        {
          institutionId: school.id,
          reference: "TXN-2024-0001",
          type: "INCOME",
          amount: new Prisma.Decimal(paidTotal),
          description: "Term 1 fee collections",
          date: new Date("2024-02-01"),
        },
        {
          institutionId: school.id,
          reference: "TXN-2024-0002",
          type: "EXPENSE",
          amount: new Prisma.Decimal(2_100_000),
          description: "January payroll",
          date: new Date("2024-01-28"),
        },
        {
          institutionId: school.id,
          reference: "TXN-2024-0003",
          type: "EXPENSE",
          amount: new Prisma.Decimal(410_000),
          description: "Textbooks & stationery",
          date: new Date("2024-01-15"),
        },
        {
          institutionId: school.id,
          reference: "TXN-2024-0004",
          type: "EXPENSE",
          amount: new Prisma.Decimal(295_000),
          description: "Electricity & water",
          date: new Date("2024-02-05"),
        },
      ],
      skipDuplicates: true,
    });

    const pct = billedTotal
      ? ((paidTotal / billedTotal) * 100).toFixed(1)
      : "0";
    console.log(
      `✓ Finance: ${invoiceSeq - 1} invoices, ${receiptSeq - 1} receipts, ` +
        `KES ${paidTotal.toLocaleString()} / ${billedTotal.toLocaleString()} collected (${pct}%)`,
    );
    console.log(
      `✓ Budget "${budget.name}" with 5 lines + 4 ledger transactions`,
    );
  }

  // ======================================================================
  // 20. SCHOOL CALENDAR
  // ======================================================================
  const existingEvents = await prisma.schoolCalendarEvent.count({
    where: { institutionId: school.id },
  });
  if (existingEvents === 0) {
    await prisma.schoolCalendarEvent.createMany({
      data: [
        {
          institutionId: school.id,
          termId: term1.id,
          title: "Term 1 Opening Day",
          startDate: new Date("2024-01-08"),
          endDate: new Date("2024-01-08"),
        },
        {
          institutionId: school.id,
          termId: term1.id,
          title: "Parents' Day",
          startDate: new Date("2024-02-17"),
          endDate: new Date("2024-02-17"),
        },
        {
          institutionId: school.id,
          termId: term1.id,
          title: "Mid-Term Break",
          startDate: new Date("2024-02-23"),
          endDate: new Date("2024-02-26"),
        },
        {
          institutionId: school.id,
          termId: term1.id,
          title: "End of Term Assessment",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-04"),
        },
        {
          institutionId: school.id,
          termId: term1.id,
          title: "Term 1 Closing Day",
          startDate: new Date("2024-04-05"),
          endDate: new Date("2024-04-05"),
        },
        {
          institutionId: school.id,
          termId: terms[1].id,
          title: "Term 2 Opening Day",
          startDate: new Date("2024-05-06"),
          endDate: new Date("2024-05-06"),
        },
        {
          institutionId: school.id,
          termId: terms[2].id,
          title: "Prize Giving Day",
          startDate: new Date("2024-10-18"),
          endDate: new Date("2024-10-18"),
        },
      ],
    });
    console.log("✓ 7 school calendar events");
  }

  // ======================================================================
  // SUMMARY
  // ======================================================================
  console.log(
    `\n🌱 Seed complete in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`,
  );
  console.log(`📋 Demo logins — password for all: ${DEMO_PASSWORD}\n`);
  for (const s of staff) {
    console.log(`   ${s.label.padEnd(12)} ${s.email}`);
  }
  console.log(
    "\n⚠️  MFA enabled for Principal / Deputy Head / Bursar — use a TOTP app.",
  );
  console.log("⚠️  Demo data only. Never run this against production.");

  if (warnings.length) {
    console.log("\n🔧 Schema limitations hit during this run:");
    for (const w of warnings) console.log(`   • ${w}`);
    console.log("\n   See the recommended migration in the project README.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e: any) => {
    console.error("\n❌ Seed failed:\n");
    console.error(String(e?.message ?? e));
    await prisma.$disconnect();
    process.exit(1);
  });
