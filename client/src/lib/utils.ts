import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


// Centralized API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';
export const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
console.log("API URL:", API_URL);
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
