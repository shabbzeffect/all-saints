import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: "FICTION" | "NON_FICTION" | "REFERENCE" | "BIOGRAPHY" | "CHILDREN"
  publisher: string
  publishedYear: number
  totalCopies: number
  availableCopies: number
  language: string
  description: string
  location: "SHELVES" | "STORAGE" | "PROCESSING"
  condition: "NEW" | "GOOD" | "FAIR" | "POOR"
}

interface BookFilter {
  category?: "FICTION" | "NON_FICTION" | "REFERENCE" | "BIOGRAPHY" | "CHILDREN"
  searchTerm?: string
  minAvailable?: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as "FICTION" | "NON_FICTION" | "REFERENCE" | "BIOGRAPHY" | "CHILDREN" || undefined
    const searchTerm = searchParams.get("search") || ""
    const minAvailable = searchParams.get("minAvailable") ? Number(searchParams.get("minAvailable")) : undefined

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (category) {
      where.category = category
    }
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } },
        { isbn: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ]
    }
    if (minAvailable !== undefined) {
      where.availableCopies = { gte: minAvailable }
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: books,
    })
  } catch (error) {
    console.error("Library books error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch books" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newBook = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        isbn: body.isbn,
        category: body.category,
        publisher: body.publisher,
        publishedYear: body.publishedYear,
        totalCopies: body.totalCopies,
        availableCopies: body.availableCopies ?? body.totalCopies,
        language: body.language,
        description: body.description,
        location: "PROCESSING",
        condition: "NEW",
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

    return NextResponse.json({
      success: true,
      data: newBook,
      message: "Book added successfully",
    })
  } catch (error) {
    console.error("Create book error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create book" },
      { status: 500 }
    )
  }
}