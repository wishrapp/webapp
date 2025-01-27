import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Share2, Facebook, Mail, Copy } from 'lucide-react';
import { BsTwitterX } from "react-icons/bs";
import { IoLogoWhatsapp } from "react-icons/io5";

type ShareWishlistProps = {
  onClose: () => void;
};

export default function ShareWishlist({ onClose }: ShareWishlistProps) {
  const { profile } = useProfile();
  const [copied, setCopied] = useState(false);

  const shareText = `I have a wishlist on wishr.com! My username is ${profile?.username} if you want to check it out!`;
  const shareUrl = `${import.meta.env.VITE_SITE_URL}/wishlists/${profile?.id}`;

  const handleShare = async (platform: 'twitter' | 'facebook' | 'whatsapp' | 'email') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out my Wishr wishlist!')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Your Wishlist</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center space-x-2 p-3 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors"
              >
                <BsTwitterX className="w-5 h-5" />
                <span>Share on X</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center space-x-2 p-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>Share on Facebook</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center p-3 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-lg transition-colors"
              >
                <div className="pl-5">
                  <IoLogoWhatsapp className="w-5 h-5" />
                </div>
                <span className="-ml-1">Share on WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                className="flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Share via Email</span>
              </button>
            </div>

            {/* Message Preview */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Preview:</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{shareText}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{shareUrl}</p>
            </div>

            {/* Copy Link */}
            <div className="mt-4">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}