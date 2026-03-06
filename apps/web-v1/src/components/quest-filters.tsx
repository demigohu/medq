"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

interface QuestFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: FiltersState) => void;
}

export interface FiltersState {
  type: string[];
  category: string[];
  difficulty: string[];
  status: string[];
}

export function QuestFilters({ onSearch, onFilterChange }: QuestFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    type: [],
    category: [],
    difficulty: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleFilter = (category: keyof FiltersState, value: string) => {
    const newFilters = { ...filters };
    const index = newFilters[category].indexOf(value);
    if (index > -1) {
      newFilters[category].splice(index, 1);
    } else {
      newFilters[category].push(value);
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({ type: [], category: [], difficulty: [], status: [] });
    setSearchTerm("");
    onSearch("");
    onFilterChange({ type: [], category: [], difficulty: [], status: [] });
  };

  const hasActiveFilters =
    searchTerm || Object.values(filters).some((arr) => arr.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div>
          <InputGroup>
            <InputGroupInput
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

      </div>
    </div>
  );
}
