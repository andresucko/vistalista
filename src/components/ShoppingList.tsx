import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, X, Check, RefreshCw, List, ShoppingCart, Menu, Save, Globe, LogOut, BookMarked, DollarSign, Trash2, Share2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ShareListDialog } from './ShareListDialog';

interface ShoppingItem {
  id: string;
  name: string;
  price: string;
  completed: boolean;
}

interface SavedList {
  id: string;
  name: string;
  created_at: string;
}

interface ShoppingListProps {
  user: User;
}

const translations = {
  en: {
    title: 'Shopping List',
    addPlaceholder: 'Add items (comma-separated)...',
    addButton: 'Add',
    saveList: 'Save List',
    savedLists: 'Saved Lists',
    showAll: 'Show All',
    showAdded: 'Show Added',
    signOut: 'Sign Out',
    resetList: 'Reset List',
    currentTotal: 'Current List Total:',
    addedTotal: 'Added Items Total:',
    toAdd: 'To Add',
    added: 'Added',
    noSavedLists: 'No saved lists yet',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    load: 'Load',
    share: 'Share',
    shareList: 'Share List',
    emailPlaceholder: 'Enter recipient email',
    invalidEmail: 'Please enter a valid email',
    userNotFound: 'User not found. They need an account to receive shared lists.',
    shareSuccess: 'List shared successfully!',
    shareError: 'Failed to share list',
    switchLanguage: 'Cambiar a Español',
    confirmReset: 'Are you sure you want to reset the list? This will delete all items.',
    yes: 'Yes',
    no: 'No'
  },
  es: {
    title: 'Lista de Compras',
    addPlaceholder: 'Agregar productos (separados por comas)...',
    addButton: 'Agregar',
    saveList: 'Guardar Lista',
    savedLists: 'Listas Guardadas',
    showAll: 'Mostrar Todo',
    showAdded: 'Mostrar Agregados',
    signOut: 'Cerrar Sesión',
    resetList: 'Reiniciar Lista',
    currentTotal: 'Total Lista Actual:',
    addedTotal: 'Total Productos Agregados:',
    toAdd: 'Por Agregar',
    added: 'Agregados',
    noSavedLists: 'No hay listas guardadas',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    load: 'Cargar',
    share: 'Compartir',
    shareList: 'Compartir Lista',
    emailPlaceholder: 'Ingrese el correo del destinatario',
    invalidEmail: 'Por favor ingrese un correo válido',
    userNotFound: 'Usuario no encontrado. Necesitan una cuenta para recibir listas compartidas.',
    shareSuccess: '¡Lista compartida exitosamente!',
    shareError: 'Error al compartir la lista',
    switchLanguage: 'Switch to English',
    confirmReset: '¿Estás seguro de que quieres reiniciar la lista? Esto eliminará todos los productos.',
    yes: 'Sí',
    no: 'No'
  }
};

