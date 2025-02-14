import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { ShoppingList } from './ShoppingList';

interface ListsViewProps {
  user: User;
}

export function ListsView({ user }: ListsViewProps) {
  const { token } = useParams();

  return (
    <Routes>
      <Route path="/" element={<ShoppingList user={user} />} />
      <Route path="/:id" element={<ShoppingList user={user} />} />
      <Route path="/shared/:token" element={<ShoppingList user={user} shareToken={token} />} />
    </Routes>
  );
}