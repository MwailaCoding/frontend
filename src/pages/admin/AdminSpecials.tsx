import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import TodaysSpecial from '../../components/Admin/TodaysSpecial';

const AdminSpecials = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <TodaysSpecial />
      </div>
    </AdminLayout>
  );
};

export default AdminSpecials;





