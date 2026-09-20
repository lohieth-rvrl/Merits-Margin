import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Article from "./pages/Article";
import Jobs from "./pages/Jobs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ArticleForm from "./pages/admin/ArticleForm";
import JobsDashboard from "./pages/admin/JobsDashboard";
import JobForm from "./pages/admin/JobForm";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/career" element={<Jobs />} />
          <Route path="/:category" element={<Category />} />
          <Route path="/:category/:slug" element={<Article />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <ProtectedRoute>
                <ArticleForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute>
                <ArticleForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute>
                <JobsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/new"
            element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/edit/:id"
            element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}
