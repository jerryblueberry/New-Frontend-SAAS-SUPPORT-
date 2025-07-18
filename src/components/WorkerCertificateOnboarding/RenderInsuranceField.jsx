import React, { useEffect } from 'react';
import { Form, Select, Input, Button } from 'antd';
import { TagOutlined } from '@ant-design/icons';

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

  // Custom display for Select value
  const insuranceValue = certForm.getFieldValue('insuranceType');
  let selectDisplayValue = insuranceValue;
  const isCustomInsurance = typeof insuranceValue === 'string' && insuranceValue.startsWith('Other|');
  if (isCustomInsurance) {
    selectDisplayValue = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <TagOutlined style={{ color: '#faad14' }} />
        <span>Other - {insuranceValue.slice(6)}</span>
      </span>
    );
  }

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

  return (
    <>
      <Form.Item
        name="insuranceType"
        label="Insurance Type"
        rules={[{ required: true, message: 'Please select or enter your insurance type' }]}
        tooltip="Select your insurance type. If not listed, choose 'Other' to add your own."
      >
        <Select
          ref={insuranceSelectRef}
          placeholder="Select or enter insurance type"
          allowClear
          value={insuranceValue}
          optionLabelProp="label"
          onChange={handleInsuranceTypeChange}
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
          {/* Custom label for the selected custom value (not shown in dropdown, but used for display) */}
          {isCustomInsurance && (
            <Select.Option
              key={insuranceValue}
              value={insuranceValue}
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <TagOutlined style={{ color: '#faad14' }} />
                  <span>Other - {insuranceValue.slice(6)}</span>
                </span>
              }
              disabled
            >
              {/* Not shown in dropdown */}
            </Select.Option>
          )}
        </Select>
      </Form.Item>
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
    </>
  );
};

export default RenderInsuranceField;
