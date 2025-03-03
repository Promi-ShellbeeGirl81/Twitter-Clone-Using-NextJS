import { NextResponse } from "next/server";
import { getNotifications, markNotificationAsRead, deleteNotification, createNotification } from "@/controllers/notificationController";

export async function GET(req) {
  try {
    const { status, data } = await getNotifications(req);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req) {
    try {
      const body = await req.json();

  console.log(body);
      if (!body.receiverId || !body.senderId || !body.type) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }
  
      const { status, data } = await createNotification(body);
      return NextResponse.json(data, { status });
    } catch (error) {
      console.error("Error in POST request:", error);
      return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
  }

export async function PUT(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const { status, data } = await markNotificationAsRead(notificationId);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const { status, data } = await deleteNotification(notificationId);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
