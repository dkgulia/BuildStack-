'use client';

import { useMemo } from 'react';
import { Check } from 'lucide-react';

interface ComparePart {
  id: string;
  type: string;
  brand: string;
  name: string;
  specs: Record<string, unknown>;
}

interface CompareTableProps {
  parts: ComparePart[];
  onSelect?: (part: ComparePart) => void;
}

// Group spec keys by category for organized display
const SPEC_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Performance',
    keys: [
      'cores', 'threads', 'base_clock', 'boost_clock',
      'vram', 'vram_type', 'memory_bus',
      'refresh_rate', 'response_time',
    ],
  },
  {
    label: 'Memory & Storage',
    keys: [
      'ram_type', 'capacity_gb', 'speed_mhz', 'cas_latency',
      'type', 'interface', 'read_speed', 'write_speed',
      'ram_slots', 'm2_slots',
    ],
  },
  {
    label: 'Physical',
    keys: [
      'socket', 'chipset', 'form_factor', 'case_type',
      'screen_size', 'resolution', 'panel_type',
      'length_mm', 'height_mm', 'max_gpu_length', 'max_cooler_height',
    ],
  },
  {
    label: 'Power',
    keys: [
      'tdp', 'wattage', 'efficiency', 'modular',
      'tdp_rating', 'power_connectors',
    ],
  },
  {
    label: 'Features',
    keys: [
      'has_wifi', 'has_bluetooth', 'has_rgb',
      'usb_ports', 'audio', 'color',
    ],
  },
];

function formatSpecValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  const str = String(value);
  if (key === 'capacity_gb') {
    const num = Number(value);
    return num >= 1000 ? `${num / 1000} TB` : `${num} GB`;
  }
  if (key === 'vram') return `${str} GB`;
  if (key === 'speed_mhz') return `${str} MHz`;
  if (key === 'wattage' || key === 'tdp' || key === 'tdp_rating') return `${str}W`;
  if (key === 'cores') return `${str} Cores`;
  if (key === 'threads') return `${str} Threads`;
  if (key === 'base_clock' || key === 'boost_clock') return `${str} GHz`;
  if (key === 'refresh_rate') return `${str} Hz`;
  if (key === 'response_time') return `${str} ms`;
  if (key === 'length_mm' || key === 'height_mm' || key === 'max_gpu_length' || key === 'max_cooler_height') return `${str} mm`;
  if (key === 'screen_size') return `${str}"`;
  if (key === 'read_speed' || key === 'write_speed') return `${str} MB/s`;
  if (key === 'memory_bus') return `${str}-bit`;
  return str;
}

function formatSpecLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b(gb|mhz|mm|tdp|rgb|usb)\b/gi, (m) => m.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
}

export function CompareTable({ parts, onSelect }: CompareTableProps) {
  // Collect all spec keys present across parts, organized by group
  const specRows = useMemo(() => {
    const allKeys = new Set<string>();
    parts.forEach((p) => {
      Object.keys(p.specs).forEach((k) => allKeys.add(k));
    });

    const rows: { group: string; key: string }[] = [];
    const used = new Set<string>();

    for (const group of SPEC_GROUPS) {
      for (const key of group.keys) {
        if (allKeys.has(key)) {
          rows.push({ group: group.label, key });
          used.add(key);
        }
      }
    }

    // Add any remaining keys not in predefined groups
    for (const key of allKeys) {
      if (!used.has(key)) {
        rows.push({ group: 'Other', key });
      }
    }

    return rows;
  }, [parts]);

  // Group rows by their group label
  const groupedRows = useMemo(() => {
    const groups: { label: string; rows: string[] }[] = [];
    let currentGroup = '';
    let currentRows: string[] = [];

    for (const row of specRows) {
      if (row.group !== currentGroup) {
        if (currentRows.length > 0) {
          groups.push({ label: currentGroup, rows: currentRows });
        }
        currentGroup = row.group;
        currentRows = [];
      }
      currentRows.push(row.key);
    }
    if (currentRows.length > 0) {
      groups.push({ label: currentGroup, rows: currentRows });
    }

    return groups;
  }, [specRows]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[500px]">
        {/* Header - Part names */}
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-3 text-xs text-white/50 font-medium uppercase tracking-wide w-[180px] sticky left-0 bg-[#0a0a0a] z-10">
              Spec
            </th>
            {parts.map((part) => (
              <th key={part.id} className="p-3 text-left min-w-[180px]">
                <div className="text-[10px] text-white/40 uppercase tracking-wide">
                  {part.brand}
                </div>
                <div className="text-sm font-medium text-white mt-0.5 truncate max-w-[200px]">
                  {part.name}
                </div>
                {onSelect && (
                  <button
                    onClick={() => onSelect(part)}
                    className="mt-2 flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Select
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groupedRows.map((group) => (
            <GroupSection
              key={group.label}
              label={group.label}
              specKeys={group.rows}
              parts={parts}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupSection({
  label,
  specKeys,
  parts,
}: {
  label: string;
  specKeys: string[];
  parts: ComparePart[];
}) {
  return (
    <>
      {/* Group header */}
      <tr>
        <td
          colSpan={parts.length + 1}
          className="pt-4 pb-2 px-3 text-xs font-semibold text-white/60 uppercase tracking-wider"
        >
          {label}
        </td>
      </tr>

      {/* Spec rows */}
      {specKeys.map((key) => {
        const values = parts.map((p) => p.specs[key]);
        const stringValues = values.map((v) =>
          v !== null && v !== undefined ? String(v) : null
        );
        const nonNullValues = stringValues.filter(Boolean);
        const allSame = nonNullValues.length > 0 && nonNullValues.every((v) => v === nonNullValues[0]);
        const isDifferent = nonNullValues.length > 1 && !allSame;

        return (
          <tr key={key} className="border-b border-white/5">
            <td className="p-3 text-xs text-white/50 font-medium sticky left-0 bg-[#0a0a0a] z-10">
              {formatSpecLabel(key)}
            </td>
            {parts.map((part) => (
              <td
                key={part.id}
                className={`p-3 text-sm text-white/80 ${
                  isDifferent ? 'bg-amber-500/5' : ''
                }`}
              >
                {formatSpecValue(key, part.specs[key])}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}
