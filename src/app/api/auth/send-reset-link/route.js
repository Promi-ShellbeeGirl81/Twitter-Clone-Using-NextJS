import { NextResponse } from "next/server";
import { requestPasswordReset } from "../../../../controllers/authControllers/tokenController";

export async function POST(req) {
  try {
    const { email } = await req.json();
    const response = await requestPasswordReset(email);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
