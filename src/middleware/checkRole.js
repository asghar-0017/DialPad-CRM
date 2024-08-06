const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('req.user:', req.user); // Debugging information

    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden: User not authenticated' });
    }

    const role = req.user.role; // Correctly extract the role from req.user
    console.log('User role:', role); // Debugging information

    if (roles.includes(role)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  };
};

module.exports = { checkRole };
