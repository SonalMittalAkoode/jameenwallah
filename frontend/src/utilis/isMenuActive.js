export const isParentActive = (children, path) => {
  if (!children || !path) return false;

  const normalize = (p) => String(p || "").split("?")[0].split("#")[0];
  const parentSegment = normalize(path).split("/")[1];

  return children.some((item) => {
    const itemSegment = normalize(item?.path).split("/")[1];
    if (itemSegment && itemSegment === parentSegment) return true;
    return item?.subMenu?.some((item2) => {
      const subSegment = normalize(item2?.path).split("/")[1];
      return subSegment && subSegment === parentSegment;
    });
  });
};
