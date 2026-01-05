import React from 'react';
import { Form, Select, Typography, Space, Alert, Grid } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { RESIDENCY_STATUSES } from '../constants';
import './PersonalInfoStep.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

/**
 * Ant Design color mapping for residency status icons
 * SaaS-Level: Consistent color system
 */
const COLOR_MAP = {
  green: '#52c41a',
  teal: '#13c2c2',
  blue: '#1890ff',
  purple: '#722ed1',
  geekblue: '#2f54eb',
  orange: '#fa8c16',
  gold: '#faad14',
  cyan: '#13c2c2'
};

/**
 * Personal Information Step Component
 * SaaS-Level: First step of the certification onboarding process
 * 
 * Features:
 * - Outcome-oriented microcopy
 * - Intelligent feedback messaging
 * - Responsive design
 * - Clear value proposition
 */
const PersonalInfoStep = ({
  residencyStatus,
  formErrors,
  onResidencyStatusChange
}) => {
  // SaaS-Level: Responsive design for mobile and tablet
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  // Responsive title font sizes
  const titleFontSize = isMobile ? 22 : isTablet ? 26 : 28;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        width: '100%',
        padding: isMobile ? '24px 16px' : isTablet ? '32px 24px' : '40px 32px'
      }}
    >
      {/* SaaS-Level: Clean, modern title with responsive sizing */}
      <Title 
        level={1}
        style={{ 
          margin: 0,
          marginBottom: isMobile ? 12 : 16,
          fontSize: titleFontSize,
          fontWeight: 600,
          textAlign: 'center',
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}
      >
        Personal Information
      </Title>

      {/* SaaS-Level: Improved intro copy - explains why and sets expectations */}
      <Text 
        type="secondary" 
        style={{ 
          display: 'block', 
          marginBottom: 6,
          textAlign: 'center',
          fontSize: isMobile ? 14 : 15,
          lineHeight: 1.6,
          color: '#595959',
          fontWeight: 400
        }}
      >
        We use your residency status to automatically identify the certifications and documents required for you.
      </Text>
      <Text 
        type="secondary" 
        style={{ 
          display: 'block', 
          marginBottom: isMobile ? 32 : 40,
          textAlign: 'center',
          fontSize: isMobile ? 13 : 14,
          lineHeight: 1.5,
          color: '#8c8c8c',
          fontWeight: 400
        }}
      >
        This helps us tailor the process and avoid asking for unnecessary information later.
      </Text>

      <Form layout="vertical" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Form.Item
          label={
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Space size={8}>
                <IdcardOutlined style={{ 
                  color: '#1890ff', 
                  fontSize: isMobile ? 16 : 17,
                  marginTop: 2
                }} />
                <span style={{ 
                  fontWeight: 500, 
                  fontSize: isMobile ? 15 : 16,
                  color: '#262626'
                }}>
                  Residency Status
                </span>
              </Space>
              {/* SaaS-Level: Helper text that reduces hesitation */}
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: isMobile ? 12 : 13, 
                  display: 'block', 
                  marginLeft: isMobile ? 24 : 26,
                  lineHeight: 1.5,
                  color: '#8c8c8c',
                  fontWeight: 400
                }}
              >
                This determines which certifications and identity checks apply to you.
              </Text>
            </Space>
          }
          required
          validateStatus={formErrors.residencyStatus ? 'error' : ''}
          help={formErrors.residencyStatus}
          style={{ marginBottom: 0 }}
        >
          <Select
            value={residencyStatus}
            onChange={onResidencyStatusChange}
            placeholder="Select your residency status"
            optionLabelProp="label"
            className="premium-residency-select"
            style={{ 
              width: '100%',
              height: isMobile ? 44 : isTablet ? 48 : 52,
              borderRadius: 10,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 400
            }}
            size={isMobile ? 'middle' : 'large'}
            showSearch
            allowClear
            filterOption={(input, option) => {
              const label = option?.label?.props?.children?.[1] || option?.label || '';
              const searchText = typeof label === 'string' ? label : label.toString();
              return searchText.toLowerCase().includes(input.toLowerCase());
            }}
            dropdownStyle={{
              borderRadius: 12,
              padding: isMobile ? '8px' : '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              marginTop: 4
            }}
            dropdownRender={(menu) => (
              <div style={{ maxHeight: isMobile ? 320 : 400, overflowY: 'auto' }}>
                {menu}
              </div>
            )}
          >
            {RESIDENCY_STATUSES.map(option => {
              const IconComponent = option.icon;
              return (
                <Option
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  className="premium-select-option"
                  style={{
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: 8,
                    marginBottom: 4,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  <Space 
                    align="start" 
                    size={isMobile ? 10 : 12}
                    style={{ 
                      width: '100%'
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? 20 : 22,
                        height: isMobile ? 20 : 22,
                        borderRadius: 6,
                        backgroundColor: option.color ? `${COLOR_MAP[option.color]}15` : '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1
                      }}
                    >
                      <IconComponent 
                        style={{ 
                          fontSize: isMobile ? 13 : 14,
                          color: option.color ? COLOR_MAP[option.color] : '#595959'
                        }} 
                      />
                    </div>
                    <Space direction="vertical" size={1} style={{ flex: 1, minWidth: 0 }}>
                      <Text 
                        strong 
                        style={{ 
                          fontSize: isMobile ? 14 : 15,
                          display: 'block',
                          color: '#1a1a1a',
                          fontWeight: 500,
                          lineHeight: 1.4
                        }}
                      >
                        {option.label}
                      </Text>
                      {option.description && (
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: isMobile ? 11 : 12, 
                            lineHeight: 1.4,
                            display: 'block',
                            color: '#8c8c8c',
                            fontWeight: 400,
                            marginTop: 2
                          }}
                        >
                          {option.description}
                        </Text>
                      )}
                    </Space>
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>

      {/* SaaS-Level: Intelligent feedback - sets expectations, not false "saved" semantics */}
      {residencyStatus && (
        <Alert
          message="Certification requirements identified"
          description="Based on your residency status, we'll guide you through the required certifications in the next step."
          type="info"
          showIcon
          style={{ 
            marginTop: isMobile ? 24 : 32, 
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#e6f7ff',
            fontSize: isMobile ? 13 : 14
          }}
        />
      )}

      {/* SaaS-Level: Footer note that reduces anxiety and drop-off */}
      <Text 
        type="secondary" 
        style={{ 
          display: 'block', 
          textAlign: 'center',
          fontSize: isMobile ? 12 : 13,
          marginTop: isMobile ? 24 : 32,
          color: '#8c8c8c',
          lineHeight: 1.5,
          fontWeight: 400
        }}
      >
        You can update this later if your situation changes.
      </Text>
    </div>
  );
};

export default PersonalInfoStep;

