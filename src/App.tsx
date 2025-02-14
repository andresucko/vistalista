import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { ListsView } from './components/ListsView';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/lists/*"
        element={user ? <ListsView user={user} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/lists/shared/:token"
        element={user ? <ListsView user={user} /> : <Navigate to="/auth" state={{ returnTo: window.location.pathname }} />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/lists" /> : <Auth />}
      />
    </Routes>
  );
}

export default App;