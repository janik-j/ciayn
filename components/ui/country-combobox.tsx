"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countries } from "@/lib/countries"

export interface CountryComboboxProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function CountryCombobox({ value, onChange, required = false }: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery.trim()) return countries
    
    const lowerCaseQuery = searchQuery.toLowerCase().trim()
    return countries.filter(country => 
      country.toLowerCase().startsWith(lowerCaseQuery)
    )
  }, [searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search country..." 
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery} 
          />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredCountries.map((country) => (
              <CommandItem
                key={country}
                value={country}
                onSelect={() => {
                  onChange(country)
                  setOpen(false)
                }}
              >
                {country}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === country ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 