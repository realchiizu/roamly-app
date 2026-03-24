import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string;
  setNickname: (n: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  nickname: "",
  setNickname: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

// Fetch nickname when user changes
useEffect(() => {
  if (!user) {
    setNickname("");
    return;
  }

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname")
      // Match the user's Auth ID with the 'user_id' column in your profiles table
      .eq("user_id", user.id) 
      .maybeSingle(); // Use maybeSingle to avoid errors if the profile isn't created yet

    if (data?.nickname) {
      setNickname(data.nickname);
    }
  };

  fetchProfile();
}, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, nickname, setNickname, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
