
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.17.0
 * Query Engine version: 393aa359c9ad4a4bb28630fb5613f9c281cde053
 */
Prisma.prismaVersion = {
  client: "5.17.0",
  engine: "393aa359c9ad4a4bb28630fb5613f9c281cde053"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.InstitutionMembershipScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  status: 'status'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  sentById: 'sentById',
  type: 'type',
  title: 'title',
  message: 'message',
  read: 'read',
  readAt: 'readAt',
  createdAt: 'createdAt',
  metadata: 'metadata'
};

exports.Prisma.BackgroundJobScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  jobType: 'jobType',
  status: 'status',
  payload: 'payload',
  errorMessage: 'errorMessage',
  attempts: 'attempts',
  maxAttempts: 'maxAttempts',
  nextRunAt: 'nextRunAt',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  completedById: 'completedById',
  creatorId: 'creatorId',
  assigneeId: 'assigneeId'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  category: 'category',
  path: 'path',
  mimeType: 'mimeType',
  size: 'size',
  uploaderId: 'uploaderId',
  uploadedAt: 'uploadedAt',
  expiresAt: 'expiresAt',
  isActive: 'isActive'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  category: 'category',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  createdAt: 'createdAt',
  resolvedAt: 'resolvedAt',
  createdById: 'createdById',
  assignedById: 'assignedById'
};

exports.Prisma.TicketCommentScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  commenterId: 'commenterId',
  studentId: 'studentId',
  message: 'message',
  createdAt: 'createdAt'
};

exports.Prisma.SchoolRelationScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  type: 'type',
  relatedId: 'relatedId',
  details: 'details',
  createdAt: 'createdAt'
};

exports.Prisma.ParishRelationScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  type: 'type',
  relatedId: 'relatedId',
  details: 'details',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  phone: 'phone',
  phoneVerified: 'phoneVerified',
  passwordHash: 'passwordHash',
  name: 'name',
  avatarUrl: 'avatarUrl',
  status: 'status',
  timezone: 'timezone',
  locale: 'locale',
  mfaEnabled: 'mfaEnabled',
  mfaSecret: 'mfaSecret',
  backupCodes: 'backupCodes',
  lastLoginAt: 'lastLoginAt',
  lastLoginIp: 'lastLoginIp',
  failedLoginAttempts: 'failedLoginAttempts',
  lockedUntil: 'lockedUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  wing: 'wing',
  institutionId: 'institutionId'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  deviceName: 'deviceName',
  isCurrent: 'isCurrent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires',
  type: 'type'
};

exports.Prisma.InstitutionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  type: 'type',
  status: 'status',
  description: 'description',
  logoUrl: 'logoUrl',
  address: 'address',
  city: 'city',
  county: 'county',
  country: 'country',
  phone: 'phone',
  email: 'email',
  website: 'website',
  timezone: 'timezone',
  currency: 'currency',
  dateFormat: 'dateFormat',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  description: 'description',
  scope: 'scope',
  resource: 'resource',
  action: 'action',
  isSystem: 'isSystem',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  key: 'key',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  priority: 'priority',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId',
  grantedAt: 'grantedAt',
  grantedById: 'grantedById'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  roleId: 'roleId',
  membershipId: 'membershipId',
  assignedAt: 'assignedAt',
  assignedById: 'assignedById',
  staffRoleId: 'staffRoleId',
  expiresAt: 'expiresAt',
  isActive: 'isActive'
};

