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
  logoutUser
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

      const data = await uploadStockImage(
        selectedFile
      );

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


  if (!currentUser) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  if (currentUser.role === "user") {
    return <UserDashboard />;
  }


  return (

    <div className="min-h-screen bg-slate-50 text-slate-900">

      <Navbar />

      <main
        id="home"
        className="mx-auto max-w-7xl px-6 py-12 md:py-20"
      >

        <div className="mb-6 flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Logged in as
            </p>

            <p className="font-semibold text-slate-800">
              {currentUser.name}
            </p>

            <p className="text-xs uppercase tracking-wide text-blue-600">
              {currentUser.role}
            </p>
          </div>


          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>

        </div>


        <Hero />


        <UploadSection
          selectedFile={selectedFile}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
        />


        <AnalysisResult
          result={result}
        />


        <section className="mx-auto max-w-7xl">

          <StockTable
            stocks={result?.stocks}
          />

          <Stocks />

          <StockHistory />

        </section>

      </main>


      <Footer />

    </div>
  );
}


export default App;