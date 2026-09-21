import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('mateclub_auth_user');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-palette-bg flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 border border-palette-subtle shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-palette-dark">Terjadi Kendala Memuat Aplikasi</h2>
              <p className="text-xs text-gray-500 mt-1">
                Aplikasi mendeteksi adanya galat rendering. Anda dapat memuat ulang halaman untuk memulihkan sesi.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] font-mono text-red-800 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark shadow-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 bg-palette-bg text-gray-600 font-bold text-xs rounded-xl hover:bg-palette-subtle border border-palette-subtle"
              >
                Bersihkan Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
