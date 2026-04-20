"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { TeaCategory, TeaOrigin } from "@/lib/types/product";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: TeaCategory[];
  origins: TeaOrigin[];
  filters: {
    category?: string | undefined;
    origin?: string | undefined;
    season?: string | undefined;
    priceRange?: [number, number] | undefined;
  };
  onFilterChange: (filters: {
    category?: string | undefined;
    origin?: string | undefined;
    season?: string | undefined;
    priceRange?: [number, number] | undefined;
  }) => void;
  className?: string;
}

const SEASONS = [
  { value: "spring", label: "Spring", emoji: "🌸" },
  { value: "summer", label: "Summer", emoji: "☀️" },
  { value: "autumn", label: "Autumn", emoji: "🍂" },
  { value: "winter", label: "Winter", emoji: "❄️" },
];

/**
 * Filter Sidebar Component
 * Tea catalog filtering with Eastern aesthetic
 */
export function FilterSidebar({
  categories,
  origins,
  filters,
  onFilterChange,
  className,
}: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState({
    category: true,
    origin: true,
    season: false,
    price: false,
  });

  const toggleExpand = useCallback((key: keyof typeof isExpanded) => {
    setIsExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const hasActiveFilters =
    filters.category ||
    filters.origin ||
    filters.season ||
    filters.priceRange;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <aside
      className={cn(
        "w-full lg:w-64 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between lg:justify-start gap-2
                      pb-4 border-b border-ivory-300/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-tea-600" />
          <h2 className="font-serif text-lg text-bark-900">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-tea-600 hover:text-tea-700 
                     transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence mode="popLayout">
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pb-4"
          >
            {filters.category && (
              <ActiveFilter
                label={
                  categories.find((c) => c.slug === filters.category)?.name ||
                  "Category"
                }
                onRemove={() => onFilterChange({ ...filters, category: undefined } as typeof filters)}
              />
            )}
            {filters.origin && (
              <ActiveFilter
                label={
                  origins.find((o) => o.slug === filters.origin)?.name ||
                  "Origin"
                }
                onRemove={() => onFilterChange({ ...filters, origin: undefined } as typeof filters)}
              />
            )}
            {filters.season && (
              <ActiveFilter
                label={SEASONS.find((s) => s.value === filters.season)?.label ||
                  "Season"}
                onRemove={() => onFilterChange({ ...filters, season: undefined } as typeof filters)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Filter */}
      <FilterSection
        title="Categories"
        isExpanded={isExpanded.category}
        onToggle={() => toggleExpand("category")}
      >
        <div className="space-y-1">
          {categories.map((category) => (
            <FilterCheckbox
              key={category.slug}
              id={`category-${category.slug}`}
              label={category.name}
              checked={filters.category === category.slug}
            onChange={() =>
              onFilterChange({
                ...filters,
                category:
                  filters.category === category.slug
                    ? (undefined as unknown as string | undefined)
                    : category.slug,
              })
            }
            />
          ))}
        </div>
      </FilterSection>

      {/* Origins Filter */}
      <FilterSection
        title="Origins"
        isExpanded={isExpanded.origin}
        onToggle={() => toggleExpand("origin")}
      >
        <div className="space-y-1">
          {origins.map((origin) => (
            <FilterCheckbox
              key={origin.slug}
              id={`origin-${origin.slug}`}
              label={origin.name}
              checked={filters.origin === origin.slug}
            onChange={() =>
              onFilterChange({
                ...filters,
                origin:
                  filters.origin === origin.slug
                    ? (undefined as unknown as string | undefined)
                    : origin.slug,
              })
            }
            />
          ))}
        </div>
      </FilterSection>

      {/* Seasons Filter */}
      <FilterSection
        title="Harvest Season"
        isExpanded={isExpanded.season}
        onToggle={() => toggleExpand("season")}
      >
        <div className="grid grid-cols-2 gap-2">
          {SEASONS.map((season) => (
            <FilterButton
              key={season.value}
              label={season.label}
              emoji={season.emoji}
              isActive={filters.season === season.value}
            onClick={() =>
              onFilterChange({
                ...filters,
                season:
                  filters.season === season.value
                    ? (undefined as unknown as string | undefined)
                    : season.value,
              })
            }
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

/**
 * Filter Section with collapse functionality
 */
function FilterSection({
  title,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-ivory-300/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3
                  text-bark-900 hover:text-tea-700 transition-colors"
      >
        <h3 className="font-serif">{title}</h3>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Filter Checkbox
 */
function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 py-1.5 cursor-pointer
                text-sm text-bark-700 hover:text-bark-900 transition-colors"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-ivory-400 text-tea-600 
                 focus:ring-tea-500/20 cursor-pointer"
      />
      <span className={cn(checked && "font-medium text-bark-900")}>
        {label}
      </span>
    </label>
  );
}

/**
 * Filter Button (for seasons)
 */
function FilterButton({
  label,
  emoji,
  isActive,
  onClick,
}: {
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded text-sm transition-all duration-200",
        isActive
          ? "bg-tea-600 text-ivory-50 border-tea-600"
          : "bg-ivory-50 text-bark-700 border border-ivory-300/50 " +
            "hover:border-tea-500/30 hover:bg-tea-50/30"
      )}
    >
      <span className="mr-1">{emoji}</span>
      {label}
    </button>
  );
}

/**
 * Active Filter Chip
 */
function ActiveFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 
                   bg-tea-100 text-tea-800 text-sm rounded">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-tea-600 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export { FilterSection, FilterCheckbox, ActiveFilter };
