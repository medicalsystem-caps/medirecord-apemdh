import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/auth';

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
