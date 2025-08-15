"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import IconButton from "@mui/material/IconButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

// If you use a path alias, change this to: import { auth } from "@/firebase/firebase";
import { auth } from "../firebase/firebase";

export default function SignUpForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [pw,        setPw]        = useState("");
  const [pw2,       setPw2]       = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [agree,     setAgree]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState(null);

  const provider = new GoogleAuthProvider();
  const match = pw2.length > 0 && pw === pw2;

  function niceError(e) {
    const code = e?.code || "";
    if (code.includes("email-already-in-use")) return "That email is already registered.";
    if (code.includes("invalid-email")) return "Please enter a valid email address.";
    if (code.includes("weak-password")) return "Password should be at least 6 characters.";
    return e?.message || "Sign up failed. Please try again.";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!firstName || !lastName) return setErr("Please enter your first and last name.");
    if (!email || !pw || !pw2)   return setErr("Please fill in all required fields.");
    if (!match)                  return setErr("Passwords do not match.");
    if (!agree)                  return setErr("Please accept the Terms to continue.");

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      try { await updateProfile(cred.user, { displayName: `${firstName} ${lastName}`.trim() }); } catch {}
      // (optional) save phone to Firestore later
      router.push("/dashboard");
    } catch (e) {
      setErr(niceError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider); // creates account on first run
      router.push("/dashboard");
    } catch (e) {
      setErr(niceError(e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = agree && match && firstName && lastName && email && pw && pw2 && !loading;

  return (
    <div className="mt-6">
      {/* Same card chrome as login; different fields */}
      <div className="rounded-2xl border-2 border-gold bg-[#0e2158] text-white shadow-2xl p-6 md:p-8">
        <form onSubmit={onSubmit} className="grid gap-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 border border-white/20 focus:border-gold focus:outline-none"
                placeholder="John"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 border border-white/20 focus:border-gold focus:outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Phone <span className="text-white/50">(optional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 border border-white/20 focus:border-gold focus:outline-none"
              placeholder="+1 555 555 5555"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 border border-white/20 focus:border-gold focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 pr-10 border border-white/20 focus:border-gold focus:outline-none"
                placeholder="Create a password"
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <IconButton
                  onClick={() => setShowPw((s) => !s)}
                  size="small"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </IconButton>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Confirm password</label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full rounded-xl bg-transparent text-white placeholder-white/60 px-3 py-3 border border-white/20 focus:border-gold focus:outline-none"
              placeholder="Repeat your password"
            />
            {pw2.length > 0 && (
              <div className={`text-xs ${match ? "text-green-300" : "text-red-300"}`}>
                {match ? "Passwords match ✅" : "Passwords don’t match ❌"}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-gold"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="text-white/80">
              I agree to the <a className="underline underline-offset-4 text-gold" href="#">Terms of Service</a> and{" "}
              <a className="underline underline-offset-4 text-gold" href="#">Privacy Policy</a>.
            </span>
          </label>

          {err && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-gold text-black font-semibold py-3 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px bg-white/20 w-full" />
            <span className="text-white/60 text-sm">OR</span>
            <span className="h-px bg-white/20 w-full" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-xl border border-white/20 py-3 px-4 flex items-center justify-center gap-2 hover:bg-white/5"
          >
            <FcGoogle className="text-xl" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="text-center text-sm text-white/80">
            Already have an account?{" "}
            <a href="/auth" className="text-gold underline underline-offset-4">Log in</a>
          </div>
        </form>
      </div>
    </div>
  );
}
