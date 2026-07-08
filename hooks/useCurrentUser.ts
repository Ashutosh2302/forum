"use client";
import { useState, useEffect } from "react";

type CurrentUser = { userId: string; role: "student" | "moderator" };

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({ userId: "student-1", role: "student" });

  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "student-1";
    const role = (localStorage.getItem("userRole") ?? "student") as "student" | "moderator";
    setUser({ userId, role });
  }, []);

  return user;
}
