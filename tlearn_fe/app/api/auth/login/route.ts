import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      "http://localhost:5045/api/auth/Login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: data.user,
    });

    // ACCESS TOKEN
    res.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: new Date(data.accessTokenExpiry),
    });

    // REFRESH TOKEN
    res.cookies.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: new Date(data.refreshTokenExpiry),
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}