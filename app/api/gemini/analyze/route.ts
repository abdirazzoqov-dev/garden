import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { "User-Agent": "aistudio-build" },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salesData, lowStockData, attendanceData } = body;

    const dataContext = JSON.stringify(
      { sales: salesData ?? [], lowStock: lowStockData ?? [], attendance: attendanceData ?? [] },
      null,
      2
    );

    const prompt = `Siz Park Central raqamli platformasining yetakchi Sun'iy Intellekt va moliyaviy tahlilchisisiz.
Quyida parkdagi bugungi savdolar, kam qolgan tovarlar (low stock) va xodimlar davomati haqidagi ma'lumotlar keltirilgan:

${dataContext}

Ushbu real-time ma'lumotlar asosida bog' rahbariyatiga (o'zbek tilida) qisqa, aniq va professional tahliliy hisobot va amaliy tavsiyalar tayyorlab bering.
Hisobotda quyidagilar bo'lsin:
1. **Moliyaviy tahlil**: Qaysi rasta yoki attraksion eng faol, umumiy aylanma dinamikasi qanday?
2. **Inventar va ta'minot bo'yicha tezkor ogohlantirish**: Kam qolgan tovarlar uchun aniq qaror?
3. **HR & KPI boshqaruvi**: Ishchilarning davomati, kimning sotuvlari eng yuqori, rag'batlantirish haqida qisqa fikr.
4. **Strategik tavsiya**: Bugungi savdolarni yanada oshirish bo'yicha 1 ta innovatsion g'oya.

Professional, ma'lumotlarga asoslangan va o'qishga oson formatda (markdown) javob bering.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",   // ✅ to'g'ri model nomi
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Gemini API error:", msg);
    return NextResponse.json(
      { error: "AI tahlilini yuklashda xatolik yuz berdi: " + msg },
      { status: 500 }
    );
  }
}
