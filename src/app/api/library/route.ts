"use server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [books, members, loans, returns] = await Promise.all([
      // Books
      prisma.book.findMany({
        include: {
          category: true,
        },
        orderBy: { title: "asc" },
      }),
      prisma.member.findMany({
        include: {
          user: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.loan.findMany({
        include: {
          book: true,
          member: true,
        },
        orderBy: { borrowedDate: "desc" },
      }),
      prisma.returnRecord.findMany({
        include: {
          book: true,
          member: true,
        },
        orderBy: { processedAt: "desc" },
      }),
    ])

    return new Response(
      JSON.stringify({
        data: {
          books,
          members,
          loans,
          returns,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Library API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch library data" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}