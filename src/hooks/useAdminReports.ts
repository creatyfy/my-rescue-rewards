import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AdminEstablishment,
  AdminProfile,
  AdminReceiptSummary,
  AdminRedemption,
  AdminUser,
  fetchAdminEstablishments,
  fetchAdminProfiles,
  fetchAdminReceiptsSummary,
  fetchAdminRedemptions,
  fetchAdminUsers,
} from "@/integrations/supabase/admin";

export type PeriodFilter = "last7" | "last15" | "last30" | "custom";

export type UserSearchResult = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
};

export type EstablishmentMetrics = {
  totalReceipts: number;
  approvedReceipts: number;
  rejectedReceipts: number;
  pendingReceipts: number;
  totalPurchaseValue: number;
  pointsGenerated: number;
  uniqueUsers: number;
  dailyData: Array<{
    date: string;
    receipts: number;
    points: number;
    value: number;
  }>;
};

export function useAdminReports() {
  const [receipts, setReceipts] = useState<AdminReceiptSummary[]>([]);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("last30");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [establishmentFilter, setEstablishmentFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [receiptData, redemptionData, establishmentData, userData, profileData] = await Promise.all([
        fetchAdminReceiptsSummary(),
        fetchAdminRedemptions(),
        fetchAdminEstablishments(),
        fetchAdminUsers(),
        fetchAdminProfiles(),
      ]);
      setReceipts(receiptData);
      setRedemptions(redemptionData);
      setEstablishments(establishmentData);
      setUsers(userData);
      setProfiles(profileData);
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // User lookup map
  const userLookup = useMemo(() => {
    const map = new Map<string, UserSearchResult>();
    users.forEach((user) => {
      map.set(user.user_id, {
        user_id: user.user_id,
        email: user.email ?? null,
        full_name: user.full_name ?? null,
        cpf: null,
        phone: null,
      });
    });
    profiles.forEach((profile) => {
      const current = map.get(profile.user_id);
      map.set(profile.user_id, {
        user_id: profile.user_id,
        email: current?.email ?? null,
        full_name: profile.full_name ?? current?.full_name ?? null,
        cpf: profile.cpf ?? null,
        phone: profile.phone ?? null,
      });
    });
    return map;
  }, [users, profiles]);

  // User search results
  const userSearchResults = useMemo(() => {
    if (!userSearchQuery.trim()) {
      return [];
    }

    setIsSearching(true);
    const query = userSearchQuery.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, "");
    
    const results = Array.from(userLookup.values())
      .map((user) => {
        // Calculate relevance score for better sorting
        let score = 0;
        const nameLower = user.full_name?.toLowerCase() ?? "";
        const emailLower = user.email?.toLowerCase() ?? "";
        const cpfDigits = user.cpf?.replace(/\D/g, "") ?? "";
        const phoneDigits = user.phone?.replace(/\D/g, "") ?? "";
        
        // Exact email match gets highest priority
        if (emailLower === query) {
          score = 100;
        } else if (emailLower.includes(query)) {
          score = 80;
        } else if (nameLower === query) {
          score = 70;
        } else if (nameLower.includes(query)) {
          score = 50;
        } else if (queryDigits && cpfDigits.includes(queryDigits)) {
          score = 40;
        } else if (queryDigits && phoneDigits.includes(queryDigits)) {
          score = 30;
        }
        
        return { user, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ user }) => user);
    
    // Simulate debounce effect
    setTimeout(() => setIsSearching(false), 200);
    return results.slice(0, 10);
  }, [userSearchQuery, userLookup]);

  // Date range calculation
  const dateRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (periodFilter === "custom") {
      return { 
        start: customStartDate ?? null, 
        end: customEndDate ?? null 
      };
    }

    const days = periodFilter === "last7" ? 7 : periodFilter === "last15" ? 15 : 30;
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }, [periodFilter, customStartDate, customEndDate]);

  const isWithinRange = useCallback((dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return false;
    if (dateRange.start && date < dateRange.start) return false;
    if (dateRange.end && date > dateRange.end) return false;
    return true;
  }, [dateRange]);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      if (!isWithinRange(receipt.created_at)) return false;
      if (establishmentFilter !== "all" && receipt.establishment_id !== establishmentFilter) return false;
      if (userFilter !== "all" && receipt.user_id !== userFilter) return false;
      return true;
    });
  }, [receipts, establishmentFilter, userFilter, isWithinRange]);

  // User IDs related to filtered receipts (for establishment filter)
  const userIdsForEstablishment = useMemo(() => {
    if (establishmentFilter === "all") return null;
    return new Set(filteredReceipts.map((receipt) => receipt.user_id));
  }, [filteredReceipts, establishmentFilter]);

  // Filtered redemptions
  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      if (!isWithinRange(redemption.created_at)) return false;
      if (userFilter !== "all" && redemption.user_id !== userFilter) return false;
      if (userIdsForEstablishment && !userIdsForEstablishment.has(redemption.user_id)) return false;
      return true;
    });
  }, [redemptions, userFilter, isWithinRange, userIdsForEstablishment]);

  // Summary metrics
  const summary = useMemo(() => {
    const receiptTotals = filteredReceipts.reduce(
      (acc, receipt) => {
        acc.total += 1;
        acc.purchaseValue += Number(receipt.purchase_value);
        if (receipt.status === "approved") {
          acc.approved += 1;
          acc.pointsEarned += receipt.points;
        } else if (receipt.status === "rejected") {
          acc.rejected += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, approved: 0, rejected: 0, pending: 0, purchaseValue: 0, pointsEarned: 0 },
    );

    const redemptionTotals = filteredRedemptions.reduce(
      (acc, redemption) => {
        acc.total += 1;
        if (redemption.status === "completed") {
          acc.completed += 1;
          acc.pointsSpent += redemption.points_spent;
        } else if (redemption.status === "cancelled") {
          acc.cancelled += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, cancelled: 0, pointsSpent: 0 },
    );

    const uniqueUsers = new Set(filteredReceipts.map((r) => r.user_id)).size;

    return {
      receiptTotals,
      redemptionTotals,
      uniqueUsers,
      activeEstablishments: establishments.filter((e) => e.active).length,
    };
  }, [filteredReceipts, filteredRedemptions, establishments]);

  // Establishment-specific metrics
  const establishmentMetrics = useMemo((): EstablishmentMetrics | null => {
    if (establishmentFilter === "all") return null;

    const estReceipts = filteredReceipts;
    const uniqueUserIds = new Set(estReceipts.map((r) => r.user_id));

    // Group by date for chart data
    const dailyMap = new Map<string, { receipts: number; points: number; value: number }>();
    
    estReceipts.forEach((receipt) => {
      const date = new Date(receipt.created_at).toISOString().split("T")[0];
      const existing = dailyMap.get(date) ?? { receipts: 0, points: 0, value: 0 };
      dailyMap.set(date, {
        receipts: existing.receipts + 1,
        points: existing.points + (receipt.status === "approved" ? receipt.points : 0),
        value: existing.value + Number(receipt.purchase_value),
      });
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalReceipts: estReceipts.length,
      approvedReceipts: estReceipts.filter((r) => r.status === "approved").length,
      rejectedReceipts: estReceipts.filter((r) => r.status === "rejected").length,
      pendingReceipts: estReceipts.filter((r) => r.status === "pending").length,
      totalPurchaseValue: estReceipts.reduce((sum, r) => sum + Number(r.purchase_value), 0),
      pointsGenerated: estReceipts
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + r.points, 0),
      uniqueUsers: uniqueUserIds.size,
      dailyData,
    };
  }, [establishmentFilter, filteredReceipts]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setPeriodFilter("last30");
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setEstablishmentFilter("all");
    setUserFilter("all");
    setUserSearchQuery("");
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      periodFilter !== "last30" ||
      establishmentFilter !== "all" ||
      userFilter !== "all"
    );
  }, [periodFilter, establishmentFilter, userFilter]);

  return {
    // Data
    receipts: filteredReceipts,
    redemptions: filteredRedemptions,
    establishments,
    summary,
    establishmentMetrics,
    userLookup,
    userSearchResults,

    // State
    loading,
    error,
    isSearching,

    // Filter values
    periodFilter,
    customStartDate,
    customEndDate,
    establishmentFilter,
    userFilter,
    userSearchQuery,
    hasActiveFilters,

    // Filter setters
    setPeriodFilter,
    setCustomStartDate,
    setCustomEndDate,
    setEstablishmentFilter,
    setUserFilter,
    setUserSearchQuery,

    // Actions
    clearFilters,
    refresh: loadData,
  };
}