exports.Prisma.AuditEventScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  institutionId: 'institutionId',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId',
  targetName: 'targetName',
  oldValues: 'oldValues',
  newValues: 'newValues',
  metadata: 'metadata',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId',
  sessionId: 'sessionId',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicYearScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  termCount: 'termCount',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.TermScalarFieldEnum = {
  id: 'id',
  academicYearId: 'academicYearId',
  institutionId: 'institutionId',
  name: 'name',
  ordinal: 'ordinal',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GradeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  level: 'level',
  formTeacher: 'formTeacher',
  roomNumber: 'roomNumber',
  capacity: 'capacity',
  currentStudentCount: 'currentStudentCount',
  academicYearId: 'academicYearId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StreamEntryScalarFieldEnum = {
  id: 'id',
  gradeId: 'gradeId',
  institutionId: 'institutionId',
  name: 'name',
  level: 'level',
  capacity: 'capacity',
  currentStudentCount: 'currentStudentCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubjectScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  code: 'code',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.AssessmentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  termId: 'termId',
  gradeId: 'gradeId',
  subjectId: 'subjectId',
  assessmentType: 'assessmentType',
  title: 'title',
  description: 'description',
  rubric: 'rubric',
  maxScore: 'maxScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.AssessmentScoreScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  assessmentId: 'assessmentId',
  studentId: 'studentId',
  score: 'score',
  gradeBand: 'gradeBand',
  comments: 'comments',
  assessedBy: 'assessedBy',
  assessedAt: 'assessedAt'
};

exports.Prisma.ReportCardScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  termId: 'termId',
  gradeId: 'gradeId',
  academicYearId: 'academicYearId',
  issuedAt: 'issuedAt',
  issuedBy: 'issuedBy',
  status: 'status',
  pdfGenerated: 'pdfGenerated',
  pdfUrl: 'pdfUrl',
  distributed: 'distributed',
  distributedAt: 'distributedAt',
  parentAcknowledged: 'parentAcknowledged',
  parentAcknowledgedAt: 'parentAcknowledgedAt'
};

exports.Prisma.TimetableScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  gradeId: 'gradeId',
  termId: 'termId',
  name: 'name',
  description: 'description',
  isRecurring: 'isRecurring',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.TimetableLineScalarFieldEnum = {
  id: 'id',
  timetableId: 'timetableId',
  dayOfWeek: 'dayOfWeek',
  period: 'period',
  subjectId: 'subjectId',
  teacherId: 'teacherId',
  classroom: 'classroom',
  isDoublePeriod: 'isDoublePeriod'
};

exports.Prisma.LessonPlanScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  gradeId: 'gradeId',
  subjectId: 'subjectId',
  termId: 'termId',
  weekNumber: 'weekNumber',
  title: 'title',
  description: 'description',
  objectives: 'objectives',
  activities: 'activities',
  resources: 'resources',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.DisciplineIncidentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  teacherId: 'teacherId',
  category: 'category',
  actionTaken: 'actionTaken',
  description: 'description',
  date: 'date',
  severity: 'severity',
  parentNotified: 'parentNotified',
  parentNotifiedAt: 'parentNotifiedAt',
  resolved: 'resolved',
  resolvedAt: 'resolvedAt',
  resolvedBy: 'resolvedBy',
  metadata: 'metadata'
};

exports.Prisma.ClubScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  type: 'type',
  description: 'description',
  leaderId: 'leaderId',
  meetingSchedule: 'meetingSchedule',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.ClubMemberScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  clubId: 'clubId',
  studentId: 'studentId',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt',
  role: 'role',
  isActive: 'isActive'
};

exports.Prisma.KPSEARegistrationScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  registrationNumber: 'registrationNumber',
  entryYear: 'entryYear',
  targetSecondarySchool: 'targetSecondarySchool',
  performanceIndex: 'performanceIndex',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KJSEARegistrationScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  registrationNumber: 'registrationNumber',
  entryYear: 'entryYear',
  targetSecondarySchool: 'targetSecondarySchool',
  performanceIndex: 'performanceIndex',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffRoleScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  key: 'key',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  priority: 'priority',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  roleId: 'roleId',
  employmentTypeId: 'employmentTypeId',
  dateOfJoining: 'dateOfJoining',
  dateOfBirth: 'dateOfBirth',
  phone: 'phone',
  address: 'address',
  emergencyPhone: 'emergencyPhone',
  photoUrl: 'photoUrl',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmploymentTypeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  key: 'key',
  name: 'name',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveTypeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  key: 'key',
  name: 'name',
  daysPerYear: 'daysPerYear',
  isPaid: 'isPaid',
  requiresApproval: 'requiresApproval',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  leaveTypeId: 'leaveTypeId',
  startDate: 'startDate',
  endDate: 'endDate',
  daysRequested: 'daysRequested',
  status: 'status',
  reason: 'reason',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmergencyContactScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  name: 'name',
  relationship: 'relationship',
  phone: 'phone',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt'
};

