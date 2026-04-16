import { NextResponse } from 'next/server';
export async function POST(req: Request){const {message}=await req.json();return NextResponse.json({reply:`I can help with: ${message || 'planning, drafting, modules, and files'}. Real OpenAI integration can be added with OPENAI_API_KEY.`});}
