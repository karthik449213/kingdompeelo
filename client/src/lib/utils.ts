import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Centralized API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL ;
export const API_URL = `${API_BASE_URL}/api`;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