exports.Prisma.StatutoryDeductionScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  year: 'year',
  shifRate: 'shifRate',
  housingLevyRate: 'housingLevyRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayeBandScalarFieldEnum = {
  id: 'id',
  statutoryDeductionId: 'statutoryDeductionId',
  minSalary: 'minSalary',
  maxSalary: 'maxSalary',
  rate: 'rate'
};

exports.Prisma.EmployeeRateScalarFieldEnum = {
  id: 'id',
  statutoryDeductionId: 'statutoryDeductionId',
  employeePercent: 'employeePercent',
  employerPercent: 'employerPercent',
  maxMonthly: 'maxMonthly',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayslipScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  payrollRunId: 'payrollRunId',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  basicSalary: 'basicSalary',
  grossSalary: 'grossSalary',
  totalDeductions: 'totalDeductions',
  netSalary: 'netSalary',
  taxCode: 'taxCode',
  payPeriod: 'payPeriod',
  payDate: 'payDate',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayslipLineScalarFieldEnum = {
  id: 'id',
  payslipId: 'payslipId',
  description: 'description',
  amount: 'amount',
  type: 'type',
  taxCategory: 'taxCategory',
  createdAt: 'createdAt'
};

exports.Prisma.ContractScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  title: 'title',
  basicSalary: 'basicSalary',
  benefits: 'benefits',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  paymentSchedule: 'paymentSchedule',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConsentPreferenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  institutionId: 'institutionId',
  purpose: 'purpose',
  channel: 'channel',
  granted: 'granted',
  grantedAt: 'grantedAt',
  revokedAt: 'revokedAt',
  source: 'source',
  evidence: 'evidence',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DormitoryScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  type: 'type',
  capacity: 'capacity',
  currentOccupancy: 'currentOccupancy',
  wing: 'wing',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoomScalarFieldEnum = {
  id: 'id',
  dormitoryId: 'dormitoryId',
  roomNumber: 'roomNumber',
  roomType: 'roomType',
  capacity: 'capacity',
  currentStudents: 'currentStudents',
  wing: 'wing',
  isActive: 'isActive',
  features: 'features',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoomAssignmentScalarFieldEnum = {
  id: 'id',
  roomId: 'roomId',
  dormitoryId: 'dormitoryId',
  studentId: 'studentId',
  assignedAt: 'assignedAt',
  assignedBy: 'assignedBy',
  leaseStart: 'leaseStart',
  leaseEnd: 'leaseEnd',
  isCurrent: 'isCurrent',
  rentAmount: 'rentAmount'
};

exports.Prisma.ExeatPassScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  requestedBy: 'requestedBy',
  reason: 'reason',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.BoardingFeeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  dormitoryId: 'dormitoryId',
  name: 'name',
  description: 'description',
  amount: 'amount',
  isMandatory: 'isMandatory',
  applicableGrades: 'applicableGrades',
  wing: 'wing',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DormitoryRuleScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  description: 'description',
  category: 'category',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  registrationNumber: 'registrationNumber',
  model: 'model',
  year: 'year',
  capacity: 'capacity',
  fuelType: 'fuelType',
  licenseExpires: 'licenseExpires',
  insuranceExpires: 'insuranceExpires',
  status: 'status',
  purchasedDate: 'purchasedDate',
  purchasePrice: 'purchasePrice',
  notes: 'notes',
  wing: 'wing',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RouteScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  description: 'description',
  wing: 'wing',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RouteStopScalarFieldEnum = {
  id: 'id',
  routeId: 'routeId',
  stopName: 'stopName',
  order: 'order',
  latitude: 'latitude',
  longitude: 'longitude',
  contactPhone: 'contactPhone',
  timeWindow: 'timeWindow',
  isActive: 'isActive'
};

exports.Prisma.RouteAssignmentScalarFieldEnum = {
  id: 'id',
  routeId: 'routeId',
  studentId: 'studentId',
  assignedAt: 'assignedAt',
  assignedBy: 'assignedBy',
  isCurrent: 'isCurrent',
  vehicleId: 'vehicleId'
};

exports.Prisma.VehicleMaintenanceScalarFieldEnum = {
  id: 'id',
  vehicleId: 'vehicleId',
  maintenanceType: 'maintenanceType',
  description: 'description',
  plannedDate: 'plannedDate',
  completedDate: 'completedDate',
  cost: 'cost',
  mileageAtService: 'mileageAtService',
  performedBy: 'performedBy',
  status: 'status'
};

exports.Prisma.TransportFeeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  description: 'description',
  amount: 'amount',
  isMandatory: 'isMandatory',
  applicableGrades: 'applicableGrades',
  wing: 'wing',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  isbn: 'isbn',
  author: 'author',
  coAuthor: 'coAuthor',
  publisher: 'publisher',
  publicationYear: 'publicationYear',
  category: 'category',
  description: 'description',
  pageCount: 'pageCount',
  language: 'language',
  copiesTotal: 'copiesTotal',
  copiesAvailable: 'copiesAvailable',
  coverImageUrl: 'coverImageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  libraryCategoryId: 'libraryCategoryId'
};

exports.Prisma.BorrowRecordScalarFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  studentId: 'studentId',
  issuedAt: 'issuedAt',
  dueDate: 'dueDate',
  returnedAt: 'returnedAt',
  status: 'status',
  fineAmount: 'fineAmount',
  finePaid: 'finePaid',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReserveRecordScalarFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  studentId: 'studentId',
  requestedAt: 'requestedAt',
  fulfilledAt: 'fulfilledAt',
  status: 'status'
};

