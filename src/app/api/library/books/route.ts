/* Library Books API - SaintsHub Library
 * GET  /api/library/books  -> list books (?category=&search=&minAvailable=)  [portal:staff:read]
 * POST /api/library/books  -> add a book                                     [portal:staff:write]
 */

import { NextResponse } from "next/server"
import { PublicationCategory, Language } from "@prisma/client"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

const CATEGORIES = Object.values(PublicationCategory)
const LANGUAGES = Object.values(Language)

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const searchTerm = (searchParams.get("search") ?? "").trim()
    const minAvailable = searchParams.get("minAvailable")

    const where: any = { institutionId: membership.institutionId }
    if (category && CATEGORIES.includes(category as PublicationCategory)) {
      where.category = category
    }
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } },
        { isbn: { contains: searchTerm, mode: "insensitive" } },
      ]
    }
    if (minAvailable) {
      const min = parseInt(minAvailable, 10)
      if (Number.isFinite(min)) where.copiesAvailable = { gte: min }
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
      take: 100,
    })
    return NextResponse.json({ success: true, data: books })
  } catch (error) {
    console.error("Library books error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = await request.json()
    const title = String(body.title ?? "").trim()
    const author = String(body.author ?? "").trim()
    const publicationYear = parseInt(body.publicationYear, 10)
    const copiesTotal = parseInt(body.copiesTotal, 10)

    if (!title || !author) {
      return NextResponse.json({ success: false, error: "title and author are required" }, { status: 400 })
    }
    if (!Number.isFinite(publicationYear) || publicationYear < 1000 || publicationYear > 2100) {
      return NextResponse.json({ success: false, error: "publicationYear is required" }, { status: 400 })
    }
    if (!Number.isFinite(copiesTotal) || copiesTotal < 1) {
      return NextResponse.json({ success: false, error: "copiesTotal must be at least 1" }, { status: 400 })
    }
    const category = CATEGORIES.includes(body.category) ? body.category : PublicationCategory.OTHER

    const book = await prisma.book.create({
      data: {
        institutionId: membership.institutionId,
        title,
        author,
        isbn: body.isbn ? String(body.isbn).trim() : null,
        publisher: body.publisher ? String(body.publisher).trim() : null,
        publicationYear,
        category,
        language: LANGUAGES.includes(body.language) ? body.language : Language.ENGLISH,
        copiesTotal,
        copiesAvailable: copiesTotal,
        description: body.description ? String(body.description).slice(0, 2000) : null,
        pageCount: Number.isFinite(parseInt(body.pageCount)) ? parseInt(body.pageCount, 10) : null,
        coAuthor: body.coAuthor ? String(body.coAuthor).trim() : null,
      },
    })
    return NextResponse.json({ success: true, data: book, message: "Book added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Create book error:", error)
    return NextResponse.json({ success: false, error: "Failed to add book" }, { status: 500 })
  }
}
