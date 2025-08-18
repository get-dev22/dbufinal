/** @format */

import React, { useState, useEffect } from "react";
import { Users, Calendar, Award, Search, Filter, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

export function Clubs() {
	const { user } = useAuth();
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [searchTerm, setSearchTerm] = useState("");
	const [clubs, setClubs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showNewClubForm, setShowNewClubForm] = useState(false);
	const [newClub, setNewClub] = useState({
		name: "",
		category: "Academic",
		description: "",
		image: "",
		officeLocation: "",
		contactEmail: "",
		contactPhone: "",
		website: "",
	});
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [selectedClub, setSelectedClub] = useState(null);
	const [joinFormData, setJoinFormData] = useState({
		fullName: "",
		department: "",
		year: "",
		background: "",
	});
	const [joinRequests, setJoinRequests] = useState([]);
	const [showJoinRequests, setShowJoinRequests] = useState(false);

	const categories = [
		"All",
		"Academic",
		"Sports",
		"Cultural",
		"Technology",
		"Service",
		"Arts",
	];

	useEffect(() => {
		fetchClubs();
	}, []);

	const fetchClubs = async () => {
		try {
			setLoading(true);
			const data = await apiService.getClubs();
			setClubs(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch clubs:", error);
			toast.error("Failed to load clubs");
			setClubs([]);
		} finally {
			setLoading(false);
		}
	};

	const filteredClubs = clubs.filter((club) => {
		const matchesCategory =
			selectedCategory === "All" || club.category === selectedCategory;
		const matchesSearch =
			club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			club.description.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	const handleJoinClub = (club) => {
		if (!user) {
			toast.error("Please login to join clubs");
			return;
		}
		setSelectedClub(club);
		setShowJoinModal(true);
	};

	const handleSubmitJoinRequest = async (e) => {
		e.preventDefault();

		if (
			!joinFormData.fullName ||
			!joinFormData.department ||
			!joinFormData.year
		) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			await apiService.joinClub(selectedClub.id, joinFormData);
			toast.success("Join request submitted successfully!");
			setShowJoinModal(false);
			setJoinFormData({
				fullName: "",
				department: "",
				year: "",
				background: "",
			});
		} catch (error) {
			toast.error(error.message || "Failed to submit join request");
		}
	};

	const fetchJoinRequests = async (clubId) => {
		try {
			const response = await apiService.getClubJoinRequests(clubId);
			setJoinRequests(response.requests || []);
			setShowJoinRequests(true);
		} catch (error) {
			toast.error("Failed to fetch join requests");
		}
	};

	const handleApproveRequest = async (clubId, memberId) => {
		try {
			await apiService.approveClubMember(clubId, memberId);
			toast.success("Member approved successfully!");
			fetchJoinRequests(clubId);
			await fetchClubs(); // Refresh clubs to update member count
		} catch (error) {
			toast.error("Failed to approve member");
		}
	};

	const handleRejectRequest = async (clubId, memberId) => {
		try {
			await apiService.rejectClubMember(clubId, memberId);
			toast.success("Member rejected successfully!");
			fetchJoinRequests(clubId);
		} catch (error) {
			toast.error("Failed to reject member");
		}
	};

	const handleCreateClub = async (e) => {
		e.preventDefault();
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can create clubs");
			return;
		}

		try {
			const clubData = {
				...newClub,
				members: [],
				events: [],
				founded: new Date(),
				image:
					newClub.image ||
					"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
			};

			await apiService.createClub(clubData);
			await fetchClubs(); // Refresh the clubs list
			toast.success("Club created successfully!");
		} catch (error) {
			console.error("Failed to create club:", error);
			toast.error("Failed to create club");
		}

		setNewClub({ name: "", category: "Academic", description: "", image: "" });
		setShowNewClubForm(false);
	};

	const handleDeleteClub = (clubId) => {
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can delete clubs");
			return;
		}
		toast.success("Club deleted successfully!");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Student Clubs
						</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
							Join one of our many student clubs and organizations to pursue
							your interests, develop new skills, and connect with like-minded
							peers.
						</p>
					</motion.div>
				</div>
			</section>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Admin Controls */}
				{user?.isAdmin && (
					<div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-semibold text-gray-900">
								Admin Controls
							</h2>
							<button
								onClick={() => setShowNewClubForm(!showNewClubForm)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
								<Plus className="w-4 h-4 mr-2" />
								Create New Club
							</button>
						</div>

						{showNewClubForm && (
							<form
								onSubmit={handleCreateClub}
								className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
								<input
									type="text"
									placeholder="Club Name"
									value={newClub.name}
									onChange={(e) =>
										setNewClub({ ...newClub, name: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									required
								/>
								<select
									value={newClub.category}
									onChange={(e) =>
										setNewClub({ ...newClub, category: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
									{categories
										.filter((cat) => cat !== "All")
										.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
								</select>
								<textarea
									placeholder="Club Description"
									value={newClub.description}
									onChange={(e) =>
										setNewClub({ ...newClub, description: e.target.value })
									}
									className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									rows="3"
									required
								/>
								<input
									type="text"
									placeholder="Office Location"
									value={newClub.officeLocation}
									onChange={(e) =>
										setNewClub({ ...newClub, officeLocation: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="email"
									placeholder="Contact Email"
									value={newClub.contactEmail}
									onChange={(e) =>
										setNewClub({ ...newClub, contactEmail: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="tel"
									placeholder="Contact Phone"
									value={newClub.contactPhone}
									onChange={(e) =>
										setNewClub({ ...newClub, contactPhone: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="url"
									placeholder="Website URL"
									value={newClub.website}
									onChange={(e) =>
										setNewClub({ ...newClub, website: e.target.value })
									}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="url"
									placeholder="Club Image URL (optional)"
									value={newClub.image}
									onChange={(e) =>
										setNewClub({ ...newClub, image: e.target.value })
									}
									className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<div className="md:col-span-2 flex gap-4">
									<button
										type="submit"
										className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
										Create Club
									</button>
									<button
										type="button"
										onClick={() => setShowNewClubForm(false)}
										className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				)}

				{/* Search and Filter */}
				<div className="mb-8 lg:mb-12">
					{/* Search Bar */}
					<div className="relative mb-6">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search clubs..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{/* Category Filter */}
					<div className="flex items-center gap-2 mb-6">
						<Filter className="w-5 h-5 text-gray-500" />
						<span className="text-gray-700 font-medium">
							Filter by category:
						</span>
					</div>

					<div className="flex flex-wrap gap-3">
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-4 py-2 rounded-full font-medium transition-colors ${
									selectedCategory === category
										? "bg-blue-600 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								{category}
							</button>
						))}
					</div>
				</div>

				{/* Results Count */}
				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading clubs...</p>
					</div>
				) : (
					<div className="mb-6">
						<p className="text-gray-600">
							Showing {filteredClubs.length} of {clubs.length} clubs
							{selectedCategory !== "All" && ` in ${selectedCategory}`}
							{searchTerm && ` matching "${searchTerm}"`}
						</p>
					</div>
				)}

				{/* Clubs Grid */}
				{!loading && (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
						{filteredClubs.map((club) => (
							<div
								key={club.id}
								className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
								<div className="relative">
									<img
										src={club.image}
										alt={club.name}
										className="w-full h-48 object-cover"
									/>
									<div className="absolute top-4 left-4">
										<span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
											{club.category}
										</span>
									</div>
									{user?.isAdmin && (
										<button
											onClick={() => handleDeleteClub(club.id)}
											className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
											✕
										</button>
									)}
									{user?.isAdmin && (
										<button
											onClick={() => fetchJoinRequests(club.id)}
											className="absolute top-4 right-16 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
											👥
										</button>
									)}
								</div>

								<div className="p-6">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-xl font-semibold text-gray-900">
											{club.name}
										</h3>
										<span className="text-gray-500 text-sm">
											Est. {club.founded}
										</span>
									</div>

									<p className="text-gray-600 mb-4 text-sm leading-relaxed">
										{club.description}
									</p>

									{/* Contact Info */}
									{(club.officeLocation ||
										club.contactEmail ||
										club.contactPhone) && (
										<div className="mb-4 p-3 bg-gray-50 rounded-lg">
											<h4 className="font-medium text-gray-900 mb-2">
												Contact Information
											</h4>
											{club.officeLocation && (
												<p className="text-sm text-gray-600">
													📍 {club.officeLocation}
												</p>
											)}
											{club.contactEmail && (
												<p className="text-sm text-gray-600">
													📧 {club.contactEmail}
												</p>
											)}
											{club.contactPhone && (
												<p className="text-sm text-gray-600">
													📞 {club.contactPhone}
												</p>
											)}
										</div>
									)}
									{/* Stats */}
									<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
										<div className="flex items-center">
											<Users className="w-4 h-4 mr-1" />
											<span>
												{Array.isArray(club.members)
													? club.members.length
													: club.members || 0}{" "}
												members
											</span>
										</div>
										<div className="flex items-center">
											<Calendar className="w-4 h-4 mr-1" />
											<span>
												{Array.isArray(club.events)
													? club.events.length
													: club.events || 0}{" "}
												events/year
											</span>
										</div>
									</div>

									<button
										onClick={() => handleJoinClub(club)}
										className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
										Join Club
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* No Results */}
				{!loading && filteredClubs.length === 0 && (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No clubs found
						</h3>
						<p className="text-gray-600 mb-4">
							Try adjusting your search terms or category filter
						</p>
						<button
							onClick={() => {
								setSearchTerm("");
								setSelectedCategory("All");
							}}
							className="text-blue-600 hover:text-blue-700 font-medium">
							Clear filters
						</button>
					</div>
				)}

				{/* Create Club CTA */}
				<div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 lg:p-8 text-center text-white">
					<div className="max-w-2xl mx-auto">
						<div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
							<Plus className="w-8 h-8" />
						</div>
						<h2 className="text-2xl lg:text-3xl font-bold mb-4">
							Want to Start a New Club?
						</h2>
						<p className="text-green-100 mb-6 text-lg">
							Have an idea for a new club or organization? We support student
							initiatives and can help you get started with the registration
							process.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
								Start a Club
							</button>
							<button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
								Learn More
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Join Club Modal */}
			{showJoinModal && selectedClub && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-900">
									Join {selectedClub.name}
								</h2>
								<button
									onClick={() => setShowJoinModal(false)}
									className="text-gray-400 hover:text-gray-600">
									✕
								</button>
							</div>

							<form onSubmit={handleSubmitJoinRequest} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Full Name *
									</label>
									<input
										type="text"
										required
										value={joinFormData.fullName}
										onChange={(e) =>
											setJoinFormData({
												...joinFormData,
												fullName: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
										placeholder="Your full name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Department *
									</label>
									<select
										required
										value={joinFormData.department}
										onChange={(e) =>
											setJoinFormData({
												...joinFormData,
												department: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
										<option value="">Select Department</option>
										<option value="Computer Science">Computer Science</option>
										<option value="Engineering">Engineering</option>
										<option value="Business">Business</option>
										<option value="Medicine">Medicine</option>
										<option value="Agriculture">Agriculture</option>
										<option value="Education">Education</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Academic Year *
									</label>
									<select
										required
										value={joinFormData.year}
										onChange={(e) =>
											setJoinFormData({ ...joinFormData, year: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
										<option value="">Select Year</option>
										<option value="1st Year">1st Year</option>
										<option value="2nd Year">2nd Year</option>
										<option value="3rd Year">3rd Year</option>
										<option value="4th Year">4th Year</option>
										<option value="5th Year">5th Year</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Background/Why do you want to join?
									</label>
									<textarea
										value={joinFormData.background}
										onChange={(e) =>
											setJoinFormData({
												...joinFormData,
												background: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
										rows="3"
										placeholder="Tell us about your background and why you want to join this club"
									/>
								</div>

								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => setShowJoinModal(false)}
										className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
										Cancel
									</button>
									<button
										type="submit"
										className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
										Submit Request
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Join Requests Modal */}
			{showJoinRequests && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-900">
									Join Requests
								</h2>
								<button
									onClick={() => setShowJoinRequests(false)}
									className="text-gray-400 hover:text-gray-600">
									✕
								</button>
							</div>
							<div className="space-y-4">
								{joinRequests.length === 0 ? (
									<p className="text-gray-600 text-center py-8">
										No pending join requests
									</p>
								) : (
									joinRequests.map((request) => (
										<div
											key={request._id}
											className="border border-gray-200 rounded-lg p-4">
											<div className="flex justify-between items-start mb-3">
												<div>
													<h3 className="font-semibold text-gray-900">
														{request.fullName}
													</h3>
													<p className="text-sm text-gray-600">
														{request.department} - {request.year}
													</p>
													<p className="text-sm text-gray-600">
														Username: {request.user?.username}
													</p>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() =>
															handleApproveRequest(
																selectedClub?.id,
																request._id
															)
														}
														className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
														Approve
													</button>
													<button
														onClick={() =>
															handleRejectRequest(selectedClub?.id, request._id)
														}
														className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
														Reject
													</button>
												</div>
											</div>
											{request.background && (
												<div>
													<p className="text-sm font-medium text-gray-700 mb-1">
														Background:
													</p>
													<p className="text-sm text-gray-600">
														{request.background}
													</p>
												</div>
											)}
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
