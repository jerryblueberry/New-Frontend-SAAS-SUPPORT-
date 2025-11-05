import React, { useMemo } from 'react'
import { Box, Stack, Typography, Chip, Divider, Button, Paper, LinearProgress, Grid, Alert } from '@mui/material'
import { CheckCircle, CloudUpload, Error, Pending } from '@mui/icons-material'
import CloudinaryUploadButton from '../../common/CloudinaryUploadButton'
import { useClientProfileQuery, useUpsertClientStepMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'

export default function ClientDocumentUpload() {
  const { data: profile } = useClientProfileQuery()
  const upsert = useUpsertClientStepMutation()
  const store = useClientOnboarding()

  const handleDocUpload = async (key, fileInfo) => {
    await upsert.mutateAsync({ 
      step: 2, 
      payload: { documents: { [key]: { url: fileInfo.url } } } 
    })
  }

  const accountType = profile?.accountType || 'individual'
  const isOrganization = accountType === 'organization'

  // Document status helper
  const getDocStatus = (key) => {
    const doc = profile?.documents?.[key]
    return {
      url: doc?.url,
      status: doc?.status || 'pending',
      notes: doc?.notes
    }
  }

  const identityDoc = getDocStatus('identityProof')
  const abnDoc = getDocStatus('abnCertificate')
  const insuranceDoc = getDocStatus('insuranceCertificate')

  // Calculate step-specific progress
  const localProgress = useMemo(() => {
    let required = isOrganization ? 2 : 1 // ABN + insurance OR just identity
    let uploaded = 0
    
    if (isOrganization) {
      if (abnDoc.url) uploaded++
      if (insuranceDoc.url) uploaded++
    } else {
      if (identityDoc.url) uploaded++
    }
    
    return Math.round((uploaded / required) * 100)
  }, [isOrganization, identityDoc, abnDoc, insuranceDoc])

  const stepCompleted = profile?.profileCompleteness?.completedSteps?.verification
  const canContinue = stepCompleted

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'under_review': return 'warning'
      default: return 'default'
    }
  }

  // Status icon helper
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle fontSize="small" />
      case 'rejected': return <Error fontSize="small" />
      case 'under_review': return <Pending fontSize="small" />
      default: return null
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Document Upload & Verification
      </Typography>

      {/* Step Progress */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>Step 2 Progress</Typography>
          <Typography variant="caption" fontWeight={600}>{localProgress}%</Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={localProgress} 
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1
            }
          }}
        />
      </Paper>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        {isOrganization 
          ? 'Organizations must upload ABN certificate and insurance documents.'
          : 'Please upload proof of identity (Driver\'s License, Passport, etc.).'
        }
      </Alert>

      {/* Document Upload Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Identity Proof (Individual only) */}
        {!isOrganization && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Identity Proof *
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Driver's License, Passport, or Government ID
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {identityDoc.url && (
                    <Chip
                      size="small"
                      label={identityDoc.status}
                      color={getStatusColor(identityDoc.status)}
                      icon={getStatusIcon(identityDoc.status)}
                    />
                  )}
                  <CloudinaryUploadButton
                    label={identityDoc.url ? 'Re-upload' : 'Upload'}
                    onUploaded={(f) => handleDocUpload('identityProof', f)}
                    disabled={upsert.isLoading}
                  />
                </Stack>
              </Stack>
              {identityDoc.notes && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">{identityDoc.notes}</Typography>
                </Alert>
              )}
            </Paper>
          </Grid>
        )}

        {/* ABN Certificate (Organization only) */}
        {isOrganization && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    ABN Certificate *
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Official ABN registration document
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {abnDoc.url && (
                    <Chip
                      size="small"
                      label={abnDoc.status}
                      color={getStatusColor(abnDoc.status)}
                      icon={getStatusIcon(abnDoc.status)}
                    />
                  )}
                  <CloudinaryUploadButton
                    label={abnDoc.url ? 'Re-upload' : 'Upload'}
                    onUploaded={(f) => handleDocUpload('abnCertificate', f)}
                    disabled={upsert.isLoading}
                  />
                </Stack>
              </Stack>
              {abnDoc.notes && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">{abnDoc.notes}</Typography>
                </Alert>
              )}
            </Paper>
          </Grid>
        )}

        {/* Insurance Certificate (Organization only) */}
        {isOrganization && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Insurance Certificate *
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Public liability or professional indemnity insurance
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {insuranceDoc.url && (
                    <Chip
                      size="small"
                      label={insuranceDoc.status}
                      color={getStatusColor(insuranceDoc.status)}
                      icon={getStatusIcon(insuranceDoc.status)}
                    />
                  )}
                  <CloudinaryUploadButton
                    label={insuranceDoc.url ? 'Re-upload' : 'Upload'}
                    onUploaded={(f) => handleDocUpload('insuranceCertificate', f)}
                    disabled={upsert.isLoading}
                  />
                </Stack>
              </Stack>
              {insuranceDoc.notes && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">{insuranceDoc.notes}</Typography>
                </Alert>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Navigation Buttons */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between">
        <Button 
          variant="outlined" 
          onClick={() => store.goPrev()} 
          sx={{ textTransform: 'none' }}
          disabled={upsert.isLoading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          sx={{ textTransform: 'none' }}
          disabled={!canContinue || upsert.isLoading}
          onClick={() => store.goNext()}
        >
          Continue
        </Button>
      </Stack>
    </Box>
  )
}