// app/api/test-groq/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
    });

    if (response.ok) {
      const models = await response.json();
      
      // Filter hanya model yang tersedia
      const availableModels = models.data
        .filter((model: any) => !model.id.includes('decommissioned'))
        .map((model: any) => ({
          id: model.id,
          active: !model.id.includes('decommissioned')
        }));
      
      return NextResponse.json({ 
        status: 'SUCCESS', 
        availableModels 
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ 
        status: 'ERROR', 
        error: errorText 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'ERROR', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}