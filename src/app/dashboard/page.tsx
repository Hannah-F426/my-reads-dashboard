"use client"
import React, {useEffect, useState} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {BookOpen} from "lucide-react";
import {motion} from "framer-motion";

// Create the connection to database
interface Book {
    id: string;
    title: string;
    author: string;
    pages: number;
    rating: number;
    avgRating: number;
    completedDate: Date;
}
interface MonthlyReading {
    month: string;
    pages: number;
}

interface YearlyReading {
    year: string;
    books: number;
}



const Dashboard: React.FC = () => {
    const myBooks: Book[] = [];
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch books data (simulated)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetch('./api/posts');
                console.log("data: " + data);
                const response = await data.json();
                setPosts(response)
                console.log(response[0]);
            }catch (error){
                console.log(error);
            }
        }
        fetchData()
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            //setBooks(myBooks);
            setIsLoading(false);
        }, 1000);
    }, []);
    console.log("Posts: ");
    console.log(posts);

    for(const entry of posts){
        const newBook: Book  = {
            "id": entry["BookID"],
            "title": entry["Title"].toString().split('(')[0],
            "author": entry["Author"],
            "pages": entry["NumberOfPages"],
            "rating": parseInt(entry["MyRating"]),
            "avgRating": parseFloat(entry["AverageRating"]),
            "completedDate": new Date(entry["DateRead"])
        }
        console.log(newBook);
        if(!myBooks.includes(newBook)) {
            myBooks.push(newBook);
        }
    }

    console.log("MyBooks: ");
    console.log(myBooks);
        // Process data for visualizations
        const getMonthlyPages = (): MonthlyReading[] => {
            const monthlyData: { [key: string]: number } = {};
            myBooks.forEach(book => {
                const month = book.completedDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric'
                });
                monthlyData[month] = (monthlyData[month] || 0) + book.pages;
            });
            return Object.entries(monthlyData).map(([month, pages]) => ({month, pages}));
        };

        const getYearlyBooks = (): YearlyReading[] => {
            const yearlyData: { [key: string]: number } = {};
            myBooks.forEach(book => {
                if(!isNaN(book.completedDate.getFullYear())) {
                    const year = book.completedDate.getFullYear().toString();
                    yearlyData[year] = (yearlyData[year] || 0) + 1;
                }
            });
            return Object.entries(yearlyData).map(([year, books]) => ({year, books}));
        };

        const getAveragePagesPerBook = () => {
            const totalPages = myBooks.reduce((sum, book) => sum + book.pages, 0);
            return myBooks.length > 0 ? Math.round(totalPages / myBooks.length) : 0;
        };

        const getReadingConsistency = () => {
            const daysRead = new Set(myBooks.map(book =>
                book.completedDate)).size;
            return Math.round((daysRead / 365) * 100);
        };

    const getLastTenBooks = () => {
        const sortedBooks = myBooks.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.completedDate) - new Date(a.completedDate);
        });
        return sortedBooks.slice(0,9);
    };
    const getTenLongBooks = () => {
        const sortedBooks = myBooks.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return b.pages - a.pages;
        });
        return sortedBooks.slice(0,9);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F4EDE4] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[#8A9A5B] text-xl"
                >
                    <BookOpen className="w-8 h-8" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EDE4] p-6">
            <div className="max-w-7xl mx-auto">
               <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout style={{justifyContent: "center"}}
                    className="text-3xl font-serif text-[#5C4033] mb-6 flex items-center gap-2"
                >
                    <BookOpen className="w-8 h-8" /> Reading Dashboard
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Pages Read Per Month */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Pages Read Per Month</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getMonthlyPages()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B0" />
                                <XAxis dataKey="month" stroke="#5C4033" />
                                <YAxis stroke="#5C4033" />
                                <Tooltip contentStyle={{ backgroundColor: '#E8E4D9', borderColor: '#D4C9B0' }} />
                                <Bar dataKey="pages" fill="#8A9A5B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Rating Comparison */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Rating Comparison</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getLastTenBooks()}
                                       margin={{
                                           top: 5,
                                           right: 50,
                                           left: 0,
                                           bottom: 50
                                       }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B0" />
                                <XAxis dataKey="title" interval={0} angle={30} tickSize={25} tick={{fontSize:10}} stroke="#5C4033" />
                                <YAxis domain={[0, 5]} stroke="#5C4033" />
                                <Tooltip contentStyle={{ backgroundColor: '#E8E4D9', borderColor: '#D4C9B0' }} />
                                <Legend verticalAlign="top" height={40}  />
                                <Line type="monotone" dataKey="rating" stroke="#8A9A5B" name="Your Rating" />
                                <Line type="monotone" dataKey="avgRating" stroke="#D4A017" name="Average Rating" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Books Read Per Year */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Books Read Per Year</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getYearlyBooks()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B0" />
                                <XAxis dataKey="year" stroke="#5C4033" />
                                <YAxis stroke="#5C4033" />
                                <Tooltip contentStyle={{ backgroundColor: '#E8E4D9', borderColor: '#D4C9B0' }} />
                                <Bar dataKey="books" fill="#D4A017" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Average Pages Per Book */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Average Pages Per Book</h2>
                        <div className="text-4xl text-[#8A9A5B] font-bold">{getAveragePagesPerBook()}</div>
                        <p className="text-[#5C4033] mt-2">pages</p>
                    </div>

                    {/* Books by Page Length */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Books by Page Length</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getTenLongBooks()}
                                      margin={{
                                          top: 5,
                                          right: 35,
                                          left: 5,
                                          bottom: 40
                                      }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B0" />
                                <XAxis dataKey="title" interval={0} angle={30} tickSize={25} tick={{fontSize:10}} stroke="#5C4033" />
                                <YAxis stroke="#5C4033" />
                                <Tooltip contentStyle={{ backgroundColor: '#E8E4D9', borderColor: '#D4C9B0' }} />
                                <Bar dataKey="pages" fill="#8A9A5B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Reading Consistency */}
                    <div className="bg-[#E8E4D9] p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h2 className="text-xl font-serif text-[#5C4033] mb-4">Reading Consistency</h2>
                        <div className="text-4xl text-[#D4A017] font-bold">{getReadingConsistency()}%</div>
                        <p className="text-[#5C4033] mt-2">of days read</p>
                    </div>

                </div>
            </div>
        </div>
    );
};


export default Dashboard;