exports.Prisma.LibraryFineScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  fineName: 'fineName',
  description: 'description',
  amount: 'amount',
  fineType: 'fineType',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LibraryCategoryScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  gradeId: 'gradeId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  termId: 'termId',
  date: 'date',
  status: 'status'
};

exports.Prisma.SchoolCalendarEventScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  termId: 'termId',
  title: 'title',
  startDate: 'startDate',
  endDate: 'endDate'
};

exports.Prisma.GuardianScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  otherNames: 'otherNames',
  relationship: 'relationship',
  phone: 'phone',
  idNumber: 'idNumber',
  idNumberVerified: 'idNumberVerified',
  occupation: 'occupation',
  employer: 'employer',
  primaryPayer: 'primaryPayer',
  pickupAuthorised: 'pickupAuthorised',
  email: 'email',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentGuardianScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  guardianId: 'guardianId',
  isPrimary: 'isPrimary',
  primaryPayer: 'primaryPayer',
  canPickUp: 'canPickUp',
  canCollectReports: 'canCollectReports',
  canAuthorizeAbsence: 'canAuthorizeAbsence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdmissionScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  applicantFirstName: 'applicantFirstName',
  applicantLastName: 'applicantLastName',
  applicantOtherNames: 'applicantOtherNames',
  applicantEmail: 'applicantEmail',
  applicantPhone: 'applicantPhone',
  currentSchool: 'currentSchool',
  gradeApplyingFor: 'gradeApplyingFor',
  source: 'source',
  referredBy: 'referredBy',
  notes: 'notes',
  admissionStatus: 'admissionStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EnrolmentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  studentId: 'studentId',
  gradeId: 'gradeId',
  termId: 'termId',
  admissionId: 'admissionId',
  status: 'status',
  enrolledAt: 'enrolledAt',
  withdrawnAt: 'withdrawnAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.InstitutionMembershipStatus = exports.$Enums.InstitutionMembershipStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  REVOKED: 'REVOKED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  SYSTEM: 'SYSTEM',
  SECURITY: 'SECURITY',
  ACADEMIC: 'ACADEMIC',
  DISCIPLINE: 'DISCIPLINE',
  FINANCIAL: 'FINANCIAL',
  GIVING: 'GIVING',
  EVENT: 'EVENT',
  CONSENT: 'CONSENT'
};

exports.BackgroundJobStatus = exports.$Enums.BackgroundJobStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.DocumentCategory = exports.$Enums.DocumentCategory = {
  IDENTITY: 'IDENTITY',
  ACADEMIC: 'ACADEMIC',
  FINANCIAL: 'FINANCIAL',
  CONSENT: 'CONSENT',
  DISCIPLINE: 'DISCIPLINE',
  OTHER: 'OTHER'
};

