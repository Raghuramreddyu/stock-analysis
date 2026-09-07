import { useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadSection from "./components/UploadSection";
import AnalysisResult from "./components/AnalysisResult";
import StockTable from "./components/StockTable";
import Stocks from "./components/Stocks";
import StockHistory from "./components/StockHistory";
import Footer from "./components/Footer";
import UserDashboard from "./UserDashboard/UserDashboard";
import Login from "./Login";

import {
  uploadStockImage,
  getCurrentUser,
  logoutUser,
} from "./services/api";

function App() {
  const [currentUser, setCurrentUser] = useState(
    getCurrentUser()
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await uploadStockImage(selectedFile);

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  /* Login */
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  /* User Dashboard */
  if (currentUser.role === "user") {
    return <UserDashboard />;
  }

  /* Admin Dashboard */
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />

      <main
        id="home"
        className="mx-auto max-w-[1400px] px-6 py-7"
      >
        {/* Admin Header */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                👤
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Admin Dashboard
                </p>

                <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                  Welcome, {currentUser.name}
                </h1>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Logged in as
                  </span>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </section>

        {/* Hero */}
        <section className="mb-6">
          <Hero />
        </section>

        {/* Upload */}
        <section className="mb-6">
          <UploadSection
            selectedFile={selectedFile}
            loading={loading}
            error={error}
            onFileChange={handleFileChange}
            onAnalyze={handleAnalyze}
          />
        </section>

        {/* OCR Analysis Result */}
        {result && (
          <section className="mb-6">
            <AnalysisResult result={result} />
          </section>
        )}

        {/* Stock Data */}
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <StockTable stocks={result?.stocks} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <Stocks />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <StockHistory />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;