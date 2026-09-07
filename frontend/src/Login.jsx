import { useState } from "react";

import {
  loginUser,
  registerUser
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

        await registerUser(
          name,
          email,
          password
        );

        setMessage(
          "Registration successful. You can now login."
        );

        setIsRegister(false);
        setName("");
        setPassword("");

      } else {

        const data = await loginUser(
          email,
          password
        );

        onLogin(data.user);
      }

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-white">
            Stock Analysis
          </h1>

          <p className="mt-2 text-slate-400">
            {isRegister
              ? "Create your account"
              : "Sign in to continue"}
          </p>

        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

          <h2 className="mb-6 text-xl font-semibold text-white">
            {isRegister
              ? "Create Account"
              : "Login"}
          </h2>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {isRegister && (
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>
            )}


            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />

            </div>


            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}


            {message && (
              <div className="rounded-lg border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-400">
                {message}
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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


          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setMessage("");
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isRegister
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Login;