exports.TicketCategory = exports.$Enums.TicketCategory = {
  GENERAL: 'GENERAL',
  ACADEMIC: 'ACADEMIC',
  FINANCIAL: 'FINANCIAL',
  DISCIPLINE: 'DISCIPLINE',
  FACILITY: 'FACILITY',
  OTHER: 'OTHER'
};

exports.SchoolRelationType = exports.$Enums.SchoolRelationType = {
  ADMISSION: 'ADMISSION',
  ENROLMENT: 'ENROLMENT',
  GRADE_ASSIGNMENT: 'GRADE_ASSIGNMENT',
  TRANSFER: 'TRANSFER',
  WITHDRAWAL: 'WITHDRAWAL'
};

exports.ParishRelationType = exports.$Enums.ParishRelationType = {
  ADMISSION: 'ADMISSION',
  ENROLMENT: 'ENROLMENT',
  GRADE_ASSIGNMENT: 'GRADE_ASSIGNMENT',
  TRANSFER: 'TRANSFER',
  WITHDRAWAL: 'WITHDRAWAL'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ARCHIVED: 'ARCHIVED'
};

exports.Wing = exports.$Enums.Wing = {
  SCHOOL: 'SCHOOL',
  PARISH: 'PARISH',
  SHARED: 'SHARED'
};

exports.InstitutionType = exports.$Enums.InstitutionType = {
  SCHOOL: 'SCHOOL',
  PARISH: 'PARISH'
};

exports.InstitutionStatus = exports.$Enums.InstitutionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED'
};

exports.PermissionScope = exports.$Enums.PermissionScope = {
  GLOBAL: 'GLOBAL',
  INSTITUTION: 'INSTITUTION',
  RESOURCE: 'RESOURCE'
};

exports.AuditAction = exports.$Enums.AuditAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ROLE_ASSIGN: 'ROLE_ASSIGN',
  ROLE_REVOKE: 'ROLE_REVOKE',
  PERMISSION_GRANT: 'PERMISSION_GRANT',
  PERMISSION_REVOKE: 'PERMISSION_REVOKE',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  PAYMENT_INITIATE: 'PAYMENT_INITIATE',
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  GRADE_PUBLISH: 'GRADE_PUBLISH',
  GRADE_CHANGE: 'GRADE_CHANGE',
  FINANCIAL_ADJUSTMENT: 'FINANCIAL_ADJUSTMENT',
  ADMISSION_CREATE: 'ADMISSION_CREATE',
  ADMISSION_UPDATE: 'ADMISSION_UPDATE',
  STUDENT_CREATE: 'STUDENT_CREATE',
  GUARDIAN_CREATE: 'GUARDIAN_CREATE',
  ENROLMENT_CREATE: 'ENROLMENT_CREATE',
  ASSESSMENT_CREATE: 'ASSESSMENT_CREATE',
  REPORT_CARD_ISSUE: 'REPORT_CARD_ISSUE',
  FEE_STRUCTURE_CREATE: 'FEE_STRUCTURE_CREATE',
  FEE_ITEM_CREATE: 'FEE_ITEM_CREATE',
  INVOICE_CREATE: 'INVOICE_CREATE',
  CONSENT_UPDATE: 'CONSENT_UPDATE',
  WING_SWITCH: 'WING_SWITCH',
  ACADEMIC_YEAR_CREATE: 'ACADEMIC_YEAR_CREATE',
  TERM_CREATE: 'TERM_CREATE',
  GRADE_CREATE: 'GRADE_CREATE',
  ASSESSMENT_SCORE_ENTER: 'ASSESSMENT_SCORE_ENTER',
  REPORT_CARD_DISTRIBUTE: 'REPORT_CARD_DISTRIBUTE',
  DISCIPLINE_LOG: 'DISCIPLINE_LOG',
  CLUB_MEMBERSHIP_CREATE: 'CLUB_MEMBERSHIP_CREATE',
  EXAM_REGISTRATION: 'EXAM_REGISTRATION',
  KPSEA_REGISTRATION: 'KPSEA_REGISTRATION',
  KJSEA_REGISTRATION: 'KJSEA_REGISTRATION'
};

