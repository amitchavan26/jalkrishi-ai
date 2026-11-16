import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { Droplets, Eye, EyeOff } from "lucide-react";
import { Card } from "../components/ui";
import { Button } from "../components/ui";
import ThemeToggle from "../theme/ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;
    if (!name.trim()) {
      setNameError("Enter your name");
      hasError = true;
    }
    if (!email) {
      setEmailError("Enter a valid email address");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address");
      hasError = true;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      await api.post("/api/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else {
        const message = err.response?.data?.message || "Registration failed";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-bg min-h-screen flex">
      {/* Left Panel - Branded Illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-sky-800 text-white">
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Droplets className="w-10 h-10 text-white" aria-hidden="true" />
          <span className="text-3xl font-extrabold tracking-tight">
            JalKrishi AI
          </span>
        </div>
        {/* Abstract Field/Water Illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8">
          <svg
            viewBox="0 0 400 300"
            className="w-full max-w-[380px] h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Four wavy horizontal field-row paths */}
            <path
              d="M0 80 Q100 60 200 80 T400 70"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 130 Q100 110 200 130 T400 120"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 180 Q100 160 200 180 T400 170"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 230 Q100 210 200 230 T400 220"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Three water-drop shapes */}
            <path
              d="M100 100 Q100 70 120 70 Q140 70 140 100 Q140 130 120 150 Q100 130 100 100"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M200 150 Q200 120 220 120 Q240 120 240 150 Q240 180 220 200 Q200 180 200 150"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M300 90 Q300 60 320 60 Q340 60 340 90 Q340 120 320 140 Q300 120 300 90"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circle sun */}
            <circle
              cx="350"
              cy="50"
              r="30"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 px-8 pb-8 text-center">
          <h2 className="text-4xl font-extrabold leading-tight">
            Know if your farm has enough water before you sow.
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Plan crops with a clear water budget.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Theme toggle in top-right */}
          <div className="flex justify-end lg:hidden mb-4">
            <ThemeToggle />
          </div>

          <Card className="max-w-md">
            {/* Mobile brand header */}
            <div className="lg:hidden mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplets className="w-8 h-8 text-primary" aria-hidden="true" />
                <span className="text-2xl font-extrabold text-ink">
                  JalKrishi AI
                </span>
              </div>
            </div>

            <div className="flex justify-end hidden lg:block mb-6">
              <ThemeToggle />
            </div>

            <h1 className="text-2xl font-bold text-ink text-center mb-2">
              Create your account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name Field */}
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  onBlur={() => {
                    if (!name.trim()) setNameError("Enter your name");
                  }}
                  required
                  autoComplete="name"
                  className={`input-glass w-full py-3 px-4 ${nameError ? "border-rose-500 focus:ring-rose-500" : ""} transition-all`}
                  placeholder=" "
                  disabled={loading}
                  aria-invalid={nameError ? "true" : "false"}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p
                    id="name-error"
                    className="mt-1 text-sm text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => {
                    if (email && !validateEmail(email)) {
                      setEmailError("Enter a valid email address");
                    }
                  }}
                  required
                  autoComplete="email"
                  className={`input-glass w-full py-3 px-4 ${emailError ? "border-rose-500 focus:ring-rose-500" : ""} transition-all`}
                  placeholder=" "
                  disabled={loading}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    onBlur={() => {
                      if (password.length < 8)
                        setPasswordError(
                          "Password must be at least 8 characters",
                        );
                    }}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    className={`input-glass w-full py-3 px-4 pr-12 ${passwordError ? "border-rose-500 focus:ring-rose-500" : ""} transition-all`}
                    placeholder=" "
                    disabled={loading}
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={
                      passwordError ? "password-error" : "password-hint"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p
                    id="password-error"
                    className="mt-1 text-sm text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    {passwordError}
                  </p>
                )}
                <p id="password-hint" className="mt-1 text-sm text-muted">
                  At least 8 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
