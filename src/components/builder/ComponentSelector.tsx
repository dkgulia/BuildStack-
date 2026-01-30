'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Cpu,
  Monitor,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Box,
  Fan,
  Loader2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ComponentCard } from './ComponentCard';
import { useBuilder } from '@/hooks/use-builder';
import type { ComponentType, PCComponent } from '@/types/components';
import { cn } from '@/lib/utils';

const CATEGORIES: {
  type: ComponentType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: 'cpu', label: 'CPU', icon: Cpu },
  { type: 'gpu', label: 'GPU', icon: Monitor },
  { type: 'motherboard', label: 'Motherboard', icon: CircuitBoard },
  { type: 'ram', label: 'RAM', icon: MemoryStick },
  { type: 'storage', label: 'Storage', icon: HardDrive },
  { type: 'psu', label: 'PSU', icon: Zap },
  { type: 'case', label: 'Case', icon: Box },
  { type: 'cooling', label: 'Cooling', icon: Fan },
];

export function ComponentSelector() {
  const { build, activeCategory, setActiveCategory, setComponent } = useBuilder();
  const [components, setComponents] = useState<PCComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchComponents() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/components/${activeCategory}`);
        const data = await res.json();

        if (data.success) {
          setComponents(data.data);
        } else {
          setError(data.error || 'Failed to fetch components');
        }
      } catch (err) {
        setError('Failed to fetch components');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchComponents();
    setSearchQuery('');
  }, [activeCategory]);

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components;
    const query = searchQuery.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.brand.toLowerCase().includes(query)
    );
  }, [components, searchQuery]);

  const selectedComponent = build[activeCategory];

  const handleSelect = (component: PCComponent) => {
    if (selectedComponent?.id === component.id) {
      setComponent(activeCategory, null);
    } else {
      setComponent(activeCategory, component);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.type;
          const isSelected = build[cat.type] !== null;
          const Icon = cat.icon;

          return (
            <button
              key={cat.type}
              onClick={() => setActiveCategory(cat.type)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
              {isSelected && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        <span>{filteredComponents.length} results</span>
        {selectedComponent && (
          <span className="text-foreground">
            Selected: {selectedComponent.brand}
          </span>
        )}
      </div>

      {/* Component List */}
      <div className="mt-4 flex-1 overflow-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No components found
          </div>
        ) : (
          filteredComponents.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => handleSelect(component)}
            />
          ))
        )}
      </div>
    </div>
  );
}