exports.AssessmentType = exports.$Enums.AssessmentType = {
  FORMATIVE: 'FORMATIVE',
  SUMMATIVE: 'SUMMATIVE',
  SBA: 'SBA'
};

exports.AssessmentScoreBand = exports.$Enums.AssessmentScoreBand = {
  EXCEEDS: 'EXCEEDS',
  MEETS: 'MEETS',
  APPROACHES: 'APPROACHES',
  BELOW: 'BELOW'
};

exports.DisciplineCategory = exports.$Enums.DisciplineCategory = {
  ACADEMIC_MISCONDUCT: 'ACADEMIC_MISCONDUCT',
  BEHAVIOR: 'BEHAVIOR',
  ATTENDANCE: 'ATTENDANCE',
  UNIFORM_VIOLATION: 'UNIFORM_VIOLATION',
  OTHER: 'OTHER'
};

exports.DisciplineAction = exports.$Enums.DisciplineAction = {
  WARNING: 'WARNING',
  PARENT_CONFERENCE: 'PARENT_CONFERENCE',
  DETENTION: 'DETENTION',
  SUSPENSION: 'SUSPENSION',
  EXPULSION: 'EXPULSION',
  COUNSELLING: 'COUNSELLING'
};

exports.ClubType = exports.$Enums.ClubType = {
  SCIENCE_MATH: 'SCIENCE_MATH',
  LITERARY: 'LITERARY',
  PATRIOTIC: 'PATRIOTIC',
  MUSIC_DRAMA: 'MUSIC_DRAMA',
  SPORTS: 'SPORTS',
  SCOUTS: 'SCOUTS',
  CU: 'CU',
  OTHER: 'OTHER'
};

exports.StaffStatus = exports.$Enums.StaffStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  TERMINATED: 'TERMINATED'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  IN_APP: 'IN_APP',
  PUSH: 'PUSH'
};

exports.RoomType = exports.$Enums.RoomType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  TRIPLE: 'TRIPLE'
};

exports.ExeatStatus = exports.$Enums.ExeatStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.DormitoryCategory = exports.$Enums.DormitoryCategory = {
  CURFEW: 'CURFEW',
  VISITING: 'VISITING',
  CONDUCT: 'CONDUCT',
  EQUIPMENT: 'EQUIPMENT',
  OTHER: 'OTHER'
};

exports.FuelType = exports.$Enums.FuelType = {
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  LPG: 'LPG'
};

exports.VehicleStatus = exports.$Enums.VehicleStatus = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED'
};

exports.MaintenanceType = exports.$Enums.MaintenanceType = {
  SERVICE: 'SERVICE',
  REPAIR: 'REPAIR',
  INSPECTION: 'INSPECTION',
  CLEANING: 'CLEANING'
};

exports.MaintenanceStatus = exports.$Enums.MaintenanceStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

exports.PublicationCategory = exports.$Enums.PublicationCategory = {
  FICTION: 'FICTION',
  NON_FICTION: 'NON_FICTION',
  REFERENCE: 'REFERENCE',
  TEXTBOOK: 'TEXTBOOK',
  BIOGRAPHY: 'BIOGRAPHY',
  OTHER: 'OTHER'
};

exports.Language = exports.$Enums.Language = {
  ENGLISH: 'ENGLISH',
  SWAHILI: 'SWAHILI',
  OTHER: 'OTHER'
};

exports.ExeatRecordStatus = exports.$Enums.ExeatRecordStatus = {
  ISSUED: 'ISSUED',
  RETURNED: 'RETURNED',
  LOST: 'LOST',
  DAMAGED: 'DAMAGED'
};

exports.ReserveStatus = exports.$Enums.ReserveStatus = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED'
};

exports.FineType = exports.$Enums.FineType = {
  OVERDUE: 'OVERDUE',
  LOST: 'LOST',
  DAMAGED: 'DAMAGED'
};

exports.StudentStatus = exports.$Enums.StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  GRADUATED: 'GRADUATED',
  SUSPENDED: 'SUSPENDED',
  WITHDRAWN: 'WITHDRAWN',
  ON_LEAVE: 'ON_LEAVE'
};

