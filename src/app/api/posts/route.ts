import {createConnection} from "@/lib/db";
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const db = await  createConnection();
        const sql ='SELECT * FROM MyReadsDashboard.`My-Reads`';
        const [books] = await db.query(sql);
        return NextResponse.json(books);
    } catch (error){
        let errorMessage = "Failed to do something exceptional";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.log(error);
        return NextResponse.json({error: errorMessage});
    }
}