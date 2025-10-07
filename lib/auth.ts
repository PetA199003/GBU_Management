import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { getUserByEmail } from './mongodb';
import bcrypt from 'bcryptjs';

// Define UserRole enum locally since we can't import from Prisma
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJEKTLEITER = 'PROJEKTLEITER',
  MITARBEITER = 'MITARBEITER'
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
  interface User {
    role: UserRole;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try to authenticate with Supabase database
          const supabase = getSupabaseClient();
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error || !user) {
            // Fallback to test users for development
            const testUsers = [
              { id: '550e8400-e29b-41d4-a716-446655440001', email: 'admin@gbu-app.de', password: 'admin123', name: 'System Administrator', role: UserRole.ADMIN },
              { id: '550e8400-e29b-41d4-a716-446655440002', email: 'projektleiter@gbu-app.de', password: 'user123', name: 'Max Mustermann', role: UserRole.PROJEKTLEITER },
              { id: '550e8400-e29b-41d4-a716-446655440003', email: 'mitarbeiter@gbu-app.de', password: 'user123', name: 'Lisa Musterfrau', role: UserRole.MITARBEITER },
            ];
            
            const testUser = testUsers.find(u => u.email === credentials.email);
            if (testUser && testUser.password === credentials.password) {
              return {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name,
                role: testUser.role,
              };
            }
            return null;
          }

          // Check password if user has password_hash
          if (user.password_hash) {
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isValid) {
              return null;
            }
          } else {
            // For development, allow simple password check
            const testPasswords: { [key: string]: string } = {
              'admin@gbu-app.de': 'admin123',
              'projektleiter@gbu-app.de': 'user123',
              'mitarbeiter@gbu-app.de': 'user123'
            };
            
            if (testPasswords[credentials.email] !== credentials.password) {
              return null;
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});