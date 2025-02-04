import { NextResponse } from "next/server";
import { resetPassword } from "../../../../controllers/passwordController";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const response = await resetPassword(email, password);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
