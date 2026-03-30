import React from "react";

type RoleBadgeProps = {
  role?: string | null;
  size?: "xs" | "sm" | "md";
};

const roleStyles: Record<string, { label: string; className: string }> = {
  admin:   { label: "Admin",   className: "bg-red-100 text-red-600" },
  manager: { label: "Manager", className: "bg-purple-100 text-purple-600" },
  member:  { label: "Member",  className: "bg-green-100 text-green-600" },
  viewer:  { label: "Viewer",  className: "bg-gray-100 text-gray-500" },
};

const sizeClasses = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const RoleBadge = ({ role, size = "sm" }: RoleBadgeProps) => {
  if (!role) return null;

  const style = roleStyles[role.toLowerCase()] ?? {
    label: role,
    className: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium shrink-0 ${style.className} ${sizeClasses[size]}`}
    >
      {style.label}
    </span>
  );
};

export default RoleBadge;