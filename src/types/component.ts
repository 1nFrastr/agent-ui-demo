import type { ReactNode, HTMLAttributes } from 'react'

/**
 * 基础组件Props
 */
export interface BaseComponentProps {
  /** 子元素 */
  children?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 测试ID */
  'data-testid'?: string
}

/**
 * 尺寸变体
 */
export type SizeVariant = 'sm' | 'md' | 'lg'

/**
 * 颜色变体
 */
export type ColorVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link'

/**
 * 按钮变体类型
 */
export interface ButtonVariants {
  variant?: ColorVariant
  size?: SizeVariant
  disabled?: boolean
  loading?: boolean
}

/**
 * 输入框变体类型
 */
export interface InputVariants {
  variant?: 'default' | 'error'
  size?: SizeVariant
  disabled?: boolean
}

/**
 * 带有HTML属性的组件Props
 */
export type ComponentPropsWithHTML<T = HTMLDivElement> = BaseComponentProps & 
  HTMLAttributes<T>

/**
 * 转发Ref的组件Props
 */
export type ComponentPropsWithRef<T = HTMLDivElement> = ComponentPropsWithHTML<T> & {
  ref?: React.Ref<T>
}
