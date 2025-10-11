import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Display appropriate icon based on resolved theme
  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? 'default' : 'icon'}
          className={cn('gap-2', className)}
          aria-label="Toggle theme"
        >
          <ThemeIcon className="h-5 w-5" />
          {showLabel && <span>Theme</span>}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[8rem] rounded-md border border-border bg-popover p-1 shadow-md"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className={cn(
              'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:bg-accent focus:text-accent-foreground',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
            )}
            onClick={() => setTheme('light')}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme === 'light' && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:bg-accent focus:text-accent-foreground',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
            )}
            onClick={() => setTheme('dark')}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme === 'dark' && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:bg-accent focus:text-accent-foreground',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
            )}
            onClick={() => setTheme('system')}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme === 'system' && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
