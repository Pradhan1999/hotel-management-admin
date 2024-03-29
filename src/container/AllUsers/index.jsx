import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Table } from 'antd';
import { GlobalUtilityStyle } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { getAllUser } from '../../utility/services/users';

const Users = () => {
  const [allUser, setAllUser] = useState([]);
  const PageRoutes = [
    {
      path: '/',
      breadcrumbName: 'Dashboard',
    },
    {
      path: '/users',
      breadcrumbName: 'Users',
    },
  ];

  const getAllUsers = () => {
    getAllUser({})
      .then((res) => {
        if (res) {
          setAllUser(res?.data?.data);
        }
      })
      .catch((err) => console.log('err', err));
  };

  useEffect(() => {
    getAllUsers();
  }, []);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 150,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 150,
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        routes={PageRoutes}
        className="flex items-center justify-between px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <GlobalUtilityStyle className="p-3  ">
        <Row gutter={16}>
          <Col sm={24} xs={24} lg={24} className="">
            <Cards moreBtn={<Button type="primary">Add</Button>} title="Users" border={false} size="default">
              <Table scroll={{ x: '100%', y: 'auto' }} columns={columns} dataSource={allUser} />
            </Cards>
          </Col>
        </Row>
      </GlobalUtilityStyle>
    </>
  );
};

export default Users;
