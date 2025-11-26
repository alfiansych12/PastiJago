// app/api/ai-assistant/route.ts - SIMPLE VERSION WITH FALLBACK
import { NextRequest, NextResponse } from 'next/server';

// Daftar model yang mungkin tersedia (dalam urutan prioritas)
const AVAILABLE_MODELS = [
  'llama-3.1-70b-versatile',  // Model terbaru
  'llama-3.1-8b-instant',     // Model cepat
  'mixtral-8x7b-32768',       // Model alternatif
  'gemma2-9b-it'              // Fallback
];

export async function POST(request: NextRequest) {
  try {
    const { message, code, currentLevel } = await request.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      throw new Error('API key not configured');
    }

    let lastError = null;

    // Coba setiap model sampai ada yang berhasil
    for (const model of AVAILABLE_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `Anda adalah assistant JavaScript. Level user: ${currentLevel}. 
                Jelaskan dalam bahasa Indonesia dengan sederhana.${code ? ` Kode user: ${code}` : ''}`
              },
              {
                role: "user",
                content: message
              }
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Success with model: ${model}`);
          
          return NextResponse.json({
            response: data.choices[0].message.content
          });
        } else {
          const error = await response.json();
          lastError = error;
          console.log(`Model ${model} failed:`, error.error?.message);
          // Lanjut ke model berikutnya
        }
      } catch (modelError) {
        console.log(`Model ${model} error:`, modelError);
        lastError = modelError;
      }
    }

    // Jika semua model gagal
    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (error) {
    console.error('Final error:', error);
    
    return NextResponse.json({
      response: `Halo! 👋 Saya AI Assistant PastiJago.

Sedang ada gangguan sementara dengan sistem AI. 

Pertanyaan Anda: "${message}"

Untuk sementara, Anda bisa:
• Cek dokumentasi di MDN Web Docs
• Gunakan console.log() untuk debugging
• Tanyakan ke forum programming

Sistem akan segera normal kembali! Terima kasih! 😊`
    }, { status: 200 });
  }
}