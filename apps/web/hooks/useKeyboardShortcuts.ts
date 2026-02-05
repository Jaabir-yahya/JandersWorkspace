import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Global keyboard shortcuts for the application
 */
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        router.push('/supplies');
      },
      description: 'New Purchase',
    },
    {
      key: 'i',
      ctrlKey: true,
      action: () => {
        // Open add inventory modal if on inventory page
        const addInventoryEvent = new CustomEvent('open-add-inventory');
        window.dispatchEvent(addInventoryEvent);
      },
      description: 'Add Inventory Item',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => {
        router.push('/invoices');
      },
      description: 'Record Payment',
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        router.push('/settings');
      },
      description: 'Settings',
    },
  ]);
}
