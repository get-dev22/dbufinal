/** @format */

import React, { useState, useEffect } from "react";
import {
	Vote,
	Users,
	Clock,
	CheckCircle,
	Calendar,
	Eye,
	BarChart3,
	Plus,
	Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

export function Elections() {
	const { user } = useAuth();
	const [selectedTab, setSelectedTab] = useState("all");
	const [selectedElection, setSelectedElection] = useState(null);
	const [elections, setElections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [votedElections, setVotedElections] = useState(new Set());
	const [showNewElectionForm, setShowNewElectionForm] = useState(false);
	const [newElection, setNewElection] = useState({
		title: "",
		description: "",
		startDate: "",
		endDate: "",
		candidates: [],
	});
	const [newCandidate, setNewCandidate] = useState({
		name: "",
		department: "",
		academicYear: "",
		profileImage: null,
	});

	useEffect(() => {
		fetchElections();
	}, []);

	const fetchElections = async () => {
		try {
			setLoading(true);
			const data = await apiService.getElections();
			// Ensure data is an array
			setElections(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch elections:", error);
			toast.error("Failed to load elections");
			// Fallback to empty array if API fails
			setElections([]);
		} finally {
			setLoading(false);
		}
	};

	const handleAddCandidate = (e) => {
		e.preventDefault();
		if (
			!newCandidate.name ||
			!newCandidate.department ||
			!newCandidate.academicYear ||
			!newCandidate.profileImage
		) {
			toast.error("Candidate name, department, academic year, and image are required");
			return;
		}
		setNewElection((prev) => ({
			...prev,
			candidates: [...prev.candidates, { 
				...newCandidate, 
				votes: 0,
				position: "President",
				username: `dbu${Date.now().toString().slice(-8)}`,
				platform: ["Student Welfare", "Academic Excellence"],
				profileImage: newCandidate.profileImage || "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400"
			}],
		}));
		setNewCandidate({ name: "", department: "", academicYear: "", profileImage: null });
	};

	const handleProfileImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewCandidate({ ...newCandidate, profileImage: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCreateElection = async (e) => {
		e.preventDefault();
		if (newElection.candidates.length < 2) {
			toast.error("At least two candidates are required");
			return;
		}
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can create elections");
			return;
		}

		try {
			const electionData = {
				...newElection,
				status: "Pending",
				totalVotes: 0,
				eligibleVoters: 12547,
			};

			await apiService.createElection(electionData);
			await fetchElections();
			toast.success("Election created successfully!");
		} catch (error) {
			console.error('Failed to create election:', error);
			toast.error("Failed to create election");
			return;
		}

		setNewElection({
			title: "",
			description: "",
			startDate: "",
			endDate: "",
			candidates: [],
		});
		setShowNewElectionForm(false);
	};

	const handleVote = async (electionId, candidateId) => {
		if (!user) {
			toast.error("Please login to vote");
			return;
		}

		if (votedElections.has(electionId)) {
			toast.error("You have already voted in this election");
			return;
		}

		try {
			await apiService.voteInElection(electionId, candidateId);
			setVotedElections(new Set([...votedElections, electionId]));
			await fetchElections();
			toast.success("Vote cast successfully!");
			setSelectedElection(null);
		} catch (error) {
			toast.error("Failed to cast vote");
		}
	};

	const handleDeleteElection = (electionId) => {
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can delete elections");
			return;
		}
		toast.success("Election deleted successfully!");
	};

	const announceResults = async (electionId) => {
		if (!user?.isAdmin && user?.role !== "admin") {
			toast.error("Only admins can announce results");
			return;
		}

		try {
			await apiService.announceElectionResults(electionId);
			toast.success("Election results announced!");
			await fetchElections();
		} catch (error) {
			console.error('Failed to announce results:', error);
			toast.error("Failed to announce results");
		}
	};

	const filteredElections = elections.filter(
		(election) => selectedTab === "all" || election.status === selectedTab
	);

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "upcoming":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "active":
				return <Vote className="w-4 h-4" />;
			case "upcoming":
				return <Clock className="w-4 h-4" />;
			case "completed":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <Calendar className="w-4 h-4" />;
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Student Elections
						</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
							Vote for your future student union leaders for Debre Berhan
							University
						</p>
					</motion.div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Admin Controls */}
				{user?.isAdmin && (
					<div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-semibold text-gray-900">
								Admin Controls
							</h2>
							<button
								onClick={() => setShowNewElectionForm(!showNewElectionForm)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
								<Plus className="w-4 h-4 mr-2" />
								Create New Election
							</button>
						</div>

						{showNewElectionForm && (
							<form onSubmit={handleCreateElection} className="mt-6 space-y-4">
								{/* Election Fields */}
								<input
									type="text"
									placeholder="Election Title"
									value={newElection.title}
									onChange={(e) =>
										setNewElection({ ...newElection, title: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									required
								/>
								<textarea
									placeholder="Election Description"
									value={newElection.description}
									onChange={(e) =>
										setNewElection({
											...newElection,
											description: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									rows="3"
									required
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Start Date
										</label>
										<input
											type="date"
											value={newElection.startDate}
											onChange={(e) =>
												setNewElection({
													...newElection,
													startDate: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											End Date
										</label>
										<input
											type="date"
											value={newElection.endDate}
											onChange={(e) =>
												setNewElection({
													...newElection,
													endDate: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								{/* Candidates Form */}
								<div className="mt-4">
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Candidates
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
										<input
											type="text"
											placeholder="Candidate Name"
											value={newCandidate.name}
											onChange={(e) =>
												setNewCandidate({
													...newCandidate,
													name: e.target.value,
												})
											}
											className="px-4 py-2 border border-gray-300 rounded-lg"
										/>
										<input
											type="text"
											placeholder="Department"
											value={newCandidate.department}
											onChange={(e) =>
												setNewCandidate({
													...newCandidate,
													department: e.target.value,
												})
											}
											className="px-4 py-2 border border-gray-300 rounded-lg"
										/>
										<select
											value={newCandidate.academicYear}
											onChange={(e) =>
												setNewCandidate({
													...newCandidate,
													academicYear: e.target.value,
												})
											}
											className="px-4 py-2 border border-gray-300 rounded-lg">
											<option value="">Select Academic Year</option>
											<option value="1st Year">1st Year</option>
											<option value="2nd Year">2nd Year</option>
											<option value="3rd Year">3rd Year</option>
											<option value="4th Year">4th Year</option>
											<option value="5th Year">5th Year</option>
										</select>
										<input
											type="file"
											accept="image/*"
											onChange={handleProfileImageChange}
											className="px-4 py-2 border border-gray-300 rounded-lg"
										/>
									</div>
									<div className="flex justify-end">
										<button
											type="button"
											onClick={handleAddCandidate}
											className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
											Add Candidate
										</button>
									</div>
									<ul className="mt-2">
										{newElection.candidates.map((candidate, index) => (
											<li key={index} className="text-gray-700">
												{candidate.name} ({candidate.department} - {candidate.academicYear})
											</li>
										))}
									</ul>
								</div>

								{/* Create Election Button */}
								<div className="flex gap-4">
									<button
										type="submit"
										className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
										Create Election
									</button>
									<button
										type="button"
										onClick={() => setShowNewElectionForm(false)}
										className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				)}

				{/* Filter Tabs */}
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						{["all", "active", "upcoming", "completed"].map((tab) => (
							<button
								key={tab}
								onClick={() => setSelectedTab(tab)}
								className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
									selectedTab === tab
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</nav>
				</div>

				{/* Elections List */}
				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading elections...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
						{filteredElections.map((election, index) => (
							<motion.div
								key={election.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{election.title}
										</h3>
										<p className="text-gray-600 text-sm">
											{election.description}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												election.status
											)}`}>
											{getStatusIcon(election.status)}
											<span className="ml-1 capitalize">{election.status}</span>
										</span>
										{user?.isAdmin && (
											<button
												onClick={() => handleDeleteElection(election.id)}
												className="text-red-600 hover:text-red-700 p-1">
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-2 gap-4 mb-4">
									<div className="bg-gray-50 rounded-lg p-3">
										<div className="flex items-center space-x-2">
											<Users className="w-4 h-4 text-gray-500" />
											<span className="text-sm font-medium text-gray-900">
												Votes
											</span>
										</div>
										<p className="text-lg font-bold text-gray-900 mt-1">
											{election.totalVotes.toLocaleString()}
										</p>
										<p className="text-xs text-gray-500">
											of {election.eligibleVoters.toLocaleString()} eligible
										</p>
									</div>

									<div className="bg-gray-50 rounded-lg p-3">
										<div className="flex items-center space-x-2">
											<Calendar className="w-4 h-4 text-gray-500" />
											<span className="text-sm font-medium text-gray-900">
												Ends
											</span>
										</div>
										<p className="text-lg font-bold text-gray-900 mt-1">
											{new Date(election.endDate).toLocaleDateString()}
										</p>
										<p className="text-xs text-gray-500">
											{election.status === "Ongoing" ? "3 days left" : ""}
										</p>
									</div>
								</div>

								{/* Candidates Preview */}
								{election.candidates.length > 0 && (
									<div className="mb-4">
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Candidates
										</h4>
										<div className="flex -space-x-2">
											{election.candidates.slice(0, 3).map((candidate) => (
												<img
													key={candidate.id}
													src={candidate.profileImage}
													alt={candidate.name}
													className="w-8 h-8 rounded-full border-2 border-white object-cover"
												/>
											))}
										</div>
									</div>
								)}

								{/* Actions */}
								<div className="flex space-x-3">
									{election.status === "Ongoing" && (
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											onClick={() => setSelectedElection(election)}
											className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
											disabled={votedElections.has(election.id)}>
											<Vote className="w-4 h-4 inline mr-2" />
											{votedElections.has(election.id) ? "Voted" : "Vote Now"}
										</motion.button>
									)}

									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
										<Eye className="w-4 h-4 inline mr-2" />
										View Details
									</motion.button>

									{election.status === "Completed" && (
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium hover:bg-green-200 transition-colors">
											<BarChart3 className="w-4 h-4 inline mr-2" />
											Results
										</motion.button>
									)}

									{user?.isAdmin && election.status === "Ongoing" && (
										<button
											onClick={() => announceResults(election.id)}
											className="bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
											Announce Results
										</button>
									)}
								</div>
							</motion.div>
						))}
					</div>
				)}

				{/* Voting Modal */}
				{selectedElection && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-bold text-gray-900">
										{selectedElection.title}
									</h2>
									<button
										onClick={() => setSelectedElection(null)}
										className="text-gray-400 hover:text-gray-600">
										✕
									</button>
								</div>

								<div className="space-y-4">
									{selectedElection.candidates.map((candidate) => (
										<div
											key={candidate.id}
											className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
											<div className="flex items-start space-x-4">
												<img
													src={candidate.profileImage}
													alt={candidate.name}
													className="w-16 h-16 rounded-full object-cover"
												/>
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-gray-900">
														{candidate.name} ({candidate.department})
													</h3>
													<p className="text-gray-600">{candidate.position} - {candidate.academicYear}</p>
													<p className="text-sm font-medium text-gray-700 mb-1">
														Votes: {candidate.votes.toLocaleString()}
													</p>
													<div className="mt-2">
														<p className="text-sm font-medium text-gray-700 mb-1">
															Platform:
														</p>
														<div className="flex flex-wrap gap-1">
															{candidate.platform.map((item, index) => (
																<span
																	key={index}
																	className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																	{item}
																</span>
															))}
														</div>
													</div>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-gray-900">
														{candidate.votes.toLocaleString()}
													</p>
													<p className="text-sm text-gray-500">votes</p>
												</div>
											</div>
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={() =>
													handleVote(selectedElection.id, candidate.id)
												}
												className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
												disabled={votedElections.has(selectedElection.id)}>
												{votedElections.has(selectedElection.id)
													? "Already Voted"
													: `Vote for ${candidate.name}`}
											</motion.button>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}