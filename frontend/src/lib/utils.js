/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Utility function for merging Tailwind CSS class names.
*/
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
