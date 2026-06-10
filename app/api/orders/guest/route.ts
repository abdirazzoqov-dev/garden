import { NextRequest, NextResponse } from "next/server";

// ── In-memory order store (dev/demo) ─────────────────────────
// Production da bu PostgreSQL / Redis ga yoziladi.
// Admin panel polling yoki SSE orqali yangi buyurtmalarni oladi.

let guestOrders: any[] = [];

function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getTime() {
  return new Date().toLocaleTimeString("uz-UZ", { hour12: false });
}

// ── POST /api/orders/guest — guest submits order ──────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stallId, stallName, tableNumber, guestName, items, totalAmount } = body;

    if (!stallId || !items?.length) {
      return NextResponse.json({ error: "stallId va items majburiy" }, { status: 400 });
    }

    const orderId = generateId("guest_ord");
    const now     = getTime();

    const order = {
      id:          orderId,
      type:        tableNumber ? "DINE_IN" : "TAKEAWAY",
      status:      "NEW",
      source:      "GUEST_QR",          // yangi: QR menyu orqali kelgan
      stallId,
      stallName:   stallName ?? "Noma'lum rasta",
      tableNumber: tableNumber ?? null,
      guestName:   guestName   ?? null,
      items: items.map((i: any) => ({
        id:          generateId("oi"),
        productId:   i.productId,
        productName: i.productName,
        category:    i.category,
        price:       i.price,
        quantity:    i.quantity,
        note:        i.note ?? null,
        status:      "PENDING",
        prepTime:    i.prepTime ?? 0,
      })),
      totalAmount: totalAmount ?? 0,
      createdAt:   now,
      updatedAt:   now,
    };

    // Store in-memory
    guestOrders.push(order);

    // ── Broadcast to admin panel via localStorage-based polling ──
    // In dev, admin panel polls GET /api/orders/guest every ~2s
    // and picks up new orders to inject into its local state.

    return NextResponse.json(
      { success: true, orderId, order },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Guest order error:", err);
    return NextResponse.json(
      { error: "Server xatoligi: " + (err.message ?? err) },
      { status: 500 }
    );
  }
}

// ── GET /api/orders/guest — admin panel polls for new orders ──
export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since"); // ISO timestamp
  let pending = guestOrders;

  if (since) {
    // Return only orders newer than 'since' (simple: return all unread)
    // In production this would be DB query WHERE createdAt > since
    pending = guestOrders.filter((o) => o._fetched !== true);
    pending.forEach((o) => (o._fetched = true));
  }

  return NextResponse.json({ orders: pending });
}

// ── DELETE /api/orders/guest — clear after pickup ─────────────
export async function DELETE() {
  guestOrders = [];
  return NextResponse.json({ success: true });
}
