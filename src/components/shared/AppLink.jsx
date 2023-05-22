import React from 'react';

const AppLink = ({ children, href, as = null }) => {
  return (
    <>
      <a href={href}>
        {children}
      </a>

      <style jsx="true">{`
        a {
          color: #212529;
        }
        a:hover {
          color: #931600;
        }
      `}</style>
    </>
  );
};

export default AppLink;
