import React from 'react';
import './form.css';

export const Form = ({ onSubmit, formBtntext, loginSignupState }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group usernameTitle">
        <label htmlFor="name">Username</label>
        <input className="form-control usernameBox" id="name" />
      </div>
      <div className="form-group passwordTitle">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control passwordBox"
          id="password"
          placeholder=""
        />
      </div>
      <div className="form-group">
        <button className="form-control btn btn-danger submit-btn" type="submit">
          {formBtntext}
        </button>
      </div>
      <div className="loginSignupSwitch">
        <a onClick={loginSignupState}>{formBtntext === "Login" ? "Click here to Signup" : "Click here to Login"}</a>
      </div>
    </form>
  );
};
export default Form;