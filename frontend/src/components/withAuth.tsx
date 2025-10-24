"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Custom hook to handle authentication check and redirection
function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Use replace to avoid adding the login page to the browser history
      router.replace("/login");
    }
  }, [router]);
}

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    useAuth();

    // Avoid rendering on the server where localStorage is not available
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token");

    // While the redirect is happening, or if the token is missing,
    // render null to avoid flashing the protected content.
    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Add a display name for better debugging
  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return AuthComponent;
};

export default withAuth;
