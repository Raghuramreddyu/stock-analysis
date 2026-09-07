import { useState } from "react";

import {
  loginUser,
  registerUser,
} from "./services/api";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(name, email, password);

        setMessage(
          "Registration successful. You can now login."
        );

        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        const data = await loginUser(email, password);
        onLogin(data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-2">

          {/* Left Panel */}
          <div className="hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold shadow-lg shadow-blue-600/20">
                  S
                </div>

                <div>
                  <h1 className="text-lg font-bold">
                    Stock Analysis
                  </h1>

                  <p className="text-xs text-slate-500">
                    Market Intelligence Platform
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Market Intelligence
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
                  Smarter insights.
                  <br />
                  Better decisions.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                  Explore researched stocks, market trends,
                  technical indicators, historical performance,
                  and financial news from one platform.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-lg font-bold text-white">
                  📊
                </p>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Market Data
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-lg font-bold text-white">
                  📈
                </p>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Technical Analysis
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-lg font-bold text-white">
                  📰
                </p>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Market News
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">

              {/* Mobile Brand */}
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
                  S
                </div>

                <h1 className="mt-4 text-2xl font-bold">
                  Stock Analysis
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                  Market Intelligence Platform
                </p>
              </div>

              {/* Form Header */}
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  {isRegister
                    ? "Get Started"
                    : "Welcome Back"}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {isRegister
                    ? "Create your account"
                    : "Sign in to your account"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {isRegister
                    ? "Create an account to access the stock intelligence platform."
                    : "Enter your credentials to continue to your dashboard."}
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {isRegister && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your name"
                      required
                      className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-800/70 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div className="rounded-lg border border-green-800/70 bg-green-950/40 px-4 py-3 text-sm text-green-400">
                    {message}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isRegister
                      ? "Creating account..."
                      : "Signing in..."
                    : isRegister
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </form>

              {/* Toggle */}
              <div className="mt-7 border-t border-slate-800 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  {isRegister
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setMessage("");
                  }}
                  className="mt-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  {isRegister
                    ? "Sign in instead"
                    : "Create an account"}
                </button>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-slate-600">
                Stock Analysis • Market Intelligence Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;