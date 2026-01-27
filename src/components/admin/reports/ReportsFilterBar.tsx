import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, X, Filter, ChevronDown, Building2, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { PeriodFilter, UserSearchResult } from "@/hooks/useAdminReports";
import type { AdminEstablishment } from "@/integrations/supabase/admin";

type ReportsFilterBarProps = {
  periodFilter: PeriodFilter;
  setPeriodFilter: (value: PeriodFilter) => void;
  customStartDate: Date | undefined;
  setCustomStartDate: (date: Date | undefined) => void;
  customEndDate: Date | undefined;
  setCustomEndDate: (date: Date | undefined) => void;
  establishmentFilter: string;
  setEstablishmentFilter: (value: string) => void;
  establishments: AdminEstablishment[];
  userFilter: string;
  setUserFilter: (value: string) => void;
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  userSearchResults: UserSearchResult[];
  isSearching: boolean;
  userLookup: Map<string, UserSearchResult>;
  hasActiveFilters: boolean;
  clearFilters: () => void;
};

export function ReportsFilterBar({
  periodFilter,
  setPeriodFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  establishmentFilter,
  setEstablishmentFilter,
  establishments,
  userFilter,
  setUserFilter,
  userSearchQuery,
  setUserSearchQuery,
  userSearchResults,
  isSearching,
  userLookup,
  hasActiveFilters,
  clearFilters,
}: ReportsFilterBarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  const selectedUser = userFilter !== "all" ? userLookup.get(userFilter) : null;
  const selectedEstablishment = establishmentFilter !== "all" 
    ? establishments.find((e) => e.id === establishmentFilter) 
    : null;

  const periodLabels: Record<PeriodFilter, string> = {
    last7: "Últimos 7 dias",
    last15: "Últimos 15 dias",
    last30: "Últimos 30 dias",
    custom: "Personalizado",
  };

  const activeFilterCount = [
    periodFilter !== "last30",
    establishmentFilter !== "all",
    userFilter !== "all",
  ].filter(Boolean).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/60 overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Filtros avançados</h3>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters ? (
                    <span className="flex items-center gap-1">
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                      filtros ativos
                    </span>
                  ) : (
                    "Nenhum filtro aplicado"
                  )}
                </p>
              </div>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4 border-t border-border/40">
            {/* Filter Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Period Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Clock className="h-3.5 w-3.5" />
                  Período
                </label>
                <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                  <SelectTrigger className="bg-background border-input hover:border-ring transition-colors">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="last7">Últimos 7 dias</SelectItem>
                    <SelectItem value="last15">Últimos 15 dias</SelectItem>
                    <SelectItem value="last30">Últimos 30 dias</SelectItem>
                    <SelectItem value="custom">Intervalo personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Establishment Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Building2 className="h-3.5 w-3.5" />
                  Estabelecimento
                </label>
                <Select value={establishmentFilter} onValueChange={setEstablishmentFilter}>
                  <SelectTrigger className="bg-background border-input hover:border-ring transition-colors">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">Todas as lojas</SelectItem>
                    {establishments.map((est) => (
                      <SelectItem key={est.id} value={est.id}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Search */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <User className="h-3.5 w-3.5" />
                  Usuário
                </label>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between bg-background border-input hover:border-ring transition-colors font-normal"
                    >
                      {selectedUser ? (
                        <span className="truncate">{selectedUser.full_name || selectedUser.email}</span>
                      ) : (
                        <span className="text-muted-foreground">Buscar usuário...</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-popover border-border z-50" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Nome, e-mail, CPF ou telefone..."
                        value={userSearchQuery}
                        onValueChange={setUserSearchQuery}
                      />
                      <CommandList>
                        {userFilter !== "all" && (
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setUserFilter("all");
                                setUserSearchQuery("");
                                setUserSearchOpen(false);
                              }}
                              className="text-muted-foreground"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Limpar seleção
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {isSearching && (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Buscando...
                          </div>
                        )}
                        {!isSearching && userSearchQuery && userSearchResults.length === 0 && (
                          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        )}
                        {!isSearching && userSearchResults.length > 0 && (
                          <CommandGroup heading="Resultados">
                            {userSearchResults.map((user) => (
                              <CommandItem
                                key={user.user_id}
                                onSelect={() => {
                                  setUserFilter(user.user_id);
                                  setUserSearchQuery("");
                                  setUserSearchOpen(false);
                                }}
                                className="flex flex-col items-start"
                              >
                                <span className="font-medium">
                                  {user.full_name || "Sem nome"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                  {user.cpf && ` • CPF: ${user.cpf}`}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Custom Date Range */}
            {periodFilter === "custom" && (
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Data inicial
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Data final
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background",
                          !customEndDate && "text-muted-foreground",
                          customEndDate && customStartDate && customEndDate < customStartDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                        disabled={(date) => customStartDate ? date < customStartDate : false}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {customEndDate && customStartDate && customEndDate < customStartDate && (
                  <p className="col-span-2 text-xs text-destructive">
                    A data final deve ser posterior à data inicial.
                  </p>
                )}
              </div>
            )}

            {/* Active Filters Display & Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Active Filter Badges */}
              {periodFilter !== "last30" && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  <Clock className="h-3 w-3" />
                  {periodLabels[periodFilter]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-destructive/20"
                    onClick={() => setPeriodFilter("last30")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedEstablishment && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  <Building2 className="h-3 w-3" />
                  {selectedEstablishment.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-destructive/20"
                    onClick={() => setEstablishmentFilter("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedUser && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  <User className="h-3 w-3" />
                  {selectedUser.full_name || selectedUser.email}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-destructive/20"
                    onClick={() => {
                      setUserFilter("all");
                      setUserSearchQuery("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {/* Clear All Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
