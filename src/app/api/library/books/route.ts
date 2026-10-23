import { NextResponse } from "next/http"

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
  coverImage?: string
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

    // Mock book data
    const mockBooks: Book[] = [
      {
        id: "book-001",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0743273565",
        category: "FICTION",
        publisher: "Scribner",
        publishedYear: 1925,
        totalCopies: 5,
        availableCopies: 3,
        language: "English",
        description: "A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.",
        coverImage: "/placeholder-book.jpg",
        location: "SHELVES",
        condition: "GOOD",
      },
      {
        id: "book-002",
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "978-0553380163",
        category: "NON_FICTION",
        publisher: "Bantam Books",
        publishedYear: 1988,
        totalCopies: 3,
        availableCopies: 3,
        language: "English",
        description: "Updated and expanded edition of the original landmark volume.",
        coverImage: "/placeholder-book.jpg",
        location: "SHELVES",
        condition: "NEW",
      },
      {
        id: "book-003",
        title: "Mathematics Form 3",
        author: "Kenya Institute of Curriculum Development",
        isbn: "978-0195812345",
        category: "REFERENCE",
        publisher: "Oxford Kenya",
        publishedYear: 2018,
        totalCopies: 10,
        availableCopies: 8,
        language: "English",
        description: "Secondary school mathematics textbook for Form 3 students.",
        coverImage: "/placeholder-book.jpg",
        location: "SHELVES",
        condition: "GOOD",
      },
      {
        id: "book-004",
        title: "Africa's Future",
        author: "Wangari Maathai",
        isbn: "978-0143129390",
        category: "BIOGRAPHY",
        publisher: "Penguin Books",
        publishedYear: 2009,
        totalCopies: 2,
        availableCopies: 1,
        language: "English",
        description: "The autobiography of Nobel Peace Prize winner Wangari Maathai.",
        coverImage: "/placeholder-book.jpg",
        location: "STORAGE",
        condition: "FAIR",
      },
      {
        id: "book-005",
        title: "Animal Farm",
        author: "George Orwell",
        isbn: "978-0141185372",
        category: "FICTION",
        publisher: "Penguin Books",
        publishedYear: 1945,
        totalCopies: 7,
        availableCopies: 7,
        language: "English",
        description: "A satirical novella about a group of farm animals who rebel against their human farmer.",
        coverImage: "/placeholder-book.jpg",
        location: "SHELVES",
        condition: "NEW",
      },
    ]

    let filteredBooks = mockBooks

    if (category) {
      filteredBooks = filteredBooks.filter((b) => b.category === category)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredBooks = filteredBooks.filter(
        (b) => b.title.toLowerCase().includes(termLower) ||
        b.author.toLowerCase().includes(termLower) ||
        b.isbn.toLowerCase().includes(termLower) ||
        b.description.toLowerCase().includes(termLower)
      )
    }
    if (minAvailable !== undefined) {
      filteredBooks = filteredBooks.filter((b) => b.availableCopies >= minAvailable)
    }

    return NextResponse.json({
      success: true,
      data: filteredBooks,
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

    // Create new book record
    const newBook: Book = {
      id: `book-${Date.now().toString(36)}`,
      ...body,
      availableCopies: body.totalCopies,
      location: "PROCESSING",
    }

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