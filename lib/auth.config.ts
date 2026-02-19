import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Determine if the user is on a protected route
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || 
                            nextUrl.pathname.startsWith("/teachers") || 
                            nextUrl.pathname.startsWith("/classes") || 
                            nextUrl.pathname.startsWith("/timetable") || 
                            nextUrl.pathname.startsWith("/settings") ||
                            nextUrl.pathname.startsWith("/billing");

      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // Define public routes that authenticated users shouldn't access (like login/register)
      const isOnAuth = nextUrl.pathname.startsWith("/login") || 
                       nextUrl.pathname.startsWith("/register");

      if (isOnAdmin) {
        const isSuperAdmin = auth?.user?.role === "SUPER_ADMIN" || auth?.user?.email === "sunil.cse.dev@gmail.com";
        if (isLoggedIn && isSuperAdmin) return true;
        return false; // Redirect others to login
      } else if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        // Redirect authenticated users away from auth pages to dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      
      return true;
    },
    async session({ session, token }) {
      console.log("DEBUG: Processing Session Callback", { 
        sessionEmail: session.user?.email, 
        tokenRole: token.role,
        tokenSub: token.sub 
      });

      if (session.user) {
        session.user.id = token.sub as string;
        // Role Override for Sunil
        if (session.user.email === "sunil.cse.dev@gmail.com") {
          session.user.role = "SUPER_ADMIN";
        } else {
          session.user.role = token.role as string;
        }
        
        // Final fallback for organizationId corruption
        let orgId = token.organizationId;
        if (typeof orgId === 'string' && orgId !== "[object Object]") {
          session.user.organizationId = orgId;
        } else if (orgId && typeof orgId === 'object' && (orgId as any).buffer) {
          const bytes = Object.values((orgId as any).buffer) as number[];
          session.user.organizationId = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
          session.user.organizationId = "";
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        console.log("DEBUG: JWT Callback - New login detected", { 
          email: u.email, 
          role: u.role 
        });
        token.sub = u.id || u._id?.toString();
        
        // Force role in JWT too
        if (u.email === "sunil.cse.dev@gmail.com") {
          token.role = "SUPER_ADMIN";
        } else {
          token.role = u.role;
        }
        
        let orgId = u.organizationId?.toString();
        token.organizationId = (orgId && orgId !== "[object Object]") ? orgId : "";
      } else {
        console.log("DEBUG: JWT Callback - Existing token refresh", { 
          email: token.email, 
          role: token.role 
        });
      }
      return token;
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
