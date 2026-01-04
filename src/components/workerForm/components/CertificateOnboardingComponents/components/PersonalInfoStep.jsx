import React, { useMemo } from 'react';
import { Card, Form, Select, Typography, Space, Alert } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { RESIDENCY_STATUSES } from '../constants';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Personal Information Step Component
 * First step of the certification onboarding process
 */
const PersonalInfoStep = ({
  residencyStatus,
  formErrors,
  onResidencyStatusChange
}) => {
  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Personal Information</Title>}
      style={{
        maxWidth: 800,
        margin: '0 auto',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        justifyContent: 'center',
        alignItems: 'center'
      }}
      headStyle={{ borderBottom: 'none', padding: '24px 24px 0' }}
      bodyStyle={{ padding: '16px 24px 24px' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Please provide your personal details so we can determine which certifications are required for you.
      </Text>

      <Form layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          label={
            <Space>
              <IdcardOutlined />
              <span>Residency Status</span>
            </Space>
          }
          required
          validateStatus={formErrors.residencyStatus ? 'error' : ''}
          help={formErrors.residencyStatus}
        >
          <Select
            value={residencyStatus}
            onChange={onResidencyStatusChange}
            placeholder="Select your status"
            optionLabelProp="label"
            style={{ width: '100%' }}
          >
            {RESIDENCY_STATUSES.map(option => {
              const IconComponent = option.icon;
              return (
                <Option
                  key={option.value}
                  value={option.value}
                  label={
                    <Space>
                      <IconComponent />
                      <span>{option.label}</span>
                    </Space>
                  }
                >
                  <Space>
                    <IconComponent />
                    <span>{option.label}</span>
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>

      {residencyStatus && (
        <Alert
          message="Profile Information Saved"
          description="Your residency information has been saved. Click Next to continue to certification selection."
          type="success"
          showIcon
          style={{ marginTop: 24, maxWidth: 600 }}
        />
      )}
    </Card>
  );
};

export default PersonalInfoStep;

