import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Wifi, WifiOff, X, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check standalone mode (PWA active)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Online/Offline status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // Check if iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
      if (isIOS) {
        setShowIOSGuide(true);
      } else {
        alert('Untuk menginstall aplikasi PWA: Klik menu browser Anda (titik tiga di kanan atas) lalu pilih "Install Aplikasi" atau "Tambahkan ke Layar Utama".');
      }
    }
  };

  // Header quick install badge
  return (
    <>
      <div className="flex items-center gap-2">
        {/* Live Online / Offline Badge */}
        {!isOnline && (
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span>Mode Offline</span>
          </div>
        )}

        {isOnline && !isStandalone && (
          <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>PWA Ready</span>
          </div>
        )}

        {isStandalone ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-2xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Aplikasi Terpasang</span>
          </div>
        ) : (
          <button
            type="button"
            id="btn-install-pwa"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-3.5 py-1.5 rounded-2xl shadow-xs transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
            title="Install aplikasi ini di ponsel atau komputer Anda (Bisa dibuka offline)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Smartphone className="w-5 h-5" />
                <span className="text-slate-900 text-sm">Install di iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p>Untuk menginstall aplikasi ini di perangkat iOS:</p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                  <p>Tekan tombol <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline text-blue-600" />) di bilah bawah browser Safari.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                  <p>Scroll ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                  <p>Klik <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi kini siap digunakan offline!</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-700"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
