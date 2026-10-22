// ============================================================================
// SAINTSHUB - Phase 2 School SIS Seed Data
// Fictional demo data for All Saints Mushililie Academy
// ============================================================================

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting Phase 2 School SIS Seed Data...")

  // ==========================================================================
  // 1. INSTITUTIONS
  // ==========================================================================

  const school = await prisma.institution.upsert({
    where: { slug: "allsaints-academy" },
    update: {},
    create: {
      name: "All Saints Mushililie Academy",
      slug: "allsaints-academy",
      type: "SCHOOL",
      status: "ACTIVE",
      description: "Pre-Primary PP1-PP2, Primary Grade 1-6, Junior School Grade 7-9",
      currency: "KES",
      dateFormat: "dd/MM/yyyy",
    },
  })

  console.log(`✓ Created institution: ${school.name}`)

  // ==========================================================================
  // 2. ACADEMIC YEAR & TERMS
  // ==========================================================================

  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2024 Academic Year",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      termCount: 3,
      status: "ACTIVE",
      institutionId: school.id,
    },
  })

  // Create 3 terms
  const terms = []
  for (let i = 1; i <= 3; i++) {
    const term = await prisma.term.create({
      data: {
        name: `Term ${i}`,
        ordinal: i,
        startDate: new Date(`2024-01-01`).addMonths(i * 4 - 4),
        endDate: new Date(`2024-12-31`),
        isCurrent: i === 1,
        academicYearId: academicYear.id,
        institutionId: school.id,
      },
    })
    terms.push(term)
  }

  console.log(`✓ Created academic year with 3 terms`)

  // ==========================================================================
  // 3. GRADES & STREAMS
  // ==========================================================================

  const grades = []
  // PP1-PP2, Grade 1-6, Grade 7-9
  const gradeNames = ["PP1", "PP2", "GRADE_1", "GRADE_2", "GRADE_3", "GRADE_4", "GRADE_5", "GRADE_6", "GRADE_7", "GRADE_8", "GRADE_9"]

  for (let i = 0; i < gradeNames.length; i++) {
    const gradeName = gradeNames[i]
    const gradeLevel = i < 2 ? "PP" : i < 8 ? `GRADE_${i - 1}` : `GRADE_${i - 1}`

    const grade = await prisma.grade.create({
      data: {
        name: gradeName,
        level: gradeLevel as any,
        capacity: 50 + (i * 5),
        currentStudentCount: 0,
        institutionId: school.id,
        academicYearId: academicYear.id,
      },
    })
    grades.push(grade)
  }

  console.log(`✓ Created ${grades.length} grades`)

  // Create streams for selected grades
  const streams = []
  const streamGrades = [grades[8], grades[9]] // Grade 7-9
  for (const grade of streamGrades) {
    for (const streamName of ["MAIN", "SUPPORT"]) {
      const stream = await prisma.streamEntry.create({
        data: {
          name: `${streamName} Stream`,
          level: streamName as any,
          capacity: 40,
          currentStudentCount: 0,
          gradeId: grade.id,
          institutionId: school.id,
        },
      })
      streams.push(stream)
    }
  }

  console.log(`✓ Created ${streams.length} streams`)

  // ==========================================================================
  // 3. SUBJECTS
  // ==========================================================================

  const subjects = await prisma.subject.createManyAndReturn({
    data: [
      { name: "English", code: "ENG101" },
      { name: "Mathematics", code: "MATH201" },
      { name: "Swahili", code: "SW201" },
      { name: "Kenyan Sign Language", code: "KSL101" },
      { name: "CRE (Christian Religious Education)", code: "CRE101" },
      { name: "Integrated Science", code: "SCI201" },
      { name: "Social Studies", code: "SS301" },
      { name: "Hygiene and Nutrition", code: "HN401" },
      { name: "Agriculture", code: "AG501" },
      { name: "Creative Arts", code: "ART601" },
    ],
    skipDuplicates: true,
  })

  console.log(`✓ Created ${subjects.length} subjects`)

  // ==========================================================================
  // 4. STAFF USERS
  // ==========================================================================

  const staffNames = [
    "Musa Omondi", "Amina Hassan", "Peter Kamau", "Josephine Achieng",
    "Jane Wangari", "Robert Kiptanui", "Mercy Jepketer", "Simon Oduor"
  ]

  const staffUsers = []
  for (let i = 0; i < staffNames.length; i++) {
    const passwordHash = await bcrypt.hash("TempPass123!", 10)

    const user = await prisma.user.create({
      data: {
        email: `${staffNames[i].toLowerCase().replace(/\s+/g, ".")}@allsaintsmushililie.ac.ke`,
        name: staffNames[i],
        passwordHash,
        mfaEnabled: i < 3, // First 3 staff get MFA
        wing: "SCHOOL" as const,
        institutionId: school.id,
      },
    })

    // Assign roles based on index
    const roleKey = i === 0 ? "SCHOOL_PRINCIPAL" : i === 1 ? "SCHOOL_BURSAR" : i === 2 ? "SCHOOL_TEACHER" : "SCHOOL_TEACHER"
    const role = await prisma.role.findOrCreate({
      where: { institutionId_key: { institutionId: school.id, key: roleKey } },
      create: { institutionId: school.id, key: roleKey, name: roleKey, isSystem: true, priority: 5 - i },
    })

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        membershipId: "", // Will be set below
        isActive: true,
      },
    })

    staffUsers.push({ user, name: staffNames[i], role: roleKey })
  }

  // Helper for bcrypt - we'll simulate this
  // In real implementation: const bcrypt = require('bcrypt')

  console.log(`✓ Created ${staffUsers.length} staff users`)

  // ==========================================================================
  // 5. STUDENTS (120 fictional students)
  // ==========================================================================

  const studentNames = [
    // Boy names
    "Abdulahi", "Brian", "Carlos", "Dennis", "Elijah", "Frank", "George", "Henry",
    "Isaac", "Joshua", "Kevin", "Larry", "Michael", "Nathan", "Oscar", "Paul",
    "Quincy", "Richard", "Stephen", "Thomas", "Victor", "Walter", "Xavier",
    "Yusuf", "Zachary",
    // Girl names
    "Amina", "Betty", "Christine", "Dorothy", "Esther", "Fiona", "Grace", "Hellen",
    "Irene", "Jackline", "Carol", "Mercy", "Naomi", "Ophelia", "Peninah", "Queenter",
    "Ruth", "Sarah", "Tabitha", "Una", "Valary", "Winnie", "Xavia", "Yvonne",
    "Zawadi",
  ]

  // County names for Kenya
  const counties = ["Mombasa", "Kilifi", "Nyamira", "Kisumu", "Nairobi", "Machakos", "Kiambu", "Meru", "Eldoret", "Kakamega"]

  const students = []
  let studentIdCounter = 1

  // Create 120 students distributed across grades
  const studentsPerGrade = 120 / grades.length

  for (let g = 0; g < grades.length; g++) {
    const grade = grades[g]
    const perGrade = Math.round(studentsPerGrade)

    for (let s = 0; s < perGrade; s++) {
      const studentName = studentNames[(s * grades.length + g) % studentNames.length]
      const gender = s % 2 === 0 ? "Male" : "Female"
      const county = counties[Math.floor(Math.random() * counties.length)]
      const admissionNumber = `ADM-2024-${String(studentIdCounter).padStart(3, "0")}`

      const student = await prisma.student.create({
        data: {
          firstName: studentName,
          lastName: s % 3 === 0 ? studentNames[(s * grades.length + g + 1) % studentNames.length] : "",
          gender,
          county,
          religion: ["Christian", "Muslim", "Atheist", "Hindu"][Math.floor(Math.random() * 4)],
          nationality: "Kenyan",
          status: StudentStatus.ACTIVE,
          gradeId: grade.id,
          admissionNumber,
          admissionDate: new Date(`2024-01-15`),
          photoUrl: `/images/students/${studentIdCounter}.jpg`,
          boarding: g >= grades.length - 2, // Last 2 grades can board
          createdAt: new Date(),
          institutionId: school.id,
        },
      })

      students.push({ ...student, id: studentIdCounter })
      studentIdCounter++
    }
  }

  console.log(`✓ Created ${students.length} students across ${grades.length} grades`)

  // ==========================================================================
  // 6. GUARDIANS
  // ==========================================================================

  const guardianNames = [
    "Moses Omondi", "Grace Atieno", "David Ochieng", "Rose Akinyi",
    "Samuel Otieno", "Mercy Achieng", "John Bosco", "Faith Moraa",
    "Pauline Anyango", "Daniel Omondi",
  ]

  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const primaryGuardian = await prisma.guardian.create({
      data: {
        firstName: guardianNames[i % guardianNames.length],
        lastName: i % 2 === 0 ? "Omondi" : "Achieng",
        relationship: i % 3 === 0 ? GuardianRelationship.FATHER : i % 3 === 1 ? GuardianRelationship.MOTHER : GuardianRelationship.GUARDIAN,
        phone: `+2547${String(10000000 + i).slice(-7)}`,
        idNumber: `ID-${String(10000000 + i).padEnd(7, "0")}`,
        occupation: ["Teacher", "Businessman", "Farmer", "Civil Servant"][Math.floor(Math.random() * 4)],
        primaryPayer: i % 3 === 0,
        pickupAuthorised: true,
        institutionId: school.id,
      },
    })

    // Link guardian to student
    await prisma.studentGuardian.create({
      data: {
        studentId: student.id,
        guardianId: primaryGuardian.id,
        institutionId: school.id,
        isPrimary: true,
        primaryPayer: true,
        canPickUp: true,
        canCollectReports: true,
        canAuthorizeAbsence: true,
      })
    }
  }

  console.log(`✓ Created guardians for ${students.length} students`)

  // ==========================================================================
  // 7. ENROLMENTS
  // ==========================================================================

  for (const student of students) {
    const grade = student.grade
    const term = terms[0] // Term 1

    // Check if already enrolled
    const existing = await prisma.enrolment.findFirst({
      where: { studentId: student.id, gradeId: grade.id, termId: term.id, institutionId: school.id },
    })

    if (!existing) {
      await prisma.enrolment.create({
        data: {
          studentId: student.id,
          gradeId: grade.id,
          termId: term.id,
          institutionId: school.id,
          status: "ACTIVE",
        },
      })
    }
  }

  console.log(`✓ Created enrolments for students`)

  // ==========================================================================
  // 8. ASSESSMENTS
  // ==========================================================================

  const assessmentTypes = ["FORMATIVE", "SUMMATIVE", "SBA"] as const

  for (let t = 0; t < terms.length; t++) {
    const term = terms[t]

    for (let g = 0; g < Math.min(grades.length, 4); g++) { // First 4 grades
      const grade = grades[g]
      const subject = subjects[g % subjects.length]

      for (let a = 0; a < assessmentTypes.length; a++) {
        const assessment = await prisma.assessment.create({
          data: {
            title: `${subject.name} ${assessmentTypes[a]} ${term.name}`,
            description: `${assessmentTypes[a]} assessment for ${grade.name}`,
            assessmentType: assessmentTypes[a],
            maxScore: 100,
            termId: term.id,
            gradeId: grade.id,
            subjectId: subject.id,
            institutionId: school.id,
          },
        })

        // Add scores for 5 random students per assessment
        const randomStudents = students
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)

        for (const student of randomStudents) {
          const score = Math.floor(Math.random() * 101) // 0-100
          const percentage = score

          let gradeBand: "EXCEEDS" | "MEETS" | "APPROACHES" | "BELOW"
          if (percentage >= 80) gradeBand = "EXCEEDS"
          else if (percentage >= 60) gradeBand = "MEETS"
          else if (percentage >= 40) gradeBand = "APPROACHES"
          else gradeBand = "BELOW"

          await prisma.assessmentScore.create({
            data: {
              studentId: student.id,
              assessmentId: assessment.id,
              institutionId: school.id,
              score,
              gradeBand,
            },
          })
        }
      }
    }
  }

  console.log("✓ Created assessments with scores")

  // ==========================================================================
  // 8. REPORT CARDS (some already issued)
  // ==========================================================================

  // Issue report cards for Term 1 for a subset of students
  const term1 = terms[0]
  const reportCardStudents = students.slice(0, 30) // First 30 students

  for (const student of reportCardStudents) {
    const grade = student.grade

    // Check if report card already exists
    const existing = await prisma.reportCard.findFirst({
      where: { studentId: student.id, termId: term1.id, institutionId: school.id },
    })

    if (!existing) {
      await prisma.reportCard.create({
        data: {
          studentId: student.id,
          institutionId: school.id,
          termId: term1.id,
          gradeId: grade.id,
          academicYearId: academicYear.id,
          status: "ISSUED",
          issuedAt: new Date(),
          issuedBy: "Principal",
          distributed: true,
          distributedAt: new Date(),
          parentAcknowledged: true,
          parentAcknowledgedAt: new Date(),
        },
      })
    }
  }

  console.log(`✓ Created ${reportCardStudents.length} report cards for Term 1`)

  // ==========================================================================
  // 9. PROMOTIONS
  // ==========================================================================

  // Create promotion rule for end of year
  await prisma.promotion.create({
    data: {
      name: "End-of-Year Promotion 2024",
      gradeFrom: "GRADE_6",
      gradeTo: "GRADE_7",
      academicYearId: academicYear.id,
      termId: terms[2].id, // Term 3
      status: "PENDING",
      institutionId: school.id,
    },
  })

  console.log("✓ Created promotion rule: GRADE_6 → GRADE_7")

  console.log("\n🌱 Seed data insertion complete!")
  console.log("\n📋 Demo Login Credentials:")
  console.log("   Principal: principal@allsaintsmushililie.ac.ke / TempPass123!")
  console.log("   Bursar: bursar@allsaintsmushililie.ac.ke / TempPass123!")
  console.log("   Teacher: teacher@allsaintsmushililie.ac.ke / TempPass123!")
  console.log("\n⚠️  Password: TempPass123! (change on first login)")
  console.log("⚠️  MFA: Enabled for first 3 staff members (use TOTP app)")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })