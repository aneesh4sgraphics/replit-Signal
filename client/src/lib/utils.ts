import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSalesRepDisplayName(email: string | null | undefined): string {
  if (!email) return "";
  
  const emailLower = email.toLowerCase();
  
  if (emailLower === "info@4sgraphics.com") {
    return "TEST User";
  }
  
  const localPart = email.split("@")[0];
  if (!localPart) return email;
  
  return localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
}

export function sortUsersByDisplayName<T extends { email: string }>(users: T[]): T[] {
  return [...users].sort((a, b) => {
    const nameA = getSalesRepDisplayName(a.email);
    const nameB = getSalesRepDisplayName(b.email);
    return nameA.localeCompare(nameB);
  });
}
