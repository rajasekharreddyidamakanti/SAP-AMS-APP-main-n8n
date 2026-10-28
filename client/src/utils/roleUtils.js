// src/utils/roleUtils.js

export const hasRole = (user, role) => {
  if (!user) return false;
  const userRoles = [
    ...(Array.isArray(user.roles) ? user.roles : []),
    user.role,
  ].filter(Boolean);
  return userRoles.some(
    (userRole) => String(userRole).toLowerCase() === role.toLowerCase()
  );
};

export const isAdmin = (user) => hasRole(user, "Admin");

export const isTeamLead = (user) => hasRole(user, "Team Lead");

export const isExpert = (user) => hasRole(user, "Expert");

export const isL2Support = (user) => hasRole(user, "L2 Support");

export const isL1Support = (user) => hasRole(user, "L1 Support");

export const canCreate = (user) => {
  // Any authenticated user can create articles (admin approval still required)
  return !!user;
};

export const canEdit = (user) => {
  return (
    isAdmin(user) ||
    isTeamLead(user)
  );
};

export const canDelete = (user) => {
  return isAdmin(user);
};

export const canApproveRoles = (user) => {
  return isAdmin(user);
};

export const canApproveTags = (user) => {
  return isAdmin(user);
};

export const canManageVisibility = (user) => {
  return isAdmin(user);
};