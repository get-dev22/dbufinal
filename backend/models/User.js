const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User schema
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide your name'],
			trim: true,
			maxlength: [50, 'Name cannot be more than 50 characters']
		},
		username: {
			type: String,
			required: [true, 'Please provide a username'],
			unique: true,
			trim: true,
			match: [/^dbu\d{8}$/i, 'Username must start with dbu followed by 8 digits']
		},
		email: {
			type: String,
			unique: true,
			sparse: true, // Allow null values but ensure uniqueness when present
			trim: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				'Please provide a valid email'
			]
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: [8, 'Password must be at least 8 characters'],
			select: false // Don't include password in queries by default
		},
		studentId: {
			type: String,
			sparse: true, // Allow null values but ensure uniqueness when present
			trim: true,
		},
		role: {
			type: String,
			enum: ["admin", "student", "faculty"],
			default: "student",
		},
		department: {
			type: String,
			required: [true, 'Please provide your department'],
			trim: true,
		},
		year: {
			type: String, // Changed from Number to String to handle "1st Year", "2nd Year", etc.
			required: [true, 'Please provide your academic year'],
			enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			trim: true,
		},
		profileImage: {
			type: String,
			default: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		joinedClubs: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Club",
			},
		],
		votedElections: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Election",
			},
		],
		lastLogin: {
			type: Date,
		},
		loginAttempts: {
			type: Number,
			default: 0
		},
		lockUntil: Date
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for student ID generation
userSchema.virtual('generatedStudentId').get(function() {
	return this.studentId || this.username;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) return next();

	try {
		// Hash password with cost of 12
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
	this.lastLogin = new Date();
	this.loginAttempts = 0;
	this.lockUntil = undefined;
	return this.save();
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
	// If we have a previous lock that has expired, restart at 1
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.updateOne({
			$unset: { lockUntil: 1 },
			$set: { loginAttempts: 1 }
		});
	}
	
	const updates = { $inc: { loginAttempts: 1 } };
	
	// Lock account after 5 failed attempts for 2 hours
	if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
		updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
	}
	
	return this.updateOne(updates);
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;