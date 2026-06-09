import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini client on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salesData, lowStockData, attendanceData } = body;

    const dataContext = JSON.stringify({
      sales: salesData || [],
      lowStock: lowStockData || [],
      attendance: attendanceData || []
    }, null, 2);

    const prompt = `Siz Park Central raqamli platformasining yetakchi Sun'iy Intellekt va moliyaviy tahlilchisisiz.
Quyida parkdagi bugungi savdolar, kam qolgan tovarlar (low stock) va xodimlar davomati haqidagi ma'lumotlar keltirilgan:

${dataContext}

Ushbu real-time ma'lumotlar asosida bog' rahbariyatiga (o'zbek tilida) qisqa, aniq va professional tahliliy hisobot va amaliy tavsiyalar tayyorlab bering.
Hisobotda quyidagilar bo'lsin:
1. **Moliyaviy tahlil**: Qaysi rasta yoki attraksion eng faol, umumiy aylanma dinamikasi qanday?
2. **Inventar va ta'minot bo'yicha tezkor ogohlantirish**: Kam qolgan tovarlar uchun aniq qaror (qaysi tovar, qayerda zudlik bilan to'ldirilishi kerak)?
3. **HR & KPI boshqaruvi**: Ishchilarning davomati va KPI (bonus) ko'rsatkichlari, kimning sotuvlari eng yuqori bo'lgan, rag'batlantirish bo'yicha qisqa fikr.
4. **Strategik tavsiya**: Bugungi savdolarni yanada oshirish yoki tashrif buyuruvchilarni oqilona taqsimlash bo'yicha 1 ta innovatsion g'oya.

Professional, ma'lumotlarga asoslangan va o'qishga oson formatda (markdown) javob bering.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AI tahlilini yuklashda xatolik yuz berdi: " + (error.message || error) },
      { status: 500 }
    );
  }
}
