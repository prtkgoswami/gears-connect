"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleRedirectResult } from "@/app/services/firebase/authUtils";
import { ROUTES } from "@/app/constants/path";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    handleRedirectResult(
      () => router.push(ROUTES.garage),
      () => router.push(ROUTES.onboarding)
    );
  }, [router]);

  return <p>Signing you in...</p>;
}
