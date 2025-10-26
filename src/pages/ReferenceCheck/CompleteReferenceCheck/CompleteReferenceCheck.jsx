import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import {
  Box, Button, CircularProgress, Stepper, Step, StepLabel, Typography, Paper, TextField, RadioGroup, FormControlLabel, Radio, LinearProgress, Avatar, Alert, Rating
} from '@mui/material';
import Confetti from 'react-confetti';

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const CompleteReferenceCheck = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);

  // Fetch reference and questionnaire info
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/references/respond/${token}`);
        setReference(data.reference);
        setQuestionnaire(data.reference.questionnaire);
        setResponses(
          data.reference.questionnaire.questions.map(q => ({
            questionId: q._id,
            answer: ''
          }))
        );
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Invalid or expired link.';
        const isExpired = err.response?.data?.expired;
        const isCompleted = err.response?.data?.completed;
        
        if (isExpired) {
          setError('⏰ This reference link has expired. Please contact the administrator for a new link.');
        } else if (isCompleted) {
          setError('✅ This reference check has already been completed. Thank you for your response!');
        } else {
          setError(errorMessage);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setResponses(responses =>
      responses.map(r =>
        r.questionId === questionId ? { ...r, answer: value } : r
      )
    );
  };

  // Handle next/prev
  const handleNext = () => setActiveStep(s => s + 1);
  const handleBack = () => setActiveStep(s => s - 1);

  // Handle submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/references/respond/${token}`, { responses });
      setCompleted(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Submission failed.';
      console.error('Submission error:', err);
      setError(errorMessage);
    }
    setSubmitting(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Box mt={8}><Alert severity="error">{error}</Alert></Box>;
  if (completed) return (
    <Box mt={8} textAlign="center">
      <Confetti />
      <Avatar
        sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 40 }}
      >
        {getInitials(
          [reference?.worker?.firstName, reference?.worker?.lastName].filter(Boolean).join(' ')
        )}
      </Avatar>
      <Typography variant="h4" gutterBottom>Thank you!</Typography>
      <Typography>Your reference check is complete. 🎉</Typography>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        We appreciate your feedback for{' '}
        <strong>
          {[reference?.worker?.firstName, reference?.worker?.lastName].filter(Boolean).join(' ')}
        </strong>
        .
      </Typography>
    </Box>
  );

  const questions = questionnaire?.questions || [];
  const currentQuestion = questions[activeStep];

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getInitials(reference?.referenceInfo?.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Hi {reference?.referenceInfo?.name || 'Reference'},
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are providing feedback for{' '}
              <strong>
                {[reference?.worker?.firstName, reference?.worker?.lastName].filter(Boolean).join(' ')}
              </strong>
              .
            </Typography>
          </Box>
        </Box>
        <Stepper activeStep={activeStep} alternativeLabel>
          {questions.map((q, idx) => (
            <Step key={q._id}>
              <StepLabel>{`Q${idx + 1}`}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={3}>
          <Typography variant="h6">
            {currentQuestion.text}
            {currentQuestion.required && (
              <Typography component="span" color="error" fontWeight="bold"> *</Typography>
            )}
          </Typography>
          {currentQuestion.helpText && (
            <Typography variant="caption" color="text.secondary">{currentQuestion.helpText}</Typography>
          )}
          {/* Render input based on question type */}
          {currentQuestion.type === 'text' && (
            <TextField
              fullWidth
              required={currentQuestion.required}
              placeholder={currentQuestion.placeholder}
              value={responses[activeStep]?.answer || ''}
              onChange={e => handleAnswerChange(currentQuestion._id, e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {currentQuestion.type === 'textarea' && (
            <TextField
              fullWidth
              required={currentQuestion.required}
              multiline
              minRows={3}
              placeholder={currentQuestion.placeholder}
              value={responses[activeStep]?.answer || ''}
              onChange={e => handleAnswerChange(currentQuestion._id, e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {currentQuestion.type === 'yesno' && (
            <RadioGroup
              value={responses[activeStep]?.answer || ''}
              onChange={e => handleAnswerChange(currentQuestion._id, e.target.value)}
              sx={{ mt: 2 }}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          )}
          {currentQuestion.type === 'single_choice' && (
            <RadioGroup
              value={responses[activeStep]?.answer || ''}
              onChange={e => handleAnswerChange(currentQuestion._id, e.target.value)}
              sx={{ mt: 2 }}
            >
              {currentQuestion.options.map(opt => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          )}
          {currentQuestion.type === 'rating' && (
            <Box sx={{ mt: 2 }}>
              <Rating
                name={`rating-${currentQuestion._id}`}
                value={Number(responses[activeStep]?.answer) || 0}
                onChange={(_, value) => handleAnswerChange(currentQuestion._id, value)}
                max={currentQuestion.ratingConfig?.max || 5}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.secondary">
                  {currentQuestion.ratingConfig?.labels?.min || 'Poor'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentQuestion.ratingConfig?.labels?.max || 'Excellent'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          {activeStep < questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!responses[activeStep]?.answer}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting || !responses[activeStep]?.answer}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          )}
        </Box>
        <Box mt={2}>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / questions.length) * 100}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CompleteReferenceCheck;
