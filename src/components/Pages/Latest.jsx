/** @format */

import React, { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Trash2, Plus } from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

export function Latest() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("news");
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);

	const [newPost, setNewPost] = useState({
		type: "news",
		title: "",
		content: "",
		date: new Date().toISOString().split("T")[0],
		category: "General",
		image: null,
		location: "",
		time: "",
	});

	const [imagePreview, setImagePreview] = useState(null);

	useEffect(() => {
		fetchPosts();
	}, []);

	const fetchPosts = async () => {
		try {
			setLoading(true);
			const data = await apiService.getPosts();
			setPosts(data);
		} catch (error) {
			console.error("Failed to fetch posts:", error);
			toast.error("Failed to load posts");
			// Fallback to empty array if API fails
			setPosts([]);
		} finally {
			setLoading(false);
		}
	};

	const filteredPosts = posts.filter((post) => post.type === activeTab);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				setNewPost({ ...newPost, image: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImagePreview(null);
		setNewPost({ ...newPost, image: null });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can create posts");
			return;
		}

		try {
			const postData = {
				...newPost,
				type: newPost.type.charAt(0).toUpperCase() + newPost.type.slice(1),
				important: newPost.type === "announcement" ? newPost.important : false,
				location: newPost.type === "event" ? newPost.location : "",
				time: newPost.type === "event" ? newPost.time : "",
			};

			await apiService.createPost(postData);
			await fetchPosts(); // Refresh the posts list
			toast.success("Post created successfully!");
		} catch (error) {
			console.error("Failed to create post:", error);
			toast.error("Failed to create post");
			return;
		}

		setNewPost({
			type: "news",
			title: "",
			content: "",
			date: new Date().toISOString().split("T")[0],
			category: "General",
			image: null,
			location: "",
			time: "",
		});
		setImagePreview(null);
	};

	const handleDeletePost = (postId) => {
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can delete posts");
			return;
		}

		const deletePost = async () => {
			try {
				await apiService.deletePost(postId);
				await fetchPosts();
				toast.success("Post deleted successfully!");
			} catch (error) {
				console.error("Failed to delete post:", error);
				toast.error("Failed to delete post");
			}
		};

		deletePost();
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
			{/* Main Container */}
			<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">Our Latest</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
							Stay updated with the latest news, events, and announcements from
							the Student Union of Debre Berhan University
						</p>
					</motion.div>
				</div>
			</section>

			<div className="container mx-auto py-8 px-4 max-w-6xl">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Tabs Navigation */}
					<div className="flex border-b">
						<button
							onClick={() => setActiveTab("news")}
							className={`px-6 py-4 font-medium text-lg flex-1 text-center ${
								activeTab === "news"
									? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
									: "text-gray-600 hover:bg-gray-50"
							}`}>
							📰 News
						</button>
						<button
							onClick={() => setActiveTab("event")}
							className={`px-6 py-4 font-medium text-lg flex-1 text-center ${
								activeTab === "event"
									? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
									: "text-gray-600 hover:bg-gray-50"
							}`}>
							📅 Events
						</button>
						<button
							onClick={() => setActiveTab("announcement")}
							className={`px-6 py-4 font-medium text-lg flex-1 text-center ${
								activeTab === "announcement"
									? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
									: "text-gray-600 hover:bg-gray-50"
							}`}>
							📢 Announcements
						</button>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Posts Column */}
							<div className="lg:col-span-2">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">
									{activeTab === "news" && "Latest Campus News"}
									{activeTab === "event" && "Upcoming Events"}
									{activeTab === "announcement" && "Important Announcements"}
								</h2>

								{loading ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
										<p className="mt-4 text-gray-600">Loading posts...</p>
									</div>
								) : (
									<div className="space-y-6">
										{filteredPosts.length > 0 ? (
											filteredPosts.map((post) => (
												<PostCard
													key={post.id}
													post={post}
													onDelete={handleDeletePost}
													canDelete={user?.isAdmin}
												/>
											))
										) : (
											<div className="bg-blue-50 rounded-xl p-8 text-center">
												<div className="text-4xl text-blue-500 mb-4">📥</div>
												<h3 className="text-xl font-semibold text-gray-700">
													No posts yet
												</h3>
												<p className="text-gray-600 mt-2">
													{activeTab === "news" &&
														"Be the first to share campus news!"}
													{activeTab === "event" &&
														"No upcoming events scheduled yet."}
													{activeTab === "announcement" &&
														"No announcements at this time."}
												</p>
											</div>
										)}
									</div>
								)}
							</div>

							{/* Admin Panel */}
							{user?.isAdmin && (
								<div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
									<div className="flex items-center justify-between mb-6">
										<h3 className="text-xl font-bold text-gray-800">
											Create New Post
										</h3>
										<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
											<Plus className="w-4 h-4 text-blue-600" />
										</div>
									</div>

									<form onSubmit={handleSubmit} className="space-y-4">
										<div>
											<label className="block text-gray-700 mb-2 font-medium">
												Post Type
											</label>
											<div className="grid grid-cols-3 gap-2">
												<button
													type="button"
													onClick={() =>
														setNewPost({ ...newPost, type: "news" })
													}
													className={`py-2 px-3 rounded-lg text-sm font-medium ${
														newPost.type === "news"
															? "bg-blue-600 text-white"
															: "bg-gray-200 text-gray-700 hover:bg-gray-300"
													}`}>
													News
												</button>
												<button
													type="button"
													onClick={() =>
														setNewPost({ ...newPost, type: "event" })
													}
													className={`py-2 px-3 rounded-lg text-sm font-medium ${
														newPost.type === "event"
															? "bg-blue-600 text-white"
															: "bg-gray-200 text-gray-700 hover:bg-gray-300"
													}`}>
													Event
												</button>
												<button
													type="button"
													onClick={() =>
														setNewPost({ ...newPost, type: "announcement" })
													}
													className={`py-2 px-3 rounded-lg text-sm font-medium ${
														newPost.type === "announcement"
															? "bg-blue-600 text-white"
															: "bg-gray-200 text-gray-700 hover:bg-gray-300"
													}`}>
													Announcement
												</button>
											</div>
										</div>

										<div>
											<label className="block text-gray-700 mb-2 font-medium">
												Title
											</label>
											<input
												type="text"
												value={newPost.title}
												onChange={(e) =>
													setNewPost({ ...newPost, title: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												placeholder="Enter post title"
												required
											/>
										</div>

										<div>
											<label className="block text-gray-700 mb-2 font-medium">
												Content
											</label>
											<textarea
												value={newPost.content}
												onChange={(e) =>
													setNewPost({ ...newPost, content: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
												placeholder="Enter post content"
												required></textarea>
										</div>

										<div>
											<label className="block text-gray-700 mb-2 font-medium">
												Date
											</label>
											<input
												type="date"
												value={newPost.date}
												onChange={(e) =>
													setNewPost({ ...newPost, date: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												required
											/>
										</div>

										{newPost.type === "news" && (
											<div>
												<label className="block text-gray-700 mb-2 font-medium">
													Category
												</label>
												<select
													value={newPost.category}
													onChange={(e) =>
														setNewPost({ ...newPost, category: e.target.value })
													}
													className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
													<option value="General">General</option>
													<option value="Campus">Campus</option>
													<option value="Academic">Academic</option>
													<option value="Sports">Sports</option>
													<option value="Research">Research</option>
												</select>
											</div>
										)}

										{newPost.type === "event" && (
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-gray-700 mb-2 font-medium">
														Location
													</label>
													<input
														type="text"
														value={newPost.location}
														onChange={(e) =>
															setNewPost({
																...newPost,
																location: e.target.value,
															})
														}
														className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														placeholder="Event location"
														required
													/>
												</div>
												<div>
													<label className="block text-gray-700 mb-2 font-medium">
														Time
													</label>
													<input
														type="text"
														value={newPost.time}
														onChange={(e) =>
															setNewPost({ ...newPost, time: e.target.value })
														}
														className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														placeholder="Event time"
														required
													/>
												</div>
											</div>
										)}

										{newPost.type === "announcement" && (
											<div className="flex items-center">
												<input
													type="checkbox"
													id="important"
													checked={newPost.important}
													onChange={(e) =>
														setNewPost({
															...newPost,
															important: e.target.checked,
														})
													}
													className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
												/>
												<label
													htmlFor="important"
													className="ml-2 text-gray-700 font-medium">
													Mark as Important Announcement
												</label>
											</div>
										)}

										<div>
											<label className="block text-gray-700 mb-2 font-medium">
												Add Image
											</label>
											<div className="flex items-start space-x-4">
												<div className="flex-1">
													<div className="flex items-center justify-center w-full">
														<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
															<div className="flex flex-col items-center justify-center pt-5 pb-6">
																<div className="text-2xl text-gray-400 mb-2">
																	☁️
																</div>
																<p className="text-sm text-gray-500">
																	<span className="font-semibold">
																		Click to upload
																	</span>{" "}
																	or drag and drop
																</p>
																<p className="text-xs text-gray-500">
																	PNG, JPG (MAX. 5MB)
																</p>
															</div>
															<input
																type="file"
																className="hidden"
																onChange={handleImageChange}
																accept="image/*"
															/>
														</label>
													</div>
												</div>

												{imagePreview && (
													<div className="relative">
														<img
															src={imagePreview}
															alt="Preview"
															className="h-32 w-32 object-cover rounded-lg border border-gray-300"
														/>
														<button
															type="button"
															onClick={removeImage}
															className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
															✕
														</button>
													</div>
												)}
											</div>
										</div>

										<button
											type="submit"
											className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl">
											Publish Post
										</button>
									</form>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="mt-8 text-center text-gray-600">
					<p>
						© {new Date().getFullYear()} Debre Berhan University Student Union
					</p>
				</div>
			</div>
		</div>
	);
}

// Post Card Component
function PostCard({ post, onDelete, canDelete }) {
	return (
		<div
			className={`bg-white rounded-xl shadow-md overflow-hidden border ${
				post.important ? "border-l-4 border-red-500" : "border-gray-200"
			} transition-all hover:shadow-lg`}>
			<div className="p-5">
				<div className="flex justify-between items-start mb-3">
					<div className="flex items-center">
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
								post.type === "news"
									? "bg-blue-100 text-blue-800"
									: post.type === "event"
									? "bg-green-100 text-green-800"
									: "bg-yellow-100 text-yellow-800"
							}`}>
							{post.type === "news"
								? "📰"
								: post.type === "event"
								? "📅"
								: "📢"}
							<span className="ml-1">
								{post.type.charAt(0).toUpperCase() + post.type.slice(1)}
							</span>
						</span>
						{post.category && (
							<span className="inline-flex items-center ml-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
								🏷️ {post.category}
							</span>
						)}
					</div>
					<div className="flex items-center space-x-2">
						<span className="text-gray-500 text-sm">{post.date}</span>
						{canDelete && (
							<button
								onClick={() => onDelete(post.id)}
								className="text-red-600 hover:text-red-700 p-1">
								<Trash2 className="w-4 h-4" />
							</button>
						)}
					</div>
				</div>

				<h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

				<p className="text-gray-600 mb-4">{post.content}</p>

				{post.image && (
					<div className="mb-4">
						<div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center text-gray-500">
							🖼️ Image Placeholder
						</div>
					</div>
				)}

				{post.type === "event" && (
					<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
						<div className="flex items-center">
							<div className="bg-blue-100 p-2 rounded-lg mr-3">📍</div>
							<div>
								<p className="text-sm text-gray-600">Location</p>
								<p className="font-medium">{post.location}</p>
							</div>
						</div>

						<div className="flex items-center mt-3">
							<div className="bg-blue-100 p-2 rounded-lg mr-3">🕐</div>
							<div>
								<p className="text-sm text-gray-600">Time</p>
								<p className="font-medium">{post.time}</p>
							</div>
						</div>
					</div>
				)}

				{post.important && (
					<div className="mt-4 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
						<div className="flex items-center">
							<span className="text-red-500 mr-2">⚠️</span>
							<p className="font-medium text-red-800">Important Announcement</p>
						</div>
					</div>
				)}

				<div className="mt-4 flex justify-between items-center">
					<div className="flex space-x-2">
						<button className="text-gray-500 hover:text-blue-600">📤</button>
						<button className="text-gray-500 hover:text-blue-600">🔖</button>
					</div>
					<div className="text-gray-500 text-sm">👁️ 245 views</div>
				</div>
			</div>
		</div>
	);
}