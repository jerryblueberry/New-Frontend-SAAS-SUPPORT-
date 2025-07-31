import React, { useEffect } from 'react';
import { Form, Select, Input, Button, Card, Tag } from 'antd';
import { TagOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

const PREDEFINED_INSURANCE_TYPES = [
  'Comprehensive',
  'Third Party Property',
  'CTP (Compulsory Third Party)',
];

const RenderInsuranceField = ({
  showCustomInsurance,
  setShowCustomInsurance,
  customInsuranceValue,
  setCustomInsuranceValue,
  certForm,
  customInsuranceInputRef,
  insuranceSelectRef // <-- Add this prop for ref
}) => {
  // Handler for insurance type change
  const handleInsuranceTypeChange = (value) => {
    if (value === 'Other') {
      setShowCustomInsurance(true);
      // Set the form value to "Other" when user selects Other
      certForm.setFieldsValue({ insuranceType: 'Other' });
      setTimeout(() => {
        if (customInsuranceInputRef.current) customInsuranceInputRef.current.focus();
        if (insuranceSelectRef && insuranceSelectRef.current) {
          if (insuranceSelectRef.current.blur) {
            insuranceSelectRef.current.blur();
          } else if (insuranceSelectRef.current.input) {
            insuranceSelectRef.current.input.blur();
          }
        }
      }, 0);
    } else {
      setShowCustomInsurance(false);
      setCustomInsuranceValue('');
      certForm.setFieldsValue({ insuranceType: value });
      setTimeout(() => {
        if (insuranceSelectRef && insuranceSelectRef.current) {
          if (insuranceSelectRef.current.blur) {
            insuranceSelectRef.current.blur();
          } else if (insuranceSelectRef.current.input) {
            insuranceSelectRef.current.input.blur();
          }
        }
      }, 100);
    }
  };

  // Handler for custom insurance input
  const handleCustomInsuranceInput = (e) => {
    setCustomInsuranceValue(e.target.value);
  };

  // Handler for saving custom insurance
  const handleSaveCustomInsurance = () => {
    if (customInsuranceValue.trim()) {
      certForm.setFieldsValue({ insuranceType: `Other|${customInsuranceValue.trim()}` });
      setShowCustomInsurance(false);
      setCustomInsuranceValue('');
      setTimeout(() => {
        if (customInsuranceInputRef.current) {
          customInsuranceInputRef.current.blur();
        }
        if (insuranceSelectRef && insuranceSelectRef.current) {
          const select = insuranceSelectRef.current;
          if (select.focus) {
            select.focus();
          } else if (select.input) {
            select.input.focus();
          }
        }
      }, 0);
    }
  };

  // Handler for canceling custom insurance
  const handleCancelCustomInsurance = () => {
    certForm.setFieldsValue({ insuranceType: undefined });
    setShowCustomInsurance(false);
    setCustomInsuranceValue('');
    setTimeout(() => {
      if (customInsuranceInputRef.current) {
        customInsuranceInputRef.current.blur();
      }
      if (insuranceSelectRef && insuranceSelectRef.current) {
        const select = insuranceSelectRef.current;
        if (select.focus) {
          select.focus();
        } else if (select.input) {
          select.input.focus();
        }
      }
    }, 0);
  };

  // Handler for editing custom insurance
  const handleEditCustomInsurance = () => {
    const currentValue = certForm.getFieldValue('insuranceType');
    console.log('✏️ Edit insurance handler - Current value:', currentValue);
    
    // Handle both array and string formats
    let stringValue = currentValue;
    if (Array.isArray(currentValue) && currentValue.length > 0) {
      stringValue = currentValue[0];
    }
    
    if (typeof stringValue === 'string' && stringValue.startsWith('Other|')) {
      const customText = stringValue.slice(6);
      console.log('✏️ Edit insurance handler - Setting custom value:', customText);
      setCustomInsuranceValue(customText);
      setShowCustomInsurance(true);
      setTimeout(() => {
        if (customInsuranceInputRef.current) customInsuranceInputRef.current.focus();
      }, 0);
    }
  };

  // Handler for removing custom insurance
  const handleRemoveCustomInsurance = () => {
    console.log('🗑️ Remove insurance handler - Clearing insurance value');
    certForm.setFieldsValue({ insuranceType: undefined });
  };

  // Function to parse backend data and separate "Other" from custom value
  const parseBackendInsuranceValue = (value) => {
    console.log('🔍 parseBackendInsuranceValue - Input value:', value);
    console.log('🔍 parseBackendInsuranceValue - Type:', typeof value);
    console.log('🔍 parseBackendInsuranceValue - Is Array:', Array.isArray(value));
    
    // Handle array format from backend
    let stringValue = value;
    if (Array.isArray(value) && value.length > 0) {
      stringValue = value[0];
      console.log('🔍 parseBackendInsuranceValue - Extracted from array:', stringValue);
    }
    
    console.log('🔍 parseBackendInsuranceValue - Final string value:', stringValue);
    console.log('🔍 parseBackendInsuranceValue - Starts with Other|:', stringValue?.startsWith('Other|'));
    
    if (typeof stringValue === 'string' && stringValue.startsWith('Other|')) {
      const customText = stringValue.slice(6);
      console.log('🔍 parseBackendInsuranceValue - Detected custom insurance, customText:', customText);
      return {
        isCustom: true,
        selectValue: 'Other',
        customText: customText
      };
    }
    
    console.log('🔍 parseBackendInsuranceValue - Regular insurance value:', stringValue);
    return {
      isCustom: false,
      selectValue: stringValue,
      customText: ''
    };
  };

  // Custom display for Select value
  const insuranceValue = certForm.getFieldValue('insuranceType');
  console.log('🛡️ Insurance field - Raw form value:', insuranceValue);
  
  const { isCustom: isCustomInsurance, selectValue: selectDisplayValue, customText: customInsuranceText } = parseBackendInsuranceValue(insuranceValue);
  
  console.log('🛡️ Insurance field - Parsed results:', {
    isCustomInsurance,
    selectDisplayValue,
    customInsuranceText
  });

  // Blur Select/Input on value change for better UX
  useEffect(() => {
    if (isCustomInsurance) {
      setTimeout(() => {
        if (insuranceSelectRef && insuranceSelectRef.current) {
          const selectInput = insuranceSelectRef.current.input || insuranceSelectRef.current;
          if (selectInput && document.activeElement === selectInput) {
            if (selectInput.blur) selectInput.blur();
          }
        }
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
      }, 100);
    }
  }, [insuranceValue, isCustomInsurance, insuranceSelectRef]);

  // Ensure the Select shows "Other" when data is loaded from backend
  useEffect(() => {
    if (isCustomInsurance && insuranceValue) {
      // When a custom insurance is loaded from backend, ensure the Select shows "Other"
      // and the custom value is displayed in the card below
      setTimeout(() => {
        if (insuranceSelectRef && insuranceSelectRef.current) {
          // Force the Select to display "Other" instead of the full custom value
          insuranceSelectRef.current.blur();
        }
      }, 50);
    }
  }, [insuranceValue, isCustomInsurance, insuranceSelectRef]);

  // Additional useEffect to handle form initialization with backend data
  useEffect(() => {
    const currentValue = certForm.getFieldValue('insuranceType');
    if (typeof currentValue === 'string' && currentValue.startsWith('Other|')) {
      // When form is initialized with backend data containing custom insurance,
      // ensure the Select shows "Other" and custom value is displayed
      setTimeout(() => {
        if (insuranceSelectRef && insuranceSelectRef.current) {
          insuranceSelectRef.current.blur();
        }
      }, 100);
    }
  }, []); // Run only once on component mount

  return (
    <>
      {/* Insurance Type Selection */}
      <Form.Item
        label="Insurance Type"
        rules={[{ required: true, message: 'Please select or enter your insurance type' }]}
        tooltip="Select your insurance type. If not listed, choose 'Other' to add your own."
      >
        <Select
          ref={insuranceSelectRef}
          placeholder="Select or enter insurance type"
          allowClear
          optionLabelProp="label"
          onChange={handleInsuranceTypeChange}
          value={selectDisplayValue}
          style={{ transition: 'all 0.3s ease' }}
          dropdownRender={menu => menu}
          dropdownMatchSelectWidth={false}
          onBlur={() => {
            setTimeout(() => {
              if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                document.activeElement.blur();
              }
            }, 50);
          }}
        >
          {PREDEFINED_INSURANCE_TYPES.map((type) => (
            <Select.Option key={type} value={type} label={type}>
              {type}
            </Select.Option>
          ))}
          <Select.Option key="Other" value="Other" label="Other">
            Other
          </Select.Option>
        </Select>
      </Form.Item>
      
      {/* Hidden field to store the actual insurance value */}
      <Form.Item name="insuranceType" hidden>
        <Input />
      </Form.Item>

      {/* Custom Insurance Input Section */}
      {showCustomInsurance && (
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
            Enter your insurance type
          </div>
          <Input
            ref={customInsuranceInputRef}
            placeholder="Type your insurance type"
            value={customInsuranceValue}
            onChange={handleCustomInsuranceInput}
            maxLength={50}
            style={{ borderRadius: 6, fontSize: 15 }}
            autoFocus
            onPressEnter={handleSaveCustomInsurance}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button
              type="primary"
              onClick={handleSaveCustomInsurance}
              disabled={!customInsuranceValue.trim()}
              style={{ borderRadius: 6 }}
            >
              Save
            </Button>
            <Button
              onClick={handleCancelCustomInsurance}
              style={{ borderRadius: 6 }}
            >
              Cancel
            </Button>
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>
            Please enter your insurance type as it appears on your document.
          </div>
        </div>
      )}

      {/* Custom Insurance Display Section */}
      {isCustomInsurance && !showCustomInsurance && (
        <>
        <p>Custom Insurance:</p>
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
                {customInsuranceText}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleEditCustomInsurance}
                style={{ padding: '4px 8px' }}
              >
                Edit
              </Button>
              <Button
                type="text"
                size="small"
                danger
                onClick={handleRemoveCustomInsurance}
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

export default RenderInsuranceField;
