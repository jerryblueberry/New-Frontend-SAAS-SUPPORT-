/**
 * ClientDashboard Page
 * Main page component that renders the ClientDashboard
 * 
 * This is a thin wrapper that imports the actual dashboard component
 * from the components folder, following the separation of concerns pattern.
 */

import React from 'react'
import { ClientDashboard } from '../../../components/ClientComponents/ClientDashboard'

/**
 * ClientDashboard Page Component
 */
const ClientDashboardPage = () => {
  return <ClientDashboard />
}

export default ClientDashboardPage
