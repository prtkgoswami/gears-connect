"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "./constants/path";
import Loader from "./_components/Loader";
import { useAuth } from "./hooks/authHooks";

const Home = () => {
  const router = useRouter();
  const {isLoading: isAuthLoading, currentUser, isLoggedIn} = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        router.push(ROUTES.garage)
      } else {
        router.push(ROUTES.home)
      }
    }
  }, [isAuthLoading, currentUser])

  return (
    <Loader />
  )
};

export default Home;
