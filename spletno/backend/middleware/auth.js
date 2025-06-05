export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    console.log(req.user.role)
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};