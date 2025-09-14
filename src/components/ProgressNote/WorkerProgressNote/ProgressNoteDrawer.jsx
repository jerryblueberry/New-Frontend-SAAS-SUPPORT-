import React, { useMemo, useState } from 'react';
import { Drawer, Box, Typography, IconButton, Button, TextField, Grid, Select, MenuItem, Chip, Stack, FormControl, InputLabel, Checkbox, FormControlLabel, Divider } from '@mui/material';
import Close from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import dayjs from 'dayjs';
import AddProgressNoteDrawer from './AddProgressNoteDrawer';
import TimesheetProgressNote from './TimesheetProgressNote';


const ProgressNoteDrawer = ({ open, onClose, selectedTimesheet, timesheet }) => {

  const [drawerOpen, setDrawerOpen] = useState(false);


  return (
    <Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 650, md: 800 },
            maxWidth: '100%',
            height: '100vh',
            borderTopLeftRadius: { xs: 0, sm: 10 },
            borderBottomLeftRadius: { xs: 0, sm: 10 }
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ ml: { xs: '3.5rem', sm: 0, md: 0 }, mt: { xs: 1.4, md: 1 }, p: { xs: 1, md: 2 }, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteIcon sx={{ display: { xs: 'none', md: 'flex' }, }} color="primary" />
              <Typography variant="h6" fontWeight={600} sx={{
                fontSize: { xs: '0.85rem', md: '1rem' },
              }}>Progress Note</Typography>
            </Box>
            <IconButton sx={{ cursor: 'pointer' }} onClick={onClose}>
              <Close />
            </IconButton>

          </Box>
          <Box sx={{ p: { xs: 1.5, md: 2 }, overflow: 'auto', flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap', // allows wrapping on small screens
                mb: 2
              }}
            >
              {selectedTimesheet && (
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  }}
                >
                  For {selectedTimesheet.clientName} • {dayjs(selectedTimesheet.clockIn).format('MMM D, YYYY')}
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: { xs: 0, sm: 0 } }}
                onClick={() => setDrawerOpen(true)}
              >
                Add Note
              </Button>
            </Box>
              {/* For the Fetching progressnote  for the timesheet by its id */}
          <Box>
              <TimesheetProgressNote timesheet={timesheet}/>
          </Box>
          </Box>
        



        </Box>

      </Drawer>
      <AddProgressNoteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedTimesheet={selectedTimesheet}
        timesheet={timesheet}
      />
    </Box>

  );
};

export default ProgressNoteDrawer;