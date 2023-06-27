import React from 'react';
import { Result } from 'antd';
import './index.scss';

const Error404Page: React.FC = () => {
  return (
    <div className="Error404Page">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    </div>
  );
};

export default Error404Page;