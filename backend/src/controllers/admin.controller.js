import User from '../models/user.model.js';

/**
 * GET /api/admin/users
 * Query params: role, isEligible, search
 */
export const listUsers = async (req, res) => {
  try {
    const { role, isEligible, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isEligible !== undefined) filter.isEligible = isEligible === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(200);

    return res.status(200).json({ success: true, message: 'Users fetched', data: users });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users', data: null });
  }
};

/**
 * PUT /api/admin/users/:id/approve
 * Mark user as approved by admin
 */
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

    user.isApprovedByAdmin = true;
    await user.save();

    return res.status(200).json({ success: true, message: 'User approved', data: { id: user._id, isApprovedByAdmin: user.isApprovedByAdmin } });
  } catch (error) {
    console.error('Admin approve user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve user', data: null });
  }
};

export default {
  listUsers,
  approveUser,
};
