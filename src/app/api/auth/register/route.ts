import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, and hyphens'),
  email: z.string().email(),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

/**
 * User registration endpoint
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = registerSchema.parse(body);
    
    // Check existing user by email or username
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: `${field} already taken` } },
        { status: 409 }
      );
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ name, username, email, passwordHash }).returning();
    
    return NextResponse.json(
      { success: true, data: { id: user.id, name: user.name, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    );
  }
}
