import { Link } from "react-router-dom";

export default function PostList({ posts }) {
  if (!posts.length) {
    return <p className="text-center mt-10">No posts available.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold mb-4">All Posts</h2>

      {posts.map((post) => (
        <div key={post._id} className="p-4 border rounded shadow bg-white">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>

          <Link
            to={`/posts/${post._id}`}
            className="text-blue-600 underline mt-3 inline-block"
          >
            Read more →
          </Link>
        </div>
      ))}
    </div>
  );
}
