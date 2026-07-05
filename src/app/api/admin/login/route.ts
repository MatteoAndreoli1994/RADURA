import { NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  createSessionToken,
  setSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin non configurato: imposta ADMIN_PASSWORD in .env.local" },
        { status: 503 },
      );
    }

    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Credenziali mancanti" }, { status: 400 });
    }

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Email o password non validi" }, { status: 401 });
    }

    const token = createSessionToken(ADMIN_EMAIL);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, email: ADMIN_EMAIL });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
