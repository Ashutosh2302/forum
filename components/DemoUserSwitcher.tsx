"use client";
import { useState, useEffect, useRef } from "react";

const DEMO_USERS = [
  { userId: "student-1", name: "Alice Chen",  role: "student"    as const, enrolled: "TS Course" },
  { userId: "student-2", name: "Bob Smith",   role: "student"    as const, enrolled: "TS Course" },
  { userId: "student-3", name: "Carol Lee",   role: "student"    as const, enrolled: "React Course" },
  { userId: "mod-1",     name: "Dave Mod",    role: "moderator"  as const, enrolled: "All courses" },
];

export default function DemoUserSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(DEMO_USERS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "student-1";
    setCurrent(DEMO_USERS.find((u) => u.userId === userId) ?? DEMO_USERS[0]);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchUser(user: typeof DEMO_USERS[number]) {
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("userRole", user.role);
    window.location.reload();
  }

  const isMod = current.role === "moderator";

  return (
    <div ref={ref} className="relative ml-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
      >
        <span className="font-medium text-gray-800">{current.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isMod ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
          {current.role}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 bg-amber-50">
            <p className="text-xs text-amber-700 font-medium">Demo mode — switch user</p>
            <p className="text-xs text-amber-600">Page reloads on switch to clear cache.</p>
          </div>
          {DEMO_USERS.map((user) => {
            const active = user.userId === current.userId;
            const mod = user.role === "moderator";
            return (
              <button
                key={user.userId}
                onClick={() => switchUser(user)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 ${active ? "bg-indigo-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${mod ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Enrolled: {user.enrolled}</p>
                </div>
                {active && (
                  <svg className="w-4 h-4 text-indigo-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
