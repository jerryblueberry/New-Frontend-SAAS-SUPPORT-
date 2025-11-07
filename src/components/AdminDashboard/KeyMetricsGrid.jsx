import React from "react";
import { Grid } from "@mui/material";
import { People, Work, Business, Delete, Person, Assignment, Schedule, CheckCircle } from "@mui/icons-material";
import MetricCard from "./MetricCard";
import PropTypes from "prop-types";

/**
 * KeyMetricsGrid Component
 * Displays a grid of key performance metrics
 */
const KeyMetricsGrid = React.memo(({ metricsData, overview }) => {
  return (
    <Grid 
      container 
      spacing={{ xs: 1, sm: 1.5, md: 2 }} 
      sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}
    >
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Total Users"
          value={metricsData.totalUsers}
          icon={<People />}
          color="primary"
          subtitle="Registered"
          trend={overview?.trending?.users?.changePercentage}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Workers"
          value={metricsData.activeWorkers}
          icon={<Work />}
          color="success"
          subtitle="Active now"
          trend={overview?.trending?.workers?.changePercentage}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Total Clients"
          value={metricsData.totalClients}
          icon={<Business />}
          color="secondary"
          subtitle="Active profiles"
          trend={overview?.trending?.clients?.changePercentage}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Deleted Clients"
          value={metricsData.deletedClients}
          icon={<Delete />}
          color="error"
          subtitle="Soft deleted"
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Active Clients"
          value={metricsData.activeClients}
          icon={<Person />}
          color="info"
          subtitle="Verified"
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="References"
          value={metricsData.pendingReferences}
          icon={<Assignment />}
          color="warning"
          subtitle="Pending"
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Timesheets"
          value={metricsData.pendingTimesheets}
          icon={<Schedule />}
          color="error"
          subtitle="To approve"
        />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <MetricCard
          title="Completion Rate"
          value={Math.round(metricsData.completionRate)}
          icon={<CheckCircle />}
          color="success"
          subtitle="Client onboarding"
          trend={metricsData.completionRate > 80 ? 5 : -2}
        />
      </Grid>
    </Grid>
  );
});

KeyMetricsGrid.displayName = 'KeyMetricsGrid';

KeyMetricsGrid.propTypes = {
  metricsData: PropTypes.shape({
    totalUsers: PropTypes.number,
    activeWorkers: PropTypes.number,
    totalClients: PropTypes.number,
    deletedClients: PropTypes.number,
    activeClients: PropTypes.number,
    pendingReferences: PropTypes.number,
    pendingTimesheets: PropTypes.number,
    completionRate: PropTypes.number
  }).isRequired,
  overview: PropTypes.shape({
    trending: PropTypes.object
  })
};

export default KeyMetricsGrid;

