import React, { useState, useMemo, useCallback } from "react";
import { Container, useTheme, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  DashboardLayout,
  DashboardHeader,
  KeyMetricsGrid,
  AdditionalMetricsRow,
  InsightsCard,
  GrowthAnalyticsSection,
  ClientAnalyticsSection,
  TopCategoriesSection,
  ReferenceAnalyticsSection,
  NotificationTimesheetSection,
  ActivitySystemHealthSection,
  QuickActionsSection,
  MetaInformation
} from "../../../components/AdminDashboard";

/**
 * AdminDashboard Component
 * Main dashboard page for administrators
 * Displays comprehensive analytics, metrics, and system health information
 * 
 * Architecture:
 * - Uses React Query for data fetching and caching
 * - Implements code splitting with dedicated section components
 * - Optimized with React.memo and useMemo for performance
 * - Responsive design with Material-UI breakpoints
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State Management
  const [refreshKey, setRefreshKey] = useState(0);
  const [period, setPeriod] = useState('30d');
  const [chartFilter, setChartFilter] = useState('all');

  // Data Fetching with React Query
  const { data: dashboardData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard-overview', refreshKey, period],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/overview', {
        params: { period, includeDetailed: 'true' }
      });
      return response.data;
    },
    refetchInterval: 60000, // 1 minute for production
    retry: 3,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true,
  });

  // Data Extraction
  const { data } = dashboardData || {};
  const { 
    overview, 
    userAnalytics,
    workerAnalytics,
    clientAnalytics, 
    referenceAnalytics,
    notificationAnalytics,
    timesheetAnalytics,
    engagementMetrics,
    insights,
    recentActivity, 
    systemHealth,
    meta
  } = data || {};

  // Memoized Calculations
  const filteredClientGrowth = useMemo(() => {
    if (!clientAnalytics?.clientGrowth) return [];
    if (chartFilter === 'all') return clientAnalytics.clientGrowth;
    // Additional filter logic can be added here for specific date ranges
    return clientAnalytics.clientGrowth;
  }, [clientAnalytics?.clientGrowth, chartFilter]);

  const metricsData = useMemo(() => ({
    totalUsers: overview?.totalUsers || 0,
    activeWorkers: overview?.activeWorkers || 0,
    totalClients: overview?.totalClients || 0,
    deletedClients: overview?.deletedClients || 0,
    activeClients: overview?.activeClients || 0,
    pendingReferences: overview?.pendingReferences || 0,
    pendingTimesheets: overview?.pendingTimesheets || 0,
    completionRate: overview?.completionRate || 0,
    referenceCompletionRate: overview?.referenceCompletionRate || 0,
  }), [overview]);

  // Event Handlers
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetch();
  }, [refetch]);

  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
  }, []);

  const handleChartFilterChange = useCallback((event, newValue) => {
    setChartFilter(newValue);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Render with Layout Component (handles loading and error states)
  return (
    <DashboardLayout
      isLoading={isLoading}
      error={error}
      onRetry={handleRefresh}
      navigate={navigate}
    >
      <Container maxWidth={false} disableGutters sx={{ width: '100%', p: 0, m: 0 }}>
        {/* Dashboard Header */}
        <DashboardHeader
          period={period}
          onPeriodChange={handlePeriodChange}
          onRefresh={handleRefresh}
          isFetching={isFetching}
          onNavigateWorkers={() => navigate('/admin/workers')}
          onNavigateClients={() => navigate('/admin/clients')}
        />

        {/* Key Metrics Grid */}
        <KeyMetricsGrid
          metricsData={metricsData}
          overview={overview}
        />

        {/* Additional Metrics Row */}
        <AdditionalMetricsRow
          referenceAnalytics={referenceAnalytics}
          metricsData={metricsData}
          engagementMetrics={engagementMetrics}
          systemHealth={systemHealth}
          theme={theme}
        />

        {/* Insights Section - Strategic recommendations */}
        {insights && (insights.insights?.length > 0 || insights.summary) && (
          <Box sx={{ mb: 3 }}>
            <InsightsCard insights={insights} loading={isLoading} />
          </Box>
        )}

        {/* Growth Analytics Section */}
        <GrowthAnalyticsSection
          userAnalytics={userAnalytics}
          workerAnalytics={workerAnalytics}
          clientGrowth={filteredClientGrowth}
          period={period}
          chartFilter={chartFilter}
          onChartFilterChange={handleChartFilterChange}
        />

        {/* Client Analytics Section */}
        <ClientAnalyticsSection
          clientAnalytics={clientAnalytics}
          period={period}
        />

        {/* Top Categories & Skills Section */}
        <TopCategoriesSection
          clientAnalytics={clientAnalytics}
          workerAnalytics={workerAnalytics}
        />

        <Box>
          
        </Box>
        {/* Reference Analytics Section */}
        <ReferenceAnalyticsSection
          referenceAnalytics={referenceAnalytics}
        />

        {/* Notifications & Timesheets Section */}
        <NotificationTimesheetSection
          notificationAnalytics={notificationAnalytics}
          timesheetAnalytics={timesheetAnalytics}
        />

        {/* Activity & System Health Section */}
        <ActivitySystemHealthSection
          recentActivity={recentActivity}
          systemHealth={systemHealth}
        />

        {/* Meta Information */}
        <MetaInformation
          meta={meta}
          executionTime={dashboardData?.executionTime}
          period={period}
        />

        {/* Quick Actions Section */}
        <QuickActionsSection
          onNavigate={handleNavigate}
        />
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard;
