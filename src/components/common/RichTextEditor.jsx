import React, { useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatUnderlined from '@mui/icons-material/FormatUnderlined';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import LinkIcon from '@mui/icons-material/Link';
import Title from '@mui/icons-material/Title';
import FormatQuote from '@mui/icons-material/FormatQuote';

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write here...', minHeight = 160 }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command, arg = null) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    if (typeof onChange === 'function') {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handleInput = () => {
    if (typeof onChange === 'function') {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  const setHeading = () => {
    // Toggle between paragraph and h3
    exec('formatBlock', 'H3');
  };

  const setQuote = () => {
    exec('formatBlock', 'BLOCKQUOTE');
  };

  return (
    <Box>
      <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
        <Tooltip title="Bold"><IconButton size="small" onClick={() => exec('bold')}><FormatBold fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Italic"><IconButton size="small" onClick={() => exec('italic')}><FormatItalic fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Underline"><IconButton size="small" onClick={() => exec('underline')}><FormatUnderlined fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Bulleted list"><IconButton size="small" onClick={() => exec('insertUnorderedList')}><FormatListBulleted fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Numbered list"><IconButton size="small" onClick={() => exec('insertOrderedList')}><FormatListNumbered fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Heading"><IconButton size="small" onClick={setHeading}><Title fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Quote"><IconButton size="small" onClick={setQuote}><FormatQuote fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Link"><IconButton size="small" onClick={addLink}><LinkIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Undo"><IconButton size="small" onClick={() => exec('undo')}><Undo fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Redo"><IconButton size="small" onClick={() => exec('redo')}><Redo fontSize="small" /></IconButton></Tooltip>
      </Stack>

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.25,
          minHeight,
          outline: 'none',
          '&:focus': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}33` },
          '&:empty:before': {
            content: 'attr(data-placeholder)',
            color: 'text.disabled'
          }
        }}
        data-placeholder={placeholder}
      />
    </Box>
  );
};

export default RichTextEditor;


