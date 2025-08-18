const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { validateClub } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { category, status, search } = req.query;

    // Build query
    let query = {};
    
    // Only show active clubs to non-admin users
    if (!req.user || !req.user.isAdmin) {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('leadership.president', 'name email')
      .populate('leadership.vicePresident', 'name email')
      .populate('leadership.secretary', 'name email')
      .populate('leadership.treasurer', 'name email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Club.countDocuments(query);

    // Transform clubs to include member count and event count
    const transformedClubs = clubs.map(club => ({
      id: club._id,
      name: club.name,
      description: club.description,
      category: club.category,
      founded: club.founded,
      image: club.image,
      members: club.members.length,
      events: club.events.length,
      status: club.status,
      contactEmail: club.contactEmail,
      meetingSchedule: club.meetingSchedule,
      leadership: club.leadership,
      socialMedia: club.socialMedia
    }));

    res.json({
      success: true,
      count: transformedClubs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      clubs: transformedClubs,
      data: transformedClubs // Add data field for compatibility
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clubs'
    });
  }
});

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members.user', 'name email studentId department year')
      .populate('leadership.president', 'name email studentId')
      .populate('leadership.vicePresident', 'name email studentId')
      .populate('leadership.secretary', 'name email studentId')
      .populate('leadership.treasurer', 'name email studentId')
      .populate('events.attendees', 'name email');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if club is active for non-admin users
    if ((!req.user || !req.user.isAdmin) && club.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      club
    });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club'
    });
  }
});

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private/Admin
router.post('/', protect, adminOnly, validateClub, async (req, res) => {
  try {
    const { name, description, category, founded, image, contactEmail, meetingSchedule, requirements } = req.body;

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'Club with this name already exists'
      });
    }

    const club = await Club.create({
      name,
      description,
      category,
      founded,
      image,
      contactEmail,
      meetingSchedule,
      requirements,
      status: 'active' // Admin created clubs are automatically active
    });

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating club'
    });
  }
});

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, category, image, contactEmail, meetingSchedule, requirements, status } = req.body;

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if new name conflicts with existing club
    if (name && name !== club.name) {
      const existingClub = await Club.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingClub) {
        return res.status(400).json({
          success: false,
          message: 'Club with this name already exists'
        });
      }
    }

    // Update fields
    if (name) club.name = name;
    if (description) club.description = description;
    if (category) club.category = category;
    if (image) club.image = image;
    if (contactEmail) club.contactEmail = contactEmail;
    if (meetingSchedule) club.meetingSchedule = meetingSchedule;
    if (requirements) club.requirements = requirements;
    if (status) club.status = status;

    await club.save();

    res.json({
      success: true,
      message: 'Club updated successfully',
      club
    });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating club'
    });
  }
});

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Remove club from users' joinedClubs array
    await User.updateMany(
      { joinedClubs: club._id },
      { $pull: { joinedClubs: club._id } }
    );

    await Club.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting club'
    });
  }
});

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const { fullName, department, year, background } = req.body;

    if (!fullName || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Full name, department, and year are required'
      });
    }
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    if (club.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join inactive club'
      });
    }

    // Check if user is already a member
    const existingMember = club.members.find(member => member.user.toString() === (req.user._id || req.user.id));
    if (existingMember) {
      if (existingMember.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your join request is already pending approval'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    // Add user to club members
    club.members.push({
      user: req.user._id || req.user.id,
      fullName,
      department,
      year,
      background,
      role: 'member',
      status: 'pending'
    });

    await club.save();


    res.json({
      success: true,
      message: 'Join request submitted successfully. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining club'
    });
  }
});

// @desc    Approve club member
// @route   PATCH /api/clubs/:id/members/:memberId/approve
// @access  Private/Admin
router.patch('/:id/members/:memberId/approve', protect, adminOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const member = club.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member.status = 'approved';
    await club.save();

    // Add club to user's joinedClubs
    await User.findByIdAndUpdate(member.user, {
      $addToSet: { joinedClubs: club._id }
    });

    res.json({
      success: true,
      message: 'Member approved successfully'
    });
  } catch (error) {
    console.error('Approve member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving member'
    });
  }
});

// @desc    Reject club member
// @route   PATCH /api/clubs/:id/members/:memberId/reject
// @access  Private/Admin
router.patch('/:id/members/:memberId/reject', protect, adminOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const member = club.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member.status = 'rejected';
    await club.save();

    res.json({
      success: true,
      message: 'Member rejected successfully'
    });
  } catch (error) {
    console.error('Reject member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting member'
    });
  }
});

// @desc    Get club join requests
// @route   GET /api/clubs/:id/join-requests
// @access  Private/Admin
router.get('/:id/join-requests', protect, adminOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members.user', 'name username');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const pendingRequests = club.members.filter(member => member.status === 'pending');

    res.json({
      success: true,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching join requests'
    });
  }
});
// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    const memberIndex = club.members.findIndex(member => member.user.toString() === (req.user._id || req.user.id));
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this club'
      });
    }

    // Remove user from club members
    club.members.splice(memberIndex, 1);
    await club.save();

    // Remove club from user's joinedClubs
    await User.findByIdAndUpdate(req.user._id || req.user.id, {
      $pull: { joinedClubs: club._id }
    });

    res.json({
      success: true,
      message: 'Successfully left the club'
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving club'
    });
  }
});

// @desc    Get club statistics
// @route   GET /api/clubs/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalClubs = await Club.countDocuments();
    const activeClubs = await Club.countDocuments({ status: 'active' });
    const pendingClubs = await Club.countDocuments({ status: 'pending_approval' });
    const inactiveClubs = await Club.countDocuments({ status: 'inactive' });

    // Clubs by category
    const clubsByCategory = await Club.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total members across all clubs
    const memberStats = await Club.aggregate([
      { $project: { memberCount: { $size: '$members' } } },
      { $group: { _id: null, totalMembers: { $sum: '$memberCount' }, avgMembers: { $avg: '$memberCount' } } }
    ]);

    // Most popular clubs
    const popularClubs = await Club.aggregate([
      { $project: { name: 1, memberCount: { $size: '$members' } } },
      { $sort: { memberCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalClubs,
        activeClubs,
        pendingClubs,
        inactiveClubs,
        totalMembers: memberStats[0]?.totalMembers || 0,
        avgMembers: Math.round(memberStats[0]?.avgMembers || 0),
        clubsByCategory,
        popularClubs
      }
    });
  } catch (error) {
    console.error('Get club stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club statistics'
    });
  }
});

module.exports = router;