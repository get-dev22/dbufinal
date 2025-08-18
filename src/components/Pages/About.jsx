/** @format */

import React from "react";
import { Users, Target, Heart, Globe, Lightbulb, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function About() {
	const values = [
		{
			icon: Shield,
			title: "Integrity",
			description:
				"We uphold the highest standards of honesty and transparency",
		},
		{
			icon: Users,
			title: "Unity",
			description:
				"Bringing together students from all backgrounds and disciplines",
		},
		{
			icon: Lightbulb,
			title: "Innovation",
			description:
				"Embracing new ideas and creative solutions to student challenges",
		},
		{
			icon: Heart,
			title: "Service",
			description:
				"Dedicated to serving the needs and interests of all students",
		},
	];

	const leadership = [
		{
			name: "Alemnesh Tadesse",
			position: "Student Din",
			image:
				"https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400",
			description: "Overseeing all student affairs with dedication and vision",
		},
		{
			name: "Bekele Mekonnen",
			position: "President",
			image:
				"https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
			description: "Leading strategic initiatives and student advocacy",
		},
		{
			name: "Hewan Tadesse",
			position: "Clubs & Associations Leader",
			image:
				"https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400",
			description:
				"Fostering student organizations and extracurricular activities",
		},
	];

	const achievements = [
		{
			year: "2023",
			title: "Digital Transformation",
			description:
				"Launched comprehensive online portal for all student services",
		},
		{
			year: "2022",
			title: "Student Satisfaction",
			description: "Achieved 95% student satisfaction rate in annual survey",
		},
		{
			year: "2021",
			title: "Club Expansion",
			description: "Increased active student clubs from 25 to 47",
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">About Us</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
							The Debre Berhan University Student Union is a dedicated
							organization representing student voices and enhancing university
							life through democratic governance and comprehensive services.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className="bg-blue-50 rounded-2xl p-8">
							<div className="flex items-center mb-6">
								<Target className="w-8 h-8 text-blue-600 mr-3" />
								<h2 className="text-3xl font-bold text-gray-900">
									Our Mission
								</h2>
							</div>
							<p className="text-lg text-gray-700 leading-relaxed">
								To advocate for student rights and interests, promote democratic
								governance, and create an inclusive environment where all
								students can participate and thrive in their university
								experience.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="bg-green-50 rounded-2xl p-8">
							<div className="flex items-center mb-6">
								<Globe className="w-8 h-8 text-green-600 mr-3" />
								<h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
							</div>
							<p className="text-lg text-gray-700 leading-relaxed">
								To be the leading student union in Ethiopia, fostering academic
								excellence, social engagement, and preparing students to become
								future leaders in their communities and beyond.
							</p>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Values
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							These core values guide our actions and decisions in serving the
							student community.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{values.map((value, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center">
								<div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<value.icon className="w-8 h-8 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{value.title}
								</h3>
								<p className="text-gray-600">{value.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Leadership */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Leadership
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Experienced and dedicated leaders guiding the student union
							forward.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{leadership.map((leader, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
								<img
									src={leader.image}
									alt={leader.name}
									className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
								/>
								<h3 className="text-xl font-semibold text-gray-900 mb-1">
									{leader.name}
								</h3>
								<p className="text-blue-600 font-medium mb-3">
									{leader.position}
								</p>
								<p className="text-gray-600 text-sm">{leader.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Achievements */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Achievements
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Key milestones and accomplishments in recent years.
						</p>
					</div>

					<div className="space-y-8">
						{achievements.map((achievement, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.2 }}
								className={`flex items-center ${
									index % 2 === 0 ? "flex-row" : "flex-row-reverse"
								}`}>
								<div className="flex-shrink-0 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
									{achievement.year}
								</div>
								<div className={`flex-1 ${index % 2 === 0 ? "ml-8" : "mr-8"}`}>
									<div className="bg-white rounded-2xl p-6 shadow-sm">
										<h3 className="text-2xl font-semibold text-gray-900 mb-3">
											{achievement.title}
										</h3>
										<p className="text-gray-600">{achievement.description}</p>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Contact CTA */}
			<section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Want to Learn More?
					</h2>
					<p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
						Get in touch to learn more about the student union and our services.
					</p>
					<a
						href="/contact"
						className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors inline-block">
						Contact Us
					</a>
				</div>
			</section>
		</div>
	);
}
