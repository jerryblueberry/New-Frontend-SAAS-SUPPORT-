import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Chip, Button, Stack } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProgressNotes } from '../../../api/progressNote';
import { useOnboardingQuery } from '../../../stores/useOnboardingStore';
import CustomFieldsRenderer from '../CustomFields/CustomFieldsRenderer';
import dayjs from "dayjs";
import TimesheetandNoteAuditLog from '../../NoteTimesheetAuditLog/TimesheetandNoteAuditLog';
import {useNavigate} from 'react-router-dom'
const TimesheetProgressNote = ({ timesheet }) => {

  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const { data: onboardingData, isLoading: isOnboardingLoading } = useOnboardingQuery();
  const workerId = onboardingData?.data?.profile?.user;
  const timesheetId = timesheet?._id;

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['progressNotes', timesheetId, page, limit],
    queryFn: () => fetchProgressNotes({ timesheetId, workerId, page, limit }),
    enabled: !!timesheetId,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const refetchProgressNotes = () => {
    queryClient.invalidateQueries(['progressNotes', timesheetId]);
  };

  if (!timesheetId) return <Typography>No timesheet selected.</Typography>;
  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Error: {error?.message}</Typography>;

  const progressNotes = data?.data || [];
  const totalPages = Math.ceil(data?.total / limit) || 1;

  console.log("Progress Notes 2", progressNotes)
  console.log("StructureDat a", progressNotes?.items[0]?.structuredData)

  return (
    <Box sx={{ width: { xs: '100%', sm: 650, md: 800 }, mx: 'auto', p: { xs: 1, sm: 2 } }}>
      {progressNotes.length === 0 ? (
        <Typography>No progress notes found.</Typography>
      ) : (
        <Box>
          {progressNotes?.items?.map((note) => (
            <Box
              key={note._id}
              sx={{
                minHeight: '120px',
                mb: 6,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                p: { xs: 1.5, sm: 2 },
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {/* Header section with category and tags */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 2 },
                  pb: 2,
                  borderBottom: '3px solid',
                  borderColor: ' #6F8D6A'
                }}
              >
                <Chip
                  label={`Category: ${note.category || 'Uncategorized'}`}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    textTransform: 'capitalize',
                    color: 'white',
                    backgroundColor: 'primary.main',
                    maxWidth: '100%',
                  }}
                />

                {note.tags.length > 0 && (
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 0.5,
                  }}>
                    <Typography sx={{
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      Tags:
                    </Typography>
                    {note.tags.map((noteTag, index) => (
                      <Chip
                        key={index}
                        label={noteTag}
                        size="small"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          textTransform: 'capitalize',
                          backgroundColor: 'secondary.light',
                          color: 'secondary.contrastText',
                          mx: 0.2,
                          mb: 0.5
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/*  FOr the See Audit log button maybe later redesign  */}
                <Box onClick = {() => navigate()}>
                  <Chip
                    label="Logs"
                    sx={{
                      cursor:'pointer'
                    }}
                  />
                </Box>
              </Box>



              {/* Content section */}
              <Box sx={{ mt: 1, mb: 2.5, }}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  // marginTop: 1,
                  display: 'flex',
                  fontFamily: 'sans-serif',
                  fontSize: { xs: "0.8rem", md: '1.1rem' },
                  fontWeight: 'bold'
                }}>
                  Client Details:
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 500,

                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Client Name: {note.clientName}
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 500,

                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  NDIS Number: 123456789
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 500,

                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Mobile Number: 123456789
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 500,

                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Email Address: mockuser@gmail.com
                </Typography>
                <Typography variant="body1" sx={{
                  fontWeight: 500,

                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Price Book: Later add this feature
                </Typography>



              </Box>





              {/* Structured Data behaviours */}



              <Box sx={{
                borderTop: '3px solid #E3BD33',
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  marginTop: 1,
                  display: 'flex',
                  fontFamily: 'sans-serif',
                  fontSize: { xs: "0.8rem", md: '1.1rem' },
                  fontWeight: 'bold'
                }}>
                  Behaviours Section
                </Typography>
                {note?.structuredData?.behaviors?.map((b, index) => (
                  <Box key={b._id || index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" >
                      Behaviours:  {b.behavior} — {b.frequency}
                    </Typography>
                    <Box sx={{
                      // px:{xs:'0',md:'1rem'},
                      mx: { xs: '0', md: '1rem' },
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'baseline', md: 'center' },
                      justifyContent: 'space-between'
                    }}>
                      {/* Triggers */}
                      {b.triggers?.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontWeight: 'bold',
                            mb: '0.3rem'
                          }}>
                            Triggers:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {b.triggers.map((trigger, i) => (
                              <Chip
                                key={i}
                                label={trigger}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Interventions (same style, optional) */}
                      {b.interventions?.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontWeight: 'bold',
                            mb: '0.3rem'
                          }}>
                            Interventions:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {b.interventions.map((intervention, i) => (
                              <Chip
                                key={i}
                                label={intervention}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>

                  </Box>
                ))}
              </Box>




              {/* Custom Fields (commented out) */}
              {/* <CustomFieldsRenderer customFields={note.customFields} readOnly={true} 
                onChange={(fieldId, value) => {
                  setForm(prev => ({
                    ...prev,
                    customFields: prev.customFields.map(f => f._id === fieldId ? { ...f, value } : f),
                  }));
                }}
              /> */}

              <Typography variant="body2" sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.8rem' }
              }}>
                Created: {dayjs(note.createdAt).format("MMM D, YYYY hh:mm A")}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Typography sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            fontSize: { xs: '0.8rem', sm: '0.9rem' }
          }}>
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </Stack>
      )}

      <Typography sx={{
        fontWeight: 700,
        mx: 'auto'
      }}>
        Audit Log
      </Typography>
      <Box sx={{
        p: 0,
        m: 0
      }}>
        <TimesheetandNoteAuditLog progressNotes={progressNotes} />
      </Box>


    </Box>
  );
};

export default TimesheetProgressNote;