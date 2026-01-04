import React from 'react';
import { List, Avatar, Space, Typography, Tag } from 'antd';
import {
  CheckCircleOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { CATEGORY_ICONS } from '../constants';
import { formatFieldLabel } from '../utils/certificationHelpers';

const { Text } = Typography;

/**
 * Individual certification list item for "Your Certifications" section
 */
const YourCertificationListItem = ({
  cert,
  certType,
  isComplete,
  onEdit
}) => {
  const missingFields = certType?.requiredFields
    .filter(field => !cert[field])
    .map(field => formatFieldLabel(field));

  const isMissingDocuments = certType?.documentRequired && 
    (!cert.documents || cert.documents.length === 0);

  return (
    <List.Item
      onClick={onEdit}
      style={{ 
        padding: '12px 24px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        flexWrap: 'wrap' 
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={(() => {
              if (certType?.isVisa) return <GlobalOutlined />;
              const IconComponent = certType?.category ? CATEGORY_ICONS[certType.category] : null;
              return IconComponent ? <IconComponent /> : <SafetyCertificateOutlined />;
            })()}
            style={{
              backgroundColor: isComplete ? '#52c41a' : '#faad14',
              color: '#fff'
            }}
          />
        }
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            gap: 8 
          }}>
            <span 
              style={{ 
                fontWeight: 600, 
                fontSize: 16, 
                color: '#222' 
              }} 
              className="text_your_cert"
            >
              {cert.certTypeName}
            </span>
            {isComplete && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                marginLeft: 'auto', 
                color: '#52c41a', 
                fontWeight: 500, 
                fontSize: 15 
              }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <span className="completed-label">Completed</span>
              </span>
            )}
          </div>
        }
        description={
          !isComplete && (missingFields.length > 0 || isMissingDocuments) && (
            <div style={{ marginTop: 4 }}>
              <Text type="danger">
                <WarningOutlined /> Missing:&nbsp;
                {missingFields.map(field => (
                  <Tag color="red" key={field}>
                    {field}
                  </Tag>
                ))}
                {isMissingDocuments && (
                  <Tag color="red">Documents</Tag>
                )}
              </Text>
            </div>
          )
        }
      />
    </List.Item>
  );
};

export default YourCertificationListItem;

