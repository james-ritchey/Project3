import React from 'react';
import loginNav from "../../login_nav.svg";

const Trigger = ({ triggerText, buttonRef, showModal }) => {
  return (
      <img src={loginNav} className="login-nav" alt="profile" 
      ref={buttonRef} onClick={showModal}/>
  );
};
export default Trigger;
