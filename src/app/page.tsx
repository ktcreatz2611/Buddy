import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function RootPage() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("Caught JWTSessionError:", e);
  }

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
