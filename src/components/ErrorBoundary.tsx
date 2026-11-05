import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-stone-800 dark:text-stone-200 text-right shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{this.props.fallbackTitle || 'تنبيه في تشغيل هذه الميزة'}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
            {this.state.error?.message || 'تعذر إتمام الإجراء المطلوب، يرجى التحقق من أذونات الهاتف وإعادة المحاولة.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

