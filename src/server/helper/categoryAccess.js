const isCategoryAccessible = (category, reqUser) => {
  if (!category.protected) return true;

  const hasAccess = reqUser?.hasAccess === true;
  if (!hasAccess) return false;

  if (category.protectTimeoutMinutes) {
    const minutesSinceUnlock = reqUser?.iat
      ? (Date.now() / 1000 - reqUser.iat) / 60
      : Infinity;
    if (minutesSinceUnlock >= category.protectTimeoutMinutes) return false;
  }

  return true;
};

module.exports = { isCategoryAccessible };
