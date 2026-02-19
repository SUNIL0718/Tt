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
          
          await connectToDatabase();
          const user = await User.findOne({ email }).lean() as unknown as IUser;
          console.log(`DEBUG: Authorize found user ${email} with role:`, user?.role);
          
          if (!user) return null;
          
          if (!user.hashedPassword) return null;

          const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
          if (passwordsMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role as string,
              organizationId: user.organizationId ? String(user.organizationId) : undefined,
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
