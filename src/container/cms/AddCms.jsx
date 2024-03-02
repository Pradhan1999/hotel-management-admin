import { Button, Col, Form, Input, Modal, Row, Select, Spin, Upload, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { UploadOutlined, EyeOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { uploadImage } from '../../utility/services/upload';
import { addCms, getSingleCms, updateCms } from '../../utility/services/cms';

const { Option } = Select;

const AddRoom = ({ setisAddCms, getAllData, setIsEditCms, isEditCms }) => {
  const [filesData, setFilesData] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [isPreviewModal, setIsPreviewModal] = useState(false);
  const [previewTitle, setPreviewTitle] = useState();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [content1Output, setContent1Output] = useState(null);
  console.log('content1Output', content1Output);
  const [content2Output, setContent2Output] = useState(null);

  const handleContent1 = (event, editor) => {
    setContent1Output(editor.getData());
  };
  const handleContent2 = (event, editor) => {
    setContent2Output(editor.getData());
  };

  const [form] = Form.useForm();

  const handleChange = (info) => {
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('file', info.file.originFileObj);

    uploadImage(formData)
      .then((res) => {
        setFilesData((prev) => [
          ...prev,
          {
            id: info.file.uid,
            file: info.file.originFileObj,
            name: res?.data?.name,
          },
        ]);
        setUploadLoading(false);
      })
      .catch((err) => {
        message.error('Error while uploading');
        setUploadLoading(false);
      });
  };

  const handlePreview = async (file_) => {
    const file = file_;
    setPreviewImage(file?.prodUrl ? file?.prodUrl : URL.createObjectURL(file?.file));
    setIsPreviewModal(true);
    setPreviewTitle(file?.file ? file?.file?.name : file?.name);
  };

  const onFinish = (values) => {
    const body = {
      title: values?.title,
      type: values?.type,
      images: filesData && filesData.map((item) => item?.name),
      content1: content1Output,
      content2: content2Output,
    };

    if (isEditCms?.cmsId) {
      updateCms({
        id: isEditCms?.cmsId,
        body: body,
      })
        .then((res) => {
          setIsEditCms({ isOpen: false, cmsId: '' });
          getAllData();
          message.success('Data updated successfully');
        })
        .catch((err) => console.log('err', err));
    } else {
      addCms({
        body: body,
      })
        ?.then((res) => {
          setisAddCms(false);
          getAllData();
          message.success('Data added successfully');
        })
        .catch((err) => {
          console.log('err :>> ', err);
        });
    }
  };

  useEffect(() => {
    // populate single data
    if (isEditCms?.cmsId) {
      setLoading(true);
      getSingleCms({ id: isEditCms?.cmsId })
        .then((res) => {
          form.setFieldsValue(res?.data);
          setContent1Output(res?.data?.content1);
          setContent2Output(res?.data?.content2);

          const file = res?.data?.images.map((item, idx) => ({
            id: idx,
            name: item,
            prodUrl: `https://api.hotelvarunagrand.com/uploads/${item}`,
          }));
          setFilesData(file);
          setLoading(false);
        })
        .catch((err) => {
          console.log('err', err);
          setLoading(false);
        });
    }
  }, [isEditCms?.cmsId]);
  return (
    <>
      <Spin spinning={loading}>
        <div>
          <Form name="cms" form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: 'Required! ',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="type" label="Type">
                  <Select placeholder="Select option..." allowClear>
                    <Option value="Header-Banner">Header-Banner</Option>
                    <Option value="Footer">Footer</Option>
                    <Option value="Contact-Us">Contact-Us</Option>
                    <Option value="About-Us">About-Us</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Image" name="image">
                  <Upload onChange={handleChange} fileList={[]}>
                    <Button className="flex items-center" icon={<UploadOutlined />}>
                      Click to Upload
                    </Button>
                  </Upload>
                  <div className="w-full" style={{ maxHeight: '230px', overflowY: 'auto' }}>
                    {filesData?.length > 0 &&
                      filesData?.map((val) => (
                        <div
                          key={val?.id}
                          className="flex border rounded-md justify-between items-center p-1 px-3 my-1"
                        >
                          <div className="flex">
                            <span className="mr-2">
                              <LinkOutlined />
                            </span>
                            {val?.file ? val?.file?.name : val?.name}
                          </div>
                          <div className="flex gap-3 text-base">
                            <div className="cursor-pointer">
                              <div
                                onClick={() => {
                                  handlePreview(val);
                                }}
                              >
                                <EyeOutlined />
                              </div>
                            </div>
                            <div className="cursor-pointer">
                              <div
                                onClick={() => {
                                  const filteredRemovedFiles = filesData?.filter((elem) =>
                                    elem?.file ? elem?.file?.uid !== val?.id : elem?.id !== val?.id,
                                  );
                                  setFilesData(filteredRemovedFiles);
                                }}
                              >
                                <DeleteOutlined style={{ color: 'red' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <div>
              <label>Content 1:</label>
              <CKEditor data={content1Output} editor={ClassicEditor} onChange={handleContent1} />
            </div>

            <div className="mt-4">
              <label>Content 2:</label>
              <CKEditor data={content2Output} editor={ClassicEditor} onChange={handleContent2} />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button
                onClick={() => {
                  setisAddCms(false);
                  setIsEditCms({ isOpen: false, cmsId: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={uploadLoading}>
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Spin>

      {/* Image preview modal */}
      <Modal
        width={410}
        title={previewTitle}
        open={isPreviewModal}
        footer={null}
        onCancel={() => {
          setIsPreviewModal(false);
          setPreviewImage('');
        }}
        destroyOnClose
      >
        <img src={previewImage ? previewImage : ''} alt={previewImage} style={{ width: '400px' }} />
      </Modal>
    </>
  );
};

export default AddRoom;
