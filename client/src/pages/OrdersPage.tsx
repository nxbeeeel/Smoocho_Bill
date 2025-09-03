import React from 'react';
import OrderHistory from '../components/POS/OrderHistory';
import PremiumLayout from '../components/Layout/PremiumLayout';

const OrdersPage: React.FC = () => {
  return (
    <PremiumLayout>
      <OrderHistory />
    </PremiumLayout>
  );
};

export default OrdersPage;
