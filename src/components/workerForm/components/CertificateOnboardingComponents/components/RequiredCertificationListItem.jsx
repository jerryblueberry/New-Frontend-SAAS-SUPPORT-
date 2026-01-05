import React from 'react';
import { List, Button, Avatar, Space, Typography, Tag } from 'antd';
import {
  CheckCircleOutlined,
  PlusOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { CATEGORY_ICONS, getCategoryIcon } from '../constants';
import { 
  isWorkingWithChildrenCheck, 
  formatFieldLabel, 
  getUserCertData,
  getMissingFields 
} from '../utils/certificationHelpers';

const { Text } = Typography;

/**
 * Individual certification list item for required certifications tab
 */
const RequiredCertificationListItem = ({
  cert,
  selectedCerts,
  certIsComplete,
  certInList,
  onAddCertification,
  onEditCertification,
  // Form state for live validation
  certDetailsVisible,
  isEditing,
  currentCertIndex,
  pendingCertTypeId,
  certForm,
  certifications
}) => {
  const handleClick = () => {
    const idx = selectedCerts.findIndex(c => c.certificationType === cert._id);
    if (idx >= 0) {
      onEditCertification(idx);
    } else {
      onAddCertification(cert._id);
    }
  };

  const handleAddClick = () => {
    if (!certInList) {
      onAddCertification(cert._id);
    } else {
      const idx = selectedCerts.findIndex(c => c.certificationType === cert._id);
      onEditCertification(idx);
    }
  };

  // Get user cert data considering form state
  const userCert = getUserCertData({
    certDetailsVisible,
    isEditing,
    currentCertIndex,
    selectedCerts,
    pendingCertTypeId,
    certForm,
    certifications,
    certId: cert._id
  });

  // Get missing fields
  const missingFields = !certIsComplete && certInList
    ? getMissingFields(cert, userCert, cert.documentRequired)
    : [];

  return (
    <List.Item
      style={{ padding: '12px 24px' }}
      actions={[
        certIsComplete ? (
          <Button
            key="completed"
            icon={<CheckCircleOutlined />}
            type="text"
            style={{ color: '#52c41a' }}
            disabled
          >
            Completed
          </Button>
        ) : (
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
            size="small"
          >
            Add
          </Button>
        )
      ]}
    >
     
      <List.Item.Meta
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        avatar={
          <Avatar
            icon={(() => {
              if (cert.isVisa) return <GlobalOutlined />;
              const IconComponent = CATEGORY_ICONS[cert.category];
              return IconComponent ? <IconComponent /> : <SafetyCertificateOutlined />;
            })()}
            style={{
              backgroundColor: certIsComplete ? '#52c41a' : '#faad14',
              color: '#fff'
            }}
          />
        }
        title={
          <Space>
            <Text strong>{cert.name}</Text>
            {!isWorkingWithChildrenCheck(cert) && <span style={{ color: 'red' }}>*</span>}
          </Space>
        }
        description={
          !certIsComplete && certInList && missingFields.length > 0 && (
            <div>
              <Text type="danger">
                <WarningOutlined /> Missing:&nbsp;
                {missingFields.map(field => (
                  <Tag color="red" key={field}>
                    {formatFieldLabel(field)}
                  </Tag>
                ))}
              </Text>
            </div>
          )
        }
      />
    </List.Item>
  );
};

export default RequiredCertificationListItem;

