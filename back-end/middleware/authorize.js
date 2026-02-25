exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied: Insufficient role",
      });
    }

    next();
  };
};

exports.requirePermission = (...permissionNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!req.user.role || !req.user.role.permissions) {
      return res.status(403).json({
        success: false,
        message: "Permission denied: No permissions assigned",
      });
    }

    const userPermissions = req.user.role.permissions.map((p) => p.name);

    const hasPermission = permissionNames.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: Required permissions: ${permissionNames.join(", ")}`,
      });
    }

    next();
  };
};
