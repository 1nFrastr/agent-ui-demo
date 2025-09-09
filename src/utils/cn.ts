import { type ClassValue, clsx } from 'clsx'

/**
 * 合并类名的工具函数
 * 基于 clsx 和 class-variance-authority
 * 
 * @param inputs - 类名数组或条件类名
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true, 'text-black': false })
 * // => 'px-4 py-2 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
