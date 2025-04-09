"use client"
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {BookOpen} from "lucide-react";
import {motion} from "framer-motion";

const queryClient = new QueryClient();

interface Book {
    id: string;
    title: string;
    authors: string[];
    image: string;
    isbn: string;
    pageCount: number;
    description: string;
}

interface CurrentReadingState {
    book: Book | null;
    currentPage: number;
}

// Main App Component
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-[#F4EDE4] py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.h1
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        layout style={{justifyContent: "center"}}
                        className="text-3xl font-serif text-[#5C4033] mb-6 flex items-center gap-2"
                    >
                        <BookOpen className="w-8 h-8"/> Hannah's Reading Tracker
                    </motion.h1>
                    <BookTracker/>
                </div>
            </div>
        </QueryClientProvider>
    );
}

// Book Tracker Component
function BookTracker() {
    const [currentReading, setCurrentReading] = useState<CurrentReadingState>(
        () => {
            const saved = localStorage.getItem("currentReading");
            return saved ? JSON.parse(saved) : {book: null, currentPage: 0 };
        }
    );

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem("currentReading", JSON.stringify(currentReading));
    }, [currentReading]);

    const handleBookSelect = useCallback((book: Book) => {
        setCurrentReading({ book, currentPage: 0 });
    }, []);

    const updateCurrentPage = useCallback(
        (newPage: number) => {
            if (
                currentReading.book &&
                newPage >= 0 &&
                newPage <= currentReading.book.pageCount
            ) {
                setCurrentReading((prev) => ({ ...prev, currentPage: newPage }));
            }
        },
        [currentReading.book]
    );

    return (
        <div className="flex font-serif flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 bg-[#E8E4D9] rounded-lg shadow-md p-6">
                <CurrentBookDisplay
                    currentBook={currentReading.book}
                    currentPage={currentReading.currentPage}
                    updateCurrentPage={updateCurrentPage}
                />
            </div>
            <div className="w-full md:w-1/2 bg-[#E8E4D9] rounded-lg shadow-md p-6">
                <BookSearch onBookSelect={handleBookSelect} />
            </div>
        </div>
    );
}

