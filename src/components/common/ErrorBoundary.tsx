import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontFamily: "sans-serif",
            background: "#fff",
            color: "#333",
            padding: "20px",
            textAlign: "center"
          }}
        >
          <h2>Website Loading Error</h2>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
            The application encountered an unexpected error.
          </p>
          <pre
            style={{
              marginTop: "20px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "5px",
              fontSize: "12px",
              textAlign: "left",
              overflow: "auto",
              textWrap: "wrap",
              width: "100%",
              maxWidth: "600px"
            }}
          >
            {this.state.error?.toString()}
          </pre>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
