import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import User, { IUser } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            console.log(`DEBUG: Authorize attempt for email: ${email}`);
            const db = await connectToDatabase();
            if (!db) {
              throw new Error("Failed to connect to database");
            }
            
            const user = await User.findOne({ email }).lean() as any;
            
            if (!user) {
              console.log(`DEBUG: Authorize - User NOT found for email: ${email}`);
              return null;
            }

            console.log(`DEBUG: Authorize found user ${email} with role:`, user.role);
            
            if (!user.hashedPassword) {
              console.log(`DEBUG: Authorize - User ${email} has no hashedPassword`);
              return null;
            }

            const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
            if (passwordsMatch) {
              return {
                id: user._id.toString(),
                name: user.name || "",
                email: user.email,
                role: String(user.role || "ADMIN"),
                organizationId: user.organizationId ? user.organizationId.toString() : "",
              };
            } else {
              console.log(`DEBUG: Authorize - Password mismatch for user: ${email}`);
              return null;
            }
          } catch (dbError: any) {
            console.error("DEBUG: Error in authorize function:", dbError);
            // Return null instead of throwing to avoid 500 Internal Server Error
            return null;
          }
        } else {
          console.log('DEBUG: Authorize - Invalid credential format', parsedCredentials.error?.flatten().fieldErrors);
          return null;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
