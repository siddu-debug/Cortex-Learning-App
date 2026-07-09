import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data/courses';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SettingsForm } from './settings-form';

export const metadata = {
  title: 'Profile Settings — Cortex',
  description: 'Customize your learning identity and preferred track.',
};

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/settings');
  }

  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen flex flex-col bg-paper relative">
      <Navbar />
      <main className="flex-1 mx-auto max-w-6xl w-full px-5 py-8">
        <SettingsForm profile={profile} email={user.email} />
      </main>
      <Footer />
    </div>
  );
}
