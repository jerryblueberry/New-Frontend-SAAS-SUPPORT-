import React, { useEffect } from 'react';
import { Form, Select, Input, Button, Card, Tag, message } from 'antd';
import { TagOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

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

  // Handler for degree change (two-field model: degreeSelect display + hidden degree value)
  const handleDegreeChange = (value) => {
    if (value === 'Other') {
      setShowCustomDegree(true);
      certForm.setFieldsValue({ degreeSelect: 'Other', degree: 'Other' });
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
      certForm.setFieldsValue({ degreeSelect: value, degree: value });
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
      // Store the full custom value in the form
      certForm.setFieldsValue({ degreeSelect: 'Other', degree: `Other|${customDegreeValue.trim()}` });
      setShowCustomDegree(false);
      setCustomDegreeValue('');
      message.success('Custom degree saved');
      
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
    // Revert select to previous non-custom value if any, otherwise clear
    const current = certForm.getFieldValue('degree');
    if (typeof current === 'string' && current.startsWith('Other|')) {
      certForm.setFieldsValue({ degreeSelect: undefined, degree: undefined });
    }
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

  // Handler for editing custom degree
  const handleEditCustomDegree = () => {
    const currentValue = certForm.getFieldValue('degree');
    console.log('✏️ Edit handler - Current value:', currentValue);
    
    // Handle both array and string formats
    let stringValue = currentValue;
    if (Array.isArray(currentValue) && currentValue.length > 0) {
      stringValue = currentValue[0];
    }
    
    if (typeof stringValue === 'string' && stringValue.startsWith('Other|')) {
      const customText = stringValue.slice(6);
      console.log('✏️ Edit handler - Setting custom value:', customText);
      setCustomDegreeValue(customText);
      setShowCustomDegree(true);
      // Ensure select shows Other while editing
      certForm.setFieldsValue({ degreeSelect: 'Other', degree: `Other|${customText}` });
      setTimeout(() => {
        if (customDegreeInputRef.current) customDegreeInputRef.current.focus();
      }, 0);
    }
  };

  // Handler for removing custom degree
  const handleRemoveCustomDegree = () => {
    console.log('🗑️ Remove handler - Clearing degree value');
    certForm.setFieldsValue({ degreeSelect: undefined, degree: undefined });
    setShowCustomDegree(false);
    setCustomDegreeValue('');
    message.success('Custom degree removed');
    setTimeout(() => {
      if (degreeSelectRef.current) {
        const select = degreeSelectRef.current;
        if (select.blur) select.blur();
        if (select.input && select.input.blur) select.input.blur();
      }
    }, 0);
  };

  // Function to parse backend data and separate "Other" from custom value
  const parseBackendDegreeValue = (value) => {
    console.log('🔍 parseBackendDegreeValue - Input value:', value);
    console.log('🔍 parseBackendDegreeValue - Type:', typeof value);
    console.log('🔍 parseBackendDegreeValue - Is Array:', Array.isArray(value));
    
    // Handle array format from backend
    let stringValue = value;
    if (Array.isArray(value) && value.length > 0) {
      stringValue = value[0];
      console.log('🔍 parseBackendDegreeValue - Extracted from array:', stringValue);
    }
    
    console.log('🔍 parseBackendDegreeValue - Final string value:', stringValue);
    console.log('🔍 parseBackendDegreeValue - Starts with Other|:', typeof stringValue === 'string' && stringValue.startsWith('Other|'));
    
    if (typeof stringValue === 'string' && stringValue.startsWith('Other|')) {
      const customText = stringValue.slice(6);
      console.log('🔍 parseBackendDegreeValue - Detected custom degree, customText:', customText);
      return {
        isCustom: true,
        selectValue: 'Other',
        customText: customText
      };
    }
    
    console.log('🔍 parseBackendDegreeValue - Regular degree value:', stringValue);
    return {
      isCustom: false,
      selectValue: stringValue,
      customText: ''
    };
  };

  // Custom display for Select value
  const degreeValue = certForm.getFieldValue('degree');
  console.log('🎓 Degree field - Raw form value:', degreeValue);
  
  const { isCustom: isCustomDegree, selectValue: selectDisplayValue, customText: customDegreeText } = parseBackendDegreeValue(degreeValue);
  
  console.log('🎓 Degree field - Parsed results:', {
    isCustomDegree,
    selectDisplayValue,
    customDegreeText
  });

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

  // Ensure the Select shows "Other" when data is loaded from backend
  useEffect(() => {
    if (isCustomDegree && degreeValue) {
      // When a custom degree is loaded from backend, ensure the Select shows "Other"
      // and the custom value is displayed in the card below
      setTimeout(() => {
        if (degreeSelectRef.current) {
          // Force the Select to display "Other" instead of the full custom value
          degreeSelectRef.current.blur();
        }
      }, 50);
    }
  }, [degreeValue, isCustomDegree]);

  // Additional useEffect to handle form initialization with backend data
  useEffect(() => {
    const currentValue = certForm.getFieldValue('degree');
    if (typeof currentValue === 'string' && currentValue.startsWith('Other|')) {
      // When form is initialized with backend data containing custom degree,
      // ensure the Select shows "Other" and custom value is displayed
      setTimeout(() => {
        if (degreeSelectRef.current) {
          degreeSelectRef.current.blur();
        }
      }, 100);
    }
  }, []); // Run only once on component mount

  return (
    <>
      {/* Degree Selection */}
      <Form.Item
        name="degreeSelect"
        label="Degree"
        rules={[{ required: true, message: 'Please select or enter your degree' }]}
        tooltip="Select your qualification from the list. If not listed, choose 'Other'."
      >
        <Select
          ref={degreeSelectRef}
          placeholder="Select your degree"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleDegreeChange}
          optionLabelProp="label"
          dropdownRender={menu => menu}
          dropdownMatchSelectWidth={false}
          allowClear
          onClear={() => {
            setShowCustomDegree(false);
            setCustomDegreeValue('');
            certForm.setFieldsValue({ degreeSelect: undefined, degree: undefined });
          }}
          onBlur={() => {
            // This helps ensure the Select loses focus when clicking outside
            setTimeout(() => {
              if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                document.activeElement.blur();
              }
            }, 50);
          }}
        >
          {console.log('🎓 Select component - Current value:', selectDisplayValue)}
          {allDegreeOptions.map((degree) => (
            <Select.Option key={degree} value={degree} label={degree}>
              {degree}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      
      {/* Hidden field to store the actual degree value */}
      <Form.Item name="degree" hidden>
        <Input />
      </Form.Item>
      {/* Visible select model value to keep UI in sync */}
      <Form.Item name="degreeSelect" hidden>
        <Input />
      </Form.Item>

      {/* Custom Degree Input Section */}
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

      {/* Custom Degree Display Section */}
      
      {isCustomDegree && !showCustomDegree && (
        <>
        <p>Custom Degree:</p>
        <Card
          size="small"
          style={{
            marginBottom: 16,
            marginTop: 4,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            background: '#fafafa'
          }}
          bodyStyle={{ padding: '12px 16px' }}
        >

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              <span style={{ fontWeight: 500, fontSize: 14 }}>
                {customDegreeText}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleEditCustomDegree}
                style={{ padding: '4px 8px' }}
              >
                Edit
              </Button>
              <Button
                type="text"
                size="small"
                danger
                onClick={handleRemoveCustomDegree}
                style={{ padding: '4px 8px' }}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
        </>
      )}
    </>
  );
};

export default RenderEducationFields;
