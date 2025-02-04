import { NextResponse } from "next/server";
import { registerUser } from "../../../../controllers/regController";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.name || !body.email || !body.dateOfBirth || !body.password) {
      return NextResponse.json(
        { message: "Missing required fields: name, email, dateOfBirth, password" },
        { status: 400 }
      );
    }

    const response = await registerUser(body);
    console.log("Registration response:", response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
