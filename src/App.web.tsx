import React from 'react';
import { ShoppingList } from './components/ShoppingList';
import type { User } from '@supabase/supabase-js';

interface AppWebProps {
  user?: User;
}

export default function AppWeb({ user }: AppWebProps) {
  if (!user) return null;
  return <ShoppingList user={user} />;
}