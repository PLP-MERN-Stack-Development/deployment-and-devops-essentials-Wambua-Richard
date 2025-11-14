import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPost, fetchPostById, updatePost } from "../lib/api";

export default function PostForm({ onPostCreated, onPostUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", content: "" });

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadExistingPost = async () => {
    const data = await fetchPostById(id);
    setForm({ title: data.title, content: data.content });
  };

  useEffect(() => {
    if (id) loadExistingPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updatePost(id, form);
      if (onPostUpdated) onPostUpdated();
    } else {
      await createPost(form);
      if (onPostCreated) onPostCreated();
    }

    navigate("/");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">
        {id ? "Edit Post" : "Create New Post"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder="Post title"
          className="w-full p-2 border rounded"
          value={form.title}
          onChange={updateField}
        />

        <textarea
          name="content"
          placeholder="Post content"
          className="w-full p-2 border rounded h-40"
          value={form.content}
          onChange={updateField}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          {id ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
}
