/* eslint-disable react/prop-types */
import { NextResponse } from "next/server"
import { prisma } from "@/src/server/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const guardianId = searchParams.get("guardianId")

  try {
    switch (action) {
      case "children": {
        // List children linked to guardian
        const children = await prisma.student.findMany({
          where: {
            guardianId: guardianId,
            institutionId: "inst-school-1",
          },
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
            admissions: {
              select: {
                admissionNumber: true,
              },
            },
            _count: {
              select: {
                attendances: true,
              },
            },
            feePayments: {
              select: {
                amount: true,
                status: true,
              },
              orderBy: {
                transactionDate: "desc",
              },
              take: 1,
            },
          },
          take: 10,
        })

        const childrenWithBalance = children.map((student) => {
          const latestPayment = student.feePayments[0]
          const totalPaid = latestPayment?.amount || 0
          // Calculate balance - simplified: assume full fees are 50000 per term
          const fullFees = 50000
          const balance = Math.max(0, fullFees - totalPaid)

          // Get attendance percentage
          const totalAttended = student._count.attendances
          const attendancePercentage = totalAttended > 0 ? Math.round((totalAttended / 100) * 100) : 0

          return {
            id: student.id,
            admissionNumber: student.admissions[0]?.admissionNumber || "—",
            fullName: student.user?.fullName || "—",
            grade: "—", // Would come from enrolment
            attendancePercentage,
            feeBalance: balance,
            isBoarding: false, // Would come from student profile
          }
        })

        return NextResponse.json({ children: childrenWithBalance })
      }

      case "invoices": {
        // List outstanding invoices for guardian's children
        const invoices = await prisma.invoice.findMany({
          where: {
            institutionId: "inst-school-1",
            status: {
              not: "FULLY_PAID",
            },
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            dueDate: "asc",
          },
          take: 20,
        })

        const formattedInvoices = invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          amountPaid: invoice.amountPaid,
          amountRemaining: invoice.amountRemaining,
          dueDate: invoice.dueDate,
          status: invoice.status,
          studentName: invoice.student.user?.fullName || "—",
          admissionNumber: invoice.student.admissions?.[0]?.admissionNumber || "—",
        }))

        return NextResponse.json({ invoices: formattedInvoices })
      }

      case "receipts": {
        // List receipts for guardian's children
        const receipts = await prisma.receipt.findMany({
          where: {
            institutionId: "inst-school-1",
          },
          include: {
            payment: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
          orderBy: {
            issueDate: "desc",
          },
          take: 20,
        })

        const formattedReceipts = receipts.map((receipt) => ({
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          amount: receipt.amount,
          paymentMethod: receipt.paymentMethod,
          issueDate: receipt.issueDate,
          status: receipt.status,
          acknowledged: receipt.parentAcknowledged,
          studentName: receipt.payment.student.user?.fullName || "—",
          admissionNumber: receipt.payment.student.admissions?.[0]?.admissionNumber || "—",
          qrCodeData: receipt.qrCodeData,
        }))

        return NextResponse.json({ receipts: formattedReceipts })
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Parent API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "record-payment": {
        const { institutionId, invoiceId, paymentType, ...paymentData } = params

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            invoiceId: invoiceId,
            amount: paymentData.amount || 0,
            paymentMethod: paymentType,
            reference: paymentData.reference || `REF-${Date.now()}`,
            status: "SUCCESS",
            transactionDate: new Date(),
          },
        })

        // Update invoice
        const updateData: any = {
          amountPaid: {
            increment: payment.amount,
          },
        }

        if (payment.amount >= paymentData.totalAmount) {
          updateData.amountRemaining = 0
          updateData.status = "FULLY_PAID"
        } else if (payment.amount > 0) {
          updateData.status = "PARTIALLY_PAID"
        }

        await prisma.invoice.update({
          where: { id: invoiceId },
          data: updateData,
        })

        // If fully paid, auto-generate receipt
        if (payment.amount >= paymentData.totalAmount) {
          const existingReceipt = await prisma.receipt.findFirst({
            where: { invoiceId: invoiceId },
          })

          if (!existingReceipt) {
            const receipt = await prisma.receipt.create({
              data: {
                institutionId: institutionId || "inst-school-1",
                paymentId: payment.id,
                receiptNumber: `RCPT-${invoiceId}-${Date().getTime().toString().slice(-6)}`,
                amount: payment.amount,
                paymentMethod: paymentType,
                issueDate: new Date(),
                status: "ISSUED",
                qrCodeData: JSON.stringify({
                  type: "receipt",
                  id: receipt.id,
                  institutionId: institutionId || "inst-school-1",
                  invoiceId: invoiceId,
                  amount: payment.amount,
                  paymentMethod: paymentType,
                  issuedAt: new Date().toISOString(),
                }),
                parentAcknowledged: false,
              },
            })
            return NextJSON(receipt)
          }
        }

        return NextJSON(payment)
      }

      case "acknowledge-receipt": {
        const { receiptId } = params

        const receipt = await prisma.receipt.update({
          where: { id: receiptId },
          data: {
            parentAcknowledged: true,
            parentAcknowledgedAt: new Date(),
          },
        })

        return NextJSON(receipt)
      }

      case "acknowledge-report": {
        const { reportId } = params

        // Note: report cards use a different model; this is a placeholder
        // In full implementation, would update a report acknowledgment flag
        return NextJSON({ acknowledged: true })
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Parent API POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper to wrap prisma results in JSON response
function NextJSON(data: any) {
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

// Helper for error responses
function NextError(message: string, status = 500) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}