export function ShoppingList({ user }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [showingAddedProducts, setShowingAddedProducts] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [listName, setListName] = useState('');
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [showSavedLists, setShowSavedLists] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { id } = useParams();

  const currentTotal = items
    .filter(item => !item.completed)
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const addedTotal = items
    .filter(item => item.completed)
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  useEffect(() => {
    fetchItems(user.id);
    fetchSavedLists(user.id);
  }, [user.id]);

  const fetchItems = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data.map(item => ({
        ...item,
        price: item.price?.toString() || '0'
      })));
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedLists = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLists(data);
    } catch (error) {
      console.error('Error fetching saved lists:', error);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const itemNames = newItemName.split(',').map(name => name.trim()).filter(Boolean);
      
      const newItems = itemNames.map(name => ({
        name,
        user_id: user.id,
        completed: false,
        price: 0
      }));

      const { data, error } = await supabase
        .from('user_items')
        .insert(newItems)
        .select();

      if (error) throw error;

      setItems(prev => [
        ...prev,
        ...data.map(item => ({
          ...item,
          price: item.price.toString()
        }))
      ]);
      
      setNewItemName('');
    } catch (error) {
      console.error('Error adding items:', error);
      setError('Failed to add items');
    }
  };

  const toggleCompleted = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('user_items')
        .update({ completed: !item.completed })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      );
    } catch (error) {
      console.error('Error toggling item:', error);
      setError('Failed to update item');
    }
  };

  const updatePrice = async (itemId: string, newPrice: string) => {
    try {
      const { error } = await supabase
        .from('user_items')
        .update({ price: parseFloat(newPrice) || 0 })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, price: newPrice } : item
        )
      );
    } catch (error) {
      console.error('Error updating price:', error);
      setError('Failed to update price');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('user_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const saveList = async () => {
    if (!listName.trim()) return;

    try {
      const { data: savedList, error: listError } = await supabase
        .from('saved_lists')
        .insert([{ name: listName, user_id: user.id }])
        .select()
        .single();

      if (listError) throw listError;

      const savedItems = items.map(item => ({
        list_id: savedList.id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        completed: item.completed
      }));

      const { error: itemsError } = await supabase
        .from('saved_list_items')
        .insert(savedItems);

      if (itemsError) throw itemsError;

      setSavedLists(prev => [savedList, ...prev]);
      setShowSaveDialog(false);
      setListName('');
    } catch (error) {
      console.error('Error saving list:', error);
      setError('Failed to save list');
    }
  };

  const loadList = async (listId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_list_items')
        .select('*')
        .eq('list_id', listId);

      if (error) throw error;

      const newItems = data.map(item => ({
        name: item.name,
        user_id: user.id,
        completed: item.completed,
        price: 0
      }));

      const { data: insertedItems, error: insertError } = await supabase
        .from('user_items')
        .insert(newItems)
        .select();

      if (insertError) throw insertError;

      setItems(insertedItems.map(item => ({
        ...item,
        price: item.price.toString()
      })));
    } catch (error) {
      console.error('Error loading list:', error);
      setError('Failed to load list');
    } finally {
      setLoading(false);
      setShowSavedLists(false);
    }
  };

  const resetList = async () => {
    try {
      const { error } = await supabase
        .from('user_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      setShowResetConfirm(false);
      setShowingAddedProducts(false);
    } catch (error) {
      console.error('Error resetting list:', error);
      setError('Failed to reset list');
    }
  };

  const handleShare = (listId: string) => {
    setSelectedListId(listId);
    setShowShareDialog(true);
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setMenuOpen(false);
  };

  const t = translations[currentLanguage];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              {t.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 hover:bg-gray-100 rounded-full"
                title={t.switchLanguage}
              >
                <Globe className="w-6 h-6" />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="mb-6 flex flex-col gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Save className="w-5 h-5" />
                {t.saveList}
              </button>
              <button
                onClick={() => setShowSavedLists(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <BookMarked className="w-5 h-5" />
                {t.savedLists}
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
                {t.resetList}
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                {t.signOut}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder={t.addPlaceholder}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t.addButton}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-blue-700 font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {showingAddedProducts ? t.addedTotal : t.currentTotal}
                </span>
                <span className="text-blue-700 font-bold">
                  ${showingAddedProducts ? addedTotal.toFixed(2) : currentTotal.toFixed(2)}
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {items
                  .filter(item => showingAddedProducts ? item.completed : !item.completed)
                  .map(item => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => toggleCompleted(item.id)}
                        className={`p-1 rounded-full ${
                          item.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                        {item.name}
                      </span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, e.target.value)}
                        className="w-20 p-1 text-right border rounded"
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 rounded-full bg-red-100 text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
              </ul>

              <div className="flex gap-2 justify-between">
                <button
                  onClick={() => setShowingAddedProducts(false)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    !showingAddedProducts
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <div>
                    <span>{t.toAdd}</span>
                    <span className="block text-xs">
                      ${currentTotal.toFixed(2)}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setShowingAddedProducts(true)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    showingAddedProducts
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <div>
                    <span>{t.added}</span>
                    <span className="block text-xs">
                      ${addedTotal.toFixed(2)}
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t.saveList}</h2>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                onClick={saveList}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedLists && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t.savedLists}</h2>
            <ul className="space-y-2 mb-4">
              {savedLists.map(list => (
                <li
                  key={list.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span>{list.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare(list.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => loadList(list.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {t.load}
                    </button>
                  </div>
                </li>
              ))}
              {savedLists.length === 0 && (
                <li className="text-center text-gray-500 py-4">
                  {t.noSavedLists}
                </li>
              )}
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSavedLists(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">{t.resetList}</h2>
            <p className="mb-6 text-gray-600">{t.confirmReset}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t.no}
              </button>
              <button
                onClick={resetList}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareDialog && selectedListId && (
        <ShareListDialog
          listId={selectedListId}
          onClose={() => {
            setShowShareDialog(false);
            setSelectedListId(null);
          }}
          translations={{
            shareList: t.shareList,
            emailPlaceholder: t.emailPlaceholder,
            share: t.share,
            cancel: t.cancel,
            invalidEmail: t.invalidEmail,
            userNotFound: t.userNotFound,
            shareSuccess: t.shareSuccess,
            shareError: t.shareError,
          }}
        />
      )}
    </div>
  );
}