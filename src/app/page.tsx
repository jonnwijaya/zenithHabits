
"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Zenith Habits!</h1>
          <p className="text-lg text-foreground mb-2">If you are seeing this message, the basic page structure is loading correctly.</p>
          <p className="text-md text-muted-foreground">We can now work on restoring or building your app's features.</p>
        </div>
      </main>
      <Footer habits={[]} />
    </div>
  );
}
