/**
 * Role-based Authorization Middleware
 * Restricts access to routes based on user role
 * Must be used after authMiddleware
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'organizer', 'player')
 * @returns {Function} - Express middleware function
 * 
 * @example
 * router.get('/admin', authMiddleware, roleMiddleware('admin'), getAdminData);
 * router.get('/organizer', authMiddleware, roleMiddleware('organizer', 'admin'), getOrganizerData);
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of these roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
      });
    }

    // User has the required role, proceed to next middleware
    next();
  };
};

export default roleMiddleware;
