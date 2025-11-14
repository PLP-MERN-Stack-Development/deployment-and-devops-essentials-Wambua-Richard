import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostById } from "../lib/api";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  const loadPost = async () => {
    const data = await fetchPostById(id);
    setPost(data);
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  if (!post) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-4 text-gray-700">{post.content}</p>

      <Link
        to={`/edit/${post._id}`}
        className="text-blue-600 underline inline-block mt-6"
      >
        Edit Post
      </Link>
    </div>
  );
}
