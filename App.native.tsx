import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { Frame, Page, ActionBar, ListView, TextField, Button, FlexboxLayout, Label } from '@nativescript/core';
import { $FlexboxLayout, $ActionBar, $ListView, $TextField, $Button, $Label } from "@nativescript/react";
import type { User } from '@supabase/supabase-js';

interface ShoppingItem {
  id: string;
  name: string;
  price: string;
  completed: boolean;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingAddedProducts, setShowingAddedProducts] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchItems(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchItems(session.user.id);
      } else {
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setItems(data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price.toString(),
        completed: item.completed,
      })));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim() || !user) return;

    try {
      setError(null);
      const names = newItemName.split(',').map(name => name.trim()).filter(Boolean);
      const newItems = names.map(name => ({
        user_id: user.id,
        name,
        price: 0,
        completed: false,
      }));

      const { data, error } = await supabase
        .from('user_items')
        .insert(newItems)
        .select();

      if (error) throw error;

      setItems(prev => [...prev, ...data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price.toString(),
        completed: item.completed,
      }))]);
      setNewItemName('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error adding items');
    }
  };

  const displayItems = showingAddedProducts 
    ? items.filter(item => item.completed) 
    : items.filter(item => !item.completed);

  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);

  return (
    <$Page>
      <$ActionBar title="VistaList" />
      <$FlexboxLayout flexDirection="column" padding={16}>
        <$TextField
          hint="Add a Product"
          text={newItemName}
          onTextChange={(e) => setNewItemName(e.value)}
        />
        <$Button text="Add Product" onTap={addItem} />
        
        {loading ? (
          <$Label text="Loading..." />
        ) : (
          <$ListView
            items={displayItems}
            cellFactory={(item: ShoppingItem) => (
              <$FlexboxLayout flexDirection="row" padding={8}>
                <$Label text={item.name} flexGrow={1} />
                <$TextField
                  text={item.price}
                  keyboardType="number"
                  width={100}
                />
              </$FlexboxLayout>
            )}
          />
        )}

        <$Label text={`Total: $${totalPrice.toFixed(2)}`} textAlignment="right" />
        
        <$FlexboxLayout flexDirection="row" justifyContent="space-between">
          <$Button
            text="Products to Add"
            onTap={() => setShowingAddedProducts(false)}
          />
          <$Button
            text="Added Products"
            onTap={() => setShowingAddedProducts(true)}
          />
        </$FlexboxLayout>
      </$FlexboxLayout>
    </$Page>
  );
}