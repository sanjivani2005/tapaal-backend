const express = require('express');
const router = express.Router();
const InwardMail = require('../models/InwardMail');
const OutwardMail = require('../models/OutwardMail');
const Department = require('../models/Department');
const User = require('../models/User');
const DashboardConfig = require('../models/DashboardConfig'); // For future dashboard customization

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('🔍 GET /api/dashboard/stats - Fetching dashboard statistics');

    // Get counts for each entity
    const [
      totalUsers,
      totalDepartments,
      totalInwardMails,
      totalOutwardMails,
      pendingMails,
      approvedMails,
      inProgressMails
    ] = await Promise.all([
      User.countDocuments(),
      Department.countDocuments(),
      InwardMail.countDocuments(),
      OutwardMail.countDocuments(),
      InwardMail.countDocuments({ status: 'pending' }),
      InwardMail.countDocuments({ status: 'approved' }),
      InwardMail.countDocuments({ status: 'in-progress' })
    ]);

    const totalMails = totalInwardMails + totalOutwardMails;
    const totalTrackingEvents = totalInwardMails * 2; // Approximate tracking events

    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInwardData = await InwardMail.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyOutwardData = await OutwardMail.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Create monthly data array
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const monthlyData = months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12 + 1;
      return {
        name: month,
        inward: monthlyInwardData.find(d => d._id === monthIndex)?.count || 0,
        outward: monthlyOutwardData.find(d => d._id === monthIndex)?.count || 0
      };
    });

    // Get recent mails for activity feed
    const recentInwardMails = await InwardMail.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentOutwardMails = await OutwardMail.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const recentMails = [
      ...recentInwardMails.map(mail => ({
        id: mail.id || mail._id,
        subject: mail.details || 'No Subject',
        senderName: mail.sender || 'Unknown',
        status: mail.status,
        department: mail.department || 'Unknown',
        priority: mail.priority || 'NORMAL',
        type: 'INWARD'
      })),
      ...recentOutwardMails.map(mail => ({
        id: mail.id || mail._id,
        subject: mail.details || 'No Subject',
        senderName: mail.recipient || 'Unknown',
        status: mail.status,
        department: mail.department || 'Unknown',
        priority: mail.priority || 'NORMAL',
        type: 'OUTWARD'
      }))
    ];

    // Status distribution data
    const statusData = [
      { name: 'Pending', value: pendingMails, color: '#ef4444' },
      { name: 'Approved', value: approvedMails, color: '#3b82f6' },
      { name: 'In Progress', value: inProgressMails, color: '#f59e0b' }
    ];

    const stats = {
      totalUsers,
      totalDepartments,
      totalMails,
      totalTrackingEvents,
      totalInwardMails,
      totalOutwardMails,
      pendingMails,
      approvedMails,
      inProgressMails
    };

    const realData = {
      stats,
      statusData,
      monthlyData,
      recentMails
    };

    console.log('📊 Dashboard stats calculated:', {
      users: totalUsers,
      departments: totalDepartments,
      inwardMails: totalInwardMails,
      outwardMails: totalOutwardMails,
      totalMails
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalDepartments,
          totalInwardMails,
          totalOutwardMails,
          totalMails,
          totalTrackingEvents
        },
        realData
      }
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
