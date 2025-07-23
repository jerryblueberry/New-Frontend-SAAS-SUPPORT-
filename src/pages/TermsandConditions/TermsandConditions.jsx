import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  Shield as ShieldIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';

const TermsandConditions = () => {
  const [expandedPanels, setExpandedPanels] = useState(new Set(['panel1']));
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    const newExpandedPanels = new Set(expandedPanels);
    if (isExpanded) {
      newExpandedPanels.add(panel);
    } else {
      newExpandedPanels.delete(panel);
    }
    setExpandedPanels(newExpandedPanels);
  };

  const sections = [
    {
      id: 'panel1',
      title: 'Data Collection & Usage',
      icon: <SecurityIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            By registering as an NDIS Support Worker on our platform, you consent to the collection, storage, and processing of the following information:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Personal identification documents and certifications" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Professional qualifications, training certificates, and skill assessments" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Contact information including phone, email, and address" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Banking details for payment processing" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Work availability, preferences, and service specializations" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This information is used exclusively for onboarding verification, job matching, client connections, and payment processing.
          </Typography>
        </Box>
      )
    },
    {
      id: 'panel2',
      title: 'Onboarding Requirements',
      icon: <DocumentIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            All NDIS Support Workers must complete the following onboarding requirements:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Valid Working with Children Check (WWCC) or equivalent" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="National Disability Insurance Scheme Worker Screening Check" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Current First Aid and CPR certifications" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Relevant qualifications in disability support or healthcare" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Police clearance certificate (current within 12 months)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Professional references from previous employers" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Failure to maintain current certifications may result in suspension of services until compliance is restored.
          </Typography>
        </Box>
      )
    },
    {
      id: 'panel3',
      title: 'Job Matching & Client Connections',
      icon: <WorkIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Our platform facilitates connections between NDIS Support Workers and clients based on:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Geographic location and travel preferences" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Skill sets, certifications, and experience levels" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Availability schedules and shift preferences" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Client-specific needs and support requirements" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <strong>Worker Responsibilities:</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            • Maintain accurate and up-to-date profile information<br />
            • Respond to job opportunities within 24 hours<br />
            • Provide high-quality, person-centered support services<br />
            • Adhere to NDIS Code of Conduct and professional standards<br />
            • Report any incidents or concerns promptly
          </Typography>
        </Box>
      )
    },
    {
      id: 'panel4',
      title: 'Privacy & Data Protection',
      icon: <ShieldIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            We are committed to protecting your personal information in accordance with the Privacy Act 1988 (Cth) and NDIS Privacy Policy.
          </Typography>
          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Data Security Measures</Typography>
              <Typography variant="body2">
                • 256-bit SSL encryption for all data transmission<br />
                • Regular security audits and vulnerability assessments<br />
                • Access controls with role-based permissions<br />
                • Secure cloud storage with automated backups<br />
                • Compliance with Australian Privacy Principles (APPs)
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body1" paragraph>
            <strong>Your Rights:</strong>
          </Typography>
          <Typography variant="body2">
            You have the right to access, correct, or delete your personal information. You may also request data portability or withdraw consent for non-essential processing activities.
          </Typography>
        </Box>
      )
    },
    {
      id: 'panel5',
      title: 'Platform Usage & Conduct',
      icon: <GroupIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            By using our platform, you agree to:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Provide accurate and truthful information at all times" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Maintain professional conduct in all interactions" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Respect client confidentiality and privacy" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Comply with all relevant legislation and regulations" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Report any concerns or incidents promptly" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <strong>Prohibited Activities:</strong>
          </Typography>
          <Typography variant="body2" color="error">
            • Sharing login credentials or accessing unauthorized accounts<br />
            • Misrepresenting qualifications or experience<br />
            • Engaging in discriminatory or unprofessional behavior<br />
            • Using the platform for purposes other than NDIS support work<br />
            • Violating client privacy or confidentiality agreements
          </Typography>
        </Box>
      )
    },
    {
      id: 'panel6',
      title: 'Contact & Support',
      icon: <EmailIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            For questions about these terms or our services, please contact us:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2">Email Support</Typography>
                  <Typography variant="body2" color="text.secondary">
                    support@ndisplatform.com.au
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2">Phone Support</Typography>
                  <Typography variant="body2" color="text.secondary">
                    1800 NDIS HELP (1800 634 743)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimeIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2">Support Hours</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monday - Friday: 8:00 AM - 6:00 PM AEST<br />
                    Saturday: 9:00 AM - 2:00 PM AEST
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <>
<WorkerNavbar/>
<Container maxWidth="lg" sx={{ py: 4, mt: 10 }}>
      <Fade in={isVisible} timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3,
            mb: 4
          }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Zoom in={isVisible} timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Box>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Terms & Conditions
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ mb: 2, fontWeight: 400 }}
                >
                  NDIS Support Worker Platform
                </Typography>
                <Chip 
                  label="Effective Date: July 2025" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Zoom>
          </Box>
        </Paper>
      </Fade>

      <Fade in={isVisible} timeout={800} style={{ transitionDelay: '400ms' }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
              Welcome to our NDIS Support Worker platform. These Terms and Conditions govern your use of our services, 
              including data collection for onboarding, job matching, and client connections. Please review all sections carefully.
            </Typography>
            
            {sections.map((section, index) => (
              <Fade 
                in={isVisible} 
                timeout={600} 
                style={{ transitionDelay: `${600 + index * 100}ms` }}
                key={section.id}
              >
                <Accordion
                  expanded={expandedPanels.has(section.id)}
                  onChange={handleAccordionChange(section.id)}
                  sx={{
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '12px !important',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 72,
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2,
                      },
                      '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
                        transform: 'rotate(180deg)',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {React.cloneElement(section.icon, { 
                        color: expandedPanels.has(section.id) ? 'primary' : 'action' 
                      })}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: expandedPanels.has(section.id) ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {section.title}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    {section.content}
                  </AccordionDetails>
                </Accordion>
              </Fade>
            ))}
          </Box>
        </Paper>
      </Fade>

      <Fade in={isVisible} timeout={800} style={{ transitionDelay: '1200ms' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mt: 4, 
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            By proceeding with registration, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
            These terms may be updated periodically, and continued use of the platform constitutes acceptance of any modifications.
          </Typography>
          <Typography 
            variant="caption" 
            display="block" 
            align="center" 
            sx={{ mt: 2, fontStyle: 'italic' }}
          >
            Last updated: July 22, 2025 • Version 1.2
          </Typography>
        </Paper>
      </Fade>
    </Container>
    </>

  );
};

export default TermsandConditions;