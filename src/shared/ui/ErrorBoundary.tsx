import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Stops a rendering bug on one page from blanking the whole app: the header and
 * navigation keep working. (Error boundaries must still be class components in React.)
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for an error-reporting service (e.g. Sentry) in production.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main id="main" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p role="alert">Something went wrong displaying this page.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