// Current Book Display Component
function CurrentBookDisplay({
                                currentBook,
                                currentPage,
                                updateCurrentPage,
                            }: {
    currentBook: Book | null;
    currentPage: number;
    updateCurrentPage: (page: number) => void;
}) {
    const [pageInput, setPageInput] = useState<string>(currentPage.toString());

    const handleSubmitPage = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInput, 10);
        updateCurrentPage(pageNumber);
    };

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    if (!currentBook) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-gray-200 rounded-lg w-48 h-64 flex items-center justify-center mb-4">
                    <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        ></path>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    No Book Selected
                </h2>
                <p className="text-gray-600">
                    Use the search panel to find and select a book you&#39;re currently
                    reading.
                </p>
            </div>
        );
    }

    const progressPercentage = Math.round(
        (currentPage / currentBook.pageCount) * 100
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-[#5C4033] mb-4">
                Currently Reading
            </h2>
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
                {/* Book Cover */}
                <div className="min-w-[140px] w-36">
                    <img
                        src={
                            currentBook.image ||
                            "https://via.placeholder.com/140x200?text=No+Cover"
                        }
                        alt={`Cover of ${currentBook.title}`}
                        className="w-full h-auto rounded-md shadow-md object-cover"
                    />
                </div>

                {/* Book Info */}
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#5C4033]">
                        {currentBook.title}
                    </h3>
                    <p className="text-[#5C4033] mb-2">
                        by {currentBook.authors?.join(", ") || "Unknown Author"}
                    </p>

                    <p className="text-sm text-[#5C4033] mb-2">
                        <span className="font-medium">Pages:</span> {currentBook.pageCount}
                    </p>

                    <div className="mt-3 line-clamp-6 text-sm overflow-y-auto text-[#5C4033]">
                        {currentBook.description || "No description available."}
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-[#5C4033]">Reading Progress</h4>
                    <span className="text-sm font-medium text-yellow-600">
            {currentPage} of {currentBook.pageCount} pages ({progressPercentage}
                        %)
          </span>
                </div>

                <div className="w-full bg-[#b8c299] rounded-full h-2.5 mb-6">
                    <div
                        className="bg-[#5f6a3f] h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {/* Update Progress Form */}
                <form onSubmit={handleSubmitPage} className="mt-4">
                    <div className="inline-flex items-end gap-3">
                        <div className="flex-1">
                            <label
                                htmlFor="current-page"
                                className="block text-sm font-medium text-[#5C4033] mb-1"
                            >
                                Current Page
                            </label>
                            <input
                                type="number"
                                id="current-page"
                                min="0"
                                max={currentBook.pageCount}
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                className="w-50 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:bg-yellow-200"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Book Search Component
function BookSearch({ onBookSelect }: { onBookSelect: (book: Book) => void }) {
    const [searchType, setSearchType] = useState<"isbn" | "title">("title");
    const [searchQuery, setSearchQuery] = useState("");
    const [, setIsSearching] = useState(false);

    const searchBooks = async () => {
        if (!searchQuery.trim()) return null;

        setIsSearching(true);

        try {
            let query = "";
            if (searchType === "isbn") {
                query = `isbn:${searchQuery}`;
            } else {
                query = searchQuery;
            }

            const response = await axios.get(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                    query
                )}&maxResults=10`
            );

            return (
                response.data.items?.map((item: any) => {
                    const volumeInfo = item.volumeInfo;
                    return {
                        id: item.id,
                        title: volumeInfo.title,
                        authors: volumeInfo.authors || [],
                        pageCount: volumeInfo.pageCount || 0,
                        image: volumeInfo.imageLinks?.thumbnail || "",
                        description: volumeInfo.description || "",
                    };
                }) || []
            );
        } catch (error) {
            console.error("Error searching books:", error);
            return [];
        } finally {
            setIsSearching(false);
        }
    };

    const {
        data: books = [],
        refetch,
        isLoading,
        isError,
    } = useQuery(["books", searchQuery, searchType], searchBooks, {
        enabled: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        refetch();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-[#5C4033] mb-4">Find a Book</h2>

            <form onSubmit={handleSearch} className="mb-6">
                <div className="mb-4 ">
                    <div className="flex space-x-4 mb-4">
                        <div className="flex items-center">
                            <input
                                id="search-title"
                                type="radio"
                                checked={searchType === "title"}
                                onChange={() => setSearchType("title")}
                                className="h-4 w-4 text-[#5C4033] border-gray-300 focus:ring-yellow-500"
                            />
                            <label
                                htmlFor="search-title"
                                className="ml-2 block text-sm text-[#5C4033]"
                            >
                                Title / Author
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="search-isbn"
                                type="radio"
                                checked={searchType === "isbn"}
                                onChange={() => setSearchType("isbn")}
                                className="h-4 w-4 text-[#5C4033] border-gray-300 focus:ring-yellow-500"
                            />
                            <label
                                htmlFor="search-isbn"
                                className="ml-2 block text-sm text-[#5C4033]"
                            >
                                ISBN
                            </label>
                        </div>
                    </div>

                    <div className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                searchType === "isbn" ? "Enter ISBN" : "Enter title or author"
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 bg-white rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:bg-yellow-200"
                        >
                            {isLoading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Results Section */}
            <div className="space-y-1">
                <h3 className="text-lg font-medium text-[#5C4033] mb-2">
                    {isLoading
                        ? "Searching..."
                        : books.length > 0
                            ? "Search Results"
                            : "No Results"}
                </h3>

                {isError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                        Error searching for books. Please try again.
                    </div>
                )}

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {books.map((book: Book) => (
                        <div
                            key={book.id}
                            className="flex gap-4 p-3 border border-white rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => onBookSelect(book)}
                        >
                            <div className="w-12 h-16 flex-shrink-0">
                                {book.image ? (
                                    <img
                                        src={book.image}
                                        alt={`Cover of ${book.title}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">No cover</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {book.title}
                                </h4>
                                <p className="text-xs text-gray-600 truncate">
                                    {book.authors?.join(", ") || "Unknown Author"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {book.pageCount > 0
                                        ? `${book.pageCount} pages`
                                        : "Unknown length"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default App;