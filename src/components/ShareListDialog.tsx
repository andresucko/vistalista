import React, { useState } from 'react';
import { X, Copy, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareListDialogProps {
  listId: string;
  onClose: () => void;
  translations: {
    shareList: string;
    emailPlaceholder: string;
    share: string;
    cancel: string;
    invalidEmail: string;
    userNotFound: string;
    shareSuccess: string;
    shareError: string;
  };
}

export function ShareListDialog({ listId, onClose, translations }: ShareListDialogProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    try {
      // First check if the list exists and get its current share token
      const { data: existingList, error: fetchError } = await supabase
        .from('saved_lists')
        .select('share_token')
        .eq('id', listId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!existingList) throw new Error('List not found');

      // If there's already a share token, use it
      if (existingList.share_token) {
        const shareUrl = `${window.location.origin}/lists/shared/${existingList.share_token}`;
        setShareLink(shareUrl);
        return shareUrl;
      }

      // Generate a new share token using the database function
      const { data: updatedList, error: updateError } = await supabase
        .from('saved_lists')
        .update({ share_token: null }) // This will trigger the default value
        .eq('id', listId)
        .select('share_token')
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedList) throw new Error('Failed to update list');

      const shareUrl = `${window.location.origin}/lists/shared/${updatedList.share_token}`;
      setShareLink(shareUrl);
      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      throw error;
    }
  };

  const handleShare = async () => {
    try {
      setError(null);
      
      if (!email.includes('@')) {
        setError(translations.invalidEmail);
        return;
      }

      // Get the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Share the list
      const { error: shareError } = await supabase
        .from('shared_lists')
        .insert({
          list_id: listId,
          shared_by: currentUser.id,
          shared_email: email.toLowerCase()
        });

      if (shareError) throw shareError;

      // Generate share link after successful share
      await generateShareLink();
      
      setSuccess(true);
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error('Error sharing list:', error);
      setError(translations.shareError);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!shareLink) {
        const url = await generateShareLink();
        await navigator.clipboard.writeText(url);
      } else {
        await navigator.clipboard.writeText(shareLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{translations.shareList}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-green-600 mb-4">{translations.shareSuccess}</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={translations.emailPlaceholder}
                  className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Enter the email address to share with
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {translations.share}
                </button>
              </div>

              {shareLink && (
                <div className="mt-4 p-3 bg-gray-50 rounded break-all">
                  <p className="text-sm text-gray-600">{shareLink}</p>
                </div>
              )}
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Note: Recipients will need to create an account to view the list
            </div>
          </>
        )}
      </div>
    </div>
  );
}