import React, { useEffect } from 'react';
import { Form, Select, Input, Button } from 'antd';
import { TagOutlined } from '@ant-design/icons';

const RenderEducationFields = ({
  certType,
  certIndex,
  showCustomDegree,
  setShowCustomDegree,
  customDegreeValue,
  setCustomDegreeValue,
  certForm,
  customDegreeInputRef,
  degreeSelectRef
}) => {
  if (!certType.isEducation) return null;
  const degreeOptions = certType.educationSetting?.degreeOptions || [];
  const allDegreeOptions = [...degreeOptions, 'Other'];

  // Handler for degree change
  const handleDegreeChange = (value) => {
    if (value === 'Other') {
      setShowCustomDegree(true);
      setTimeout(() => {
        if (customDegreeInputRef.current) customDegreeInputRef.current.focus();
        if (degreeSelectRef.current) {
          if (degreeSelectRef.current.blur) {
            degreeSelectRef.current.blur();
          } else if (degreeSelectRef.current.input) {
            degreeSelectRef.current.input.blur();
          }
        }
      }, 0);
    } else {
      setShowCustomDegree(false);
      setCustomDegreeValue('');
      certForm.setFieldsValue({ degree: value });
      setTimeout(() => {
        // Blur the Select after value is chosen
        if (degreeSelectRef.current) {
          if (degreeSelectRef.current.blur) {
            degreeSelectRef.current.blur();
          } else if (degreeSelectRef.current.input) {
            degreeSelectRef.current.input.blur();
          } else if (degreeSelectRef.current.resizableTextArea) {
            degreeSelectRef.current.resizableTextArea.blur();
          }
        }
      }, 100);
    }
  };

  // Handler for custom degree input
  const handleCustomDegreeInput = (e) => {
    setCustomDegreeValue(e.target.value);
  };

  // Handler for saving custom degree
  const handleSaveCustomDegree = () => {
    if (customDegreeValue.trim()) {
      certForm.setFieldsValue({ degree: `Other|${customDegreeValue.trim()}` });
      setShowCustomDegree(false);
      setCustomDegreeValue('');
      
      // Focus management - move focus back to the Select
      setTimeout(() => {
        // First blur the custom input if it exists
        if (customDegreeInputRef.current) {
          customDegreeInputRef.current.blur();
        }
        
        // Then focus the Select component
        if (degreeSelectRef.current) {
          const select = degreeSelectRef.current;
          if (select.focus) {
            select.focus();
          } else if (select.input) {
            select.input.focus();
          }
        }
      }, 0);
    }
  };

  // Handler for canceling custom degree
  const handleCancelCustomDegree = () => {
    certForm.setFieldsValue({ degree: undefined });
    setShowCustomDegree(false);
    setCustomDegreeValue('');
    
    // Focus management - move focus back to the Select
    setTimeout(() => {
      if (customDegreeInputRef.current) {
        customDegreeInputRef.current.blur();
      }
      if (degreeSelectRef.current) {
        const select = degreeSelectRef.current;
        if (select.focus) {
          select.focus();
        } else if (select.input) {
          select.input.focus();
        }
      }
    }, 0);
  };

  // Custom display for Select value
  const degreeValue = certForm.getFieldValue('degree');
  let selectDisplayValue = degreeValue;
  const isCustomDegree = typeof degreeValue === 'string' && degreeValue.startsWith('Other|');
  if (isCustomDegree) {
    selectDisplayValue = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <TagOutlined style={{ color: '#faad14' }} />
        <span>Other - {degreeValue.slice(6)}</span>
      </span>
    );
  }

  // Add this useEffect to blur the Select when degreeValue changes
  useEffect(() => {
    // Only blur if the Select is actually focused
    if (isCustomDegree) {
      setTimeout(() => {
        if (degreeSelectRef.current) {
          const selectInput = degreeSelectRef.current.input || degreeSelectRef.current;
          if (selectInput && document.activeElement === selectInput) {
            if (selectInput.blur) selectInput.blur();
          }
        }
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
      }, 100);
    }
  }, [degreeValue, isCustomDegree]);

  // Remove custom class for Select; use default AntD focus style
  // const selectCustomClass = isCustomDegree ? 'custom-degree-selected' : '';

  return (
    <>
      {/* Removed custom styles for always-on yellow border */}
      <Form.Item
        label="Degree"
        name="degree"
        rules={[{ required: true, message: 'Please select or enter your degree' }]}
        tooltip="Select your qualification from the list. If not listed, choose 'Other'."
      >
        <Select
          ref={degreeSelectRef}
          // className={selectCustomClass} // Removed
          placeholder="Select your degree"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleDegreeChange}
          value={degreeValue}
          optionLabelProp="label"
          dropdownRender={menu => menu}
          dropdownMatchSelectWidth={false}
          onBlur={() => {
            // This helps ensure the Select loses focus when clicking outside
            setTimeout(() => {
              if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                document.activeElement.blur();
              }
            }, 50);
          }}
        >
          {allDegreeOptions.map((degree) => (
            <Select.Option key={degree} value={degree} label={degree}>
              {degree}
            </Select.Option>
          ))}
          {/* Custom label for the selected custom value (not shown in dropdown, but used for display) */}
          {isCustomDegree && (
            <Select.Option
              key={degreeValue}
              value={degreeValue}
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <TagOutlined style={{ color: '#faad14' }} />
                  <span>Other - {degreeValue.slice(6)}</span>
                </span>
              }
              disabled
            >
              {/* Not shown in dropdown */}
            </Select.Option>
          )}
        </Select>
      </Form.Item>
      {showCustomDegree && (
        <div
          style={{
            background: '#f6f8fa',
            border: '1px solid #e6e6e6',
            borderRadius: 8,
            padding: 20,
            marginBottom: 16,
            marginTop: -8,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
            Enter your degree
          </div>
          <Input
            ref={customDegreeInputRef}
            placeholder="Type your degree name"
            value={customDegreeValue}
            onChange={handleCustomDegreeInput}
            maxLength={50}
            style={{ borderRadius: 6, fontSize: 15 }}
            autoFocus
            onPressEnter={handleSaveCustomDegree}
            // className={showCustomDegree ? 'custom-degree-input-focused' : ''} // Removed
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button
              type="primary"
              onClick={handleSaveCustomDegree}
              disabled={!customDegreeValue.trim()}
              style={{ borderRadius: 6 }}
            >
              Save
            </Button>
            <Button
              onClick={handleCancelCustomDegree}
              style={{ borderRadius: 6 }}
            >
              Cancel
            </Button>
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>
            Please enter your degree as it appears on your certificate.
          </div>
        </div>
      )}
    </>
  );
};

export default RenderEducationFields;