exports.GuardianRelationship = exports.$Enums.GuardianRelationship = {
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  GUARDIAN: 'GUARDIAN',
  GRANDPARENT: 'GRANDPARENT',
  AUNT: 'AUNT',
  UNCLE: 'UNCLE',
  OTHER: 'OTHER'
};

exports.GradeLevel = exports.$Enums.GradeLevel = {
  PP1: 'PP1',
  PP2: 'PP2',
  GRADE_1: 'GRADE_1',
  GRADE_2: 'GRADE_2',
  GRADE_3: 'GRADE_3',
  GRADE_4: 'GRADE_4',
  GRADE_5: 'GRADE_5',
  GRADE_6: 'GRADE_6',
  GRADE_7: 'GRADE_7',
  GRADE_8: 'GRADE_8',
  GRADE_9: 'GRADE_9',
  FORM_1: 'FORM_1',
  FORM_2: 'FORM_2',
  FORM_3: 'FORM_3',
  FORM_4: 'FORM_4'
};

exports.AdmissionStatus = exports.$Enums.AdmissionStatus = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  ASSESSED: 'ASSESSED',
  OFFER_EXTENDED: 'OFFER_EXTENDED',
  ACCEPTED: 'ACCEPTED',
  ENROLLED: 'ENROLLED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  WAITLISTED: 'WAITLISTED'
};

exports.Prisma.ModelName = {
  InstitutionMembership: 'InstitutionMembership',
  Notification: 'Notification',
  BackgroundJob: 'BackgroundJob',
  Document: 'Document',
  Ticket: 'Ticket',
  TicketComment: 'TicketComment',
  SchoolRelation: 'SchoolRelation',
  ParishRelation: 'ParishRelation',
  User: 'User',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Institution: 'Institution',
  Permission: 'Permission',
  Role: 'Role',
  RolePermission: 'RolePermission',
  UserRole: 'UserRole',
  AuditEvent: 'AuditEvent',
  AcademicYear: 'AcademicYear',
  Term: 'Term',
  Grade: 'Grade',
  StreamEntry: 'StreamEntry',
  Subject: 'Subject',
  Assessment: 'Assessment',
  AssessmentScore: 'AssessmentScore',
  ReportCard: 'ReportCard',
  Timetable: 'Timetable',
  TimetableLine: 'TimetableLine',
  LessonPlan: 'LessonPlan',
  DisciplineIncident: 'DisciplineIncident',
  Club: 'Club',
  ClubMember: 'ClubMember',
  KPSEARegistration: 'KPSEARegistration',
  KJSEARegistration: 'KJSEARegistration',
  StaffRole: 'StaffRole',
  Staff: 'Staff',
  EmploymentType: 'EmploymentType',
  LeaveType: 'LeaveType',
  LeaveRequest: 'LeaveRequest',
  EmergencyContact: 'EmergencyContact',
  StatutoryDeduction: 'StatutoryDeduction',
  PayeBand: 'PayeBand',
  EmployeeRate: 'EmployeeRate',
  Payslip: 'Payslip',
  PayslipLine: 'PayslipLine',
  Contract: 'Contract',
  ConsentPreference: 'ConsentPreference',
  Dormitory: 'Dormitory',
  Room: 'Room',
  RoomAssignment: 'RoomAssignment',
  ExeatPass: 'ExeatPass',
  BoardingFee: 'BoardingFee',
  DormitoryRule: 'DormitoryRule',
  Vehicle: 'Vehicle',
  Route: 'Route',
  RouteStop: 'RouteStop',
  RouteAssignment: 'RouteAssignment',
  VehicleMaintenance: 'VehicleMaintenance',
  TransportFee: 'TransportFee',
  Book: 'Book',
  BorrowRecord: 'BorrowRecord',
  ReserveRecord: 'ReserveRecord',
  LibraryFine: 'LibraryFine',
  LibraryCategory: 'LibraryCategory',
  Student: 'Student',
  Attendance: 'Attendance',
  SchoolCalendarEvent: 'SchoolCalendarEvent',
  Guardian: 'Guardian',
  StudentGuardian: 'StudentGuardian',
  Admission: 'Admission',
  Enrolment: 'Enrolment'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
