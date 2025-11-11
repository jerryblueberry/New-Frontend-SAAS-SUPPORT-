/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT AUDIT LOG STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Store for audit log history and summary.
 * Audit logs are NOT persisted (fetched on demand).
 * 
 * @module stores/clientStores/auditLogStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Initial state for audit log store
 */
const initialState = {
	history: [],
	summary: null,
	isLoading: false,
	error: null,
}

/**
 * Client Audit Log Store
 * Manages audit log history and summary for compliance tracking
 */
export const useClientAuditLogStore = create(
	devtools(
		(set) => ({
			...initialState,

			// ─── Audit Log Actions ───────────────────────────────────────────

			/**
			 * Set audit log history
			 * @param {Array} history - Array of audit log entries
			 */
			setAuditHistory: (history) => {
				set({
					history: history || [],
					isLoading: false,
					error: null,
				})
			},

			/**
			 * Set audit log summary
			 * @param {Object} summary - Audit summary statistics
			 */
			setAuditSummary: (summary) => {
				set({
					summary: summary || null,
					isLoading: false,
					error: null,
				})
			},

			/**
			 * Set audit log loading state
			 * @param {boolean} isLoading - Loading state
			 */
			setAuditLoading: (isLoading) => {
				set({ isLoading })
			},

			/**
			 * Set audit log error
			 * @param {Error|null} error - Error object or null
			 */
			setAuditError: (error) => {
				set({
					error,
					isLoading: false,
				})
			},

			/**
			 * Reset audit log store to initial state
			 */
			resetAuditLogs: () => {
				set(initialState)
			},
		}),
		{
			name: 'client-audit-log-store',
		}
	)
)

