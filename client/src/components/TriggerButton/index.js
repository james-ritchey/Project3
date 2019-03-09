import React from 'react';

const Trigger = ({ src, className, triggerText, buttonRef, showModal }) => {
  return (
      <img src={src} className={className} alt="profile" 
      ref={buttonRef} onClick={showModal}/>
  );
};
export default Trigger;
