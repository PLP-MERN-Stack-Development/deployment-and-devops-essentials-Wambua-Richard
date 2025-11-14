// Description: Main application component with routing and state management for posts.

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ Added
import PostList from "./components/PostList"; // ✅ Added
import PostDetails from "./components/PostDetails"; // ✅ Added
import PostForm from "./components/PostForm"; // ✅ Added
import { fetchPosts } from "./lib/api";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';


function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );

  return (
    <Router>
      <Header />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<PostList posts={posts} />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/create" element={<PostForm onPostCreated={loadPosts} />} />
          <Route path="/edit/:id" element={<PostForm onPostUpdated={loadPosts} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
