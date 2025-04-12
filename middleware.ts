import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const token = await getToken({ 
        req: request,
        secret: process.env.AUTH_SECRET
    });

	const protected_paths = ["/profile"];
	const pathname = request.nextUrl.pathname;

	const is_protected = protected_paths.some((path) => pathname.startsWith(path));

	if (is_protected && !token) {
		const login_url = new URL("/auth/login", request.url);
		login_url.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(login_url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/profile/:path*"]